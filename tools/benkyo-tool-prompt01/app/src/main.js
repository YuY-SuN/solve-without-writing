import { renderProblems } from "./renderers/ProblemRenderer.js";

const RESPONSE_STORAGE_KEY = "benkyo-tool-prompt01:response-values:v1";
const HISTORY_STORAGE_KEY = "benkyo-tool-prompt01:response-history:v1";
const COMPLETION_STORAGE_KEY = "benkyo-tool-prompt01:completed-problems:v1";
const VIEW_SELECTION_STORAGE_KEY = "benkyo-tool-prompt01:view-selection:v1";
const STORAGE_EXPORT_SCHEMA = "benkyo-tool-prompt01-storage-export";
const STORAGE_EXPORT_VERSION = 1;
const MAX_HISTORY_ENTRIES = 10;

const state = {
  showAnswers: false,
  showExplanations: false,
  answerVisibilityOverrides: {},
  explanationVisibilityOverrides: {},
  selectedPageKey: "all",
  selectedDatasetId: null,
  datasetCatalog: [],
  datasetsById: {},
  pageCatalog: [],
  responseValues: {},
  completedProblems: {},
  undoStack: [],
  redoStack: [],
  dataset: null,
};

const elements = {
  title: document.querySelector("#app-title"),
  source: document.querySelector("#app-source"),
  datasetSelect: document.querySelector("#dataset-select"),
  pageFilter: document.querySelector("#page-filter"),
  clearVisible: document.querySelector("#clear-visible"),
  undoClear: document.querySelector("#undo-clear"),
  redoClear: document.querySelector("#redo-clear"),
  toggleAnswers: document.querySelector("#toggle-answers"),
  toggleExplanations: document.querySelector("#toggle-explanations"),
  exportStorage: document.querySelector("#export-storage"),
  importStorage: document.querySelector("#import-storage"),
  importStorageFile: document.querySelector("#import-storage-file"),
  storageTransferStatus: document.querySelector("#storage-transfer-status"),
  pageProgress: document.querySelector("#page-progress"),
  problemList: document.querySelector("#problem-list"),
};

async function loadDatasetCatalog() {
  const res = await fetch("./src/data/index.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load data index: ${res.status}`);
  }
  return res.json();
}

async function loadDataset(datasetPath) {
  const res = await fetch(`./src/data/${datasetPath}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load dataset ${datasetPath}: ${res.status}`);
  }
  return res.json();
}

function cloneSerializable(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function areEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function trimHistory(stack) {
  if (stack.length > MAX_HISTORY_ENTRIES) {
    stack.splice(0, stack.length - MAX_HISTORY_ENTRIES);
  }
}

function makePageKey(datasetId, page) {
  return `${datasetId}::${page}`;
}

function makeProblemCompletionKey(datasetId, page, problemId) {
  return `${datasetId}::${page}::${problemId}`;
}

function makeProblemViewKey(datasetId, page, problemId) {
  return `${datasetId}::${page}::${problemId}`;
}

function getItemResponseKey(problem, item) {
  return item.id ?? `${problem.id}-item-${item.no ?? "response"}`;
}

function getProblemResponseDescriptors(problem) {
  const descriptors = [];

  if (problem.response) {
    descriptors.push({
      key: problem.id,
      response: problem.response,
      answer: problem.answer,
    });
  }

  for (const item of problem.items ?? []) {
    if (item.response) {
      descriptors.push({
        key: getItemResponseKey(problem, item),
        response: item.response,
        answer: item.answer,
      });
    }
  }

  return descriptors;
}

function getProblemResponseKeys(problem) {
  return getProblemResponseDescriptors(problem).map((entry) => entry.key);
}

function findDatasetEntry(datasetId) {
  return state.datasetCatalog.find((entry) => entry.id === datasetId) ?? null;
}

function findPageEntry(pageKey) {
  return state.pageCatalog.find((entry) => entry.key === pageKey) ?? null;
}

function getAllProblems(dataset) {
  return dataset.pages.flatMap((page) =>
    page.problems.map((problem) => ({ ...problem, page: page.page })),
  );
}

function getVisibleProblems() {
  const allProblems = getAllProblems(state.dataset);
  const pageEntry = state.selectedPageKey === "all" ? null : findPageEntry(state.selectedPageKey);

  return pageEntry === null
    ? allProblems
    : allProblems.filter((problem) => String(problem.page) === String(pageEntry.page));
}

function getVisibleResponseKeys() {
  return getVisibleProblems().flatMap((problem) => getProblemResponseKeys(problem));
}

function getProblemViewKey(problem, datasetId = state.selectedDatasetId) {
  return makeProblemViewKey(datasetId, problem.page, problem.id);
}

function getProblemAnswerVisibility(problem) {
  const problemKey = getProblemViewKey(problem);
  return state.answerVisibilityOverrides[problemKey] ?? state.showAnswers;
}

function getProblemExplanationVisibility(problem) {
  const problemKey = getProblemViewKey(problem);
  return state.explanationVisibilityOverrides[problemKey] ?? state.showExplanations;
}

function setProblemVisibilityOverride(kind, problem, isVisible) {
  const overridesKey = kind === "answer"
    ? "answerVisibilityOverrides"
    : "explanationVisibilityOverrides";
  const baseVisible = kind === "answer" ? state.showAnswers : state.showExplanations;
  const problemKey = getProblemViewKey(problem);
  const nextOverrides = { ...state[overridesKey] };

  if (isVisible === baseVisible) {
    delete nextOverrides[problemKey];
  } else {
    nextOverrides[problemKey] = isVisible;
  }

  state[overridesKey] = nextOverrides;
}

function toggleProblemAnswerVisibility(problem) {
  setProblemVisibilityOverride("answer", problem, !getProblemAnswerVisibility(problem));
  render();
}

function toggleProblemExplanationVisibility(problem) {
  setProblemVisibilityOverride("explanation", problem, !getProblemExplanationVisibility(problem));
  render();
}

function syncAnswerVisibility(isVisible) {
  state.showAnswers = isVisible;
  state.answerVisibilityOverrides = {};
  render();
}

function syncExplanationVisibility(isVisible) {
  state.showExplanations = isVisible;
  state.explanationVisibilityOverrides = {};
  render();
}


function setStorageTransferStatus(message, kind = "info") {
  if (!elements.storageTransferStatus) {
    return;
  }

  elements.storageTransferStatus.textContent = message;
  elements.storageTransferStatus.dataset.kind = kind;
}

function buildStorageExportPayload() {
  return {
    schema: STORAGE_EXPORT_SCHEMA,
    version: STORAGE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      responseValues: state.responseValues,
      completedProblems: state.completedProblems,
      history: {
        undoStack: state.undoStack,
        redoStack: state.redoStack,
      },
      viewSelection: {
        datasetId: state.selectedDatasetId,
        pageKey: state.selectedPageKey,
      },
    },
  };
}

function downloadTextFile(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportPersistedState() {
  const payload = buildStorageExportPayload();
  const stamp = payload.exportedAt.slice(0, 19).replace(/[:T]/g, "-");
  downloadTextFile(
    `benkyo-tool-prompt01-storage-${stamp}.json`,
    JSON.stringify(payload, null, 2),
    "application/json",
  );
  setStorageTransferStatus("記憶データを書き出しました。", "success");
}

function parseImportedObject(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("JSON として読めませんでした");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("ファイル形式が不正です");
  }
  if (parsed.schema !== STORAGE_EXPORT_SCHEMA) {
    throw new Error("このツール用のエクスポートファイルではありません");
  }
  if (parsed.version !== STORAGE_EXPORT_VERSION) {
    throw new Error(`未対応のバージョンです: ${parsed.version}`);
  }
  if (!parsed.data || typeof parsed.data !== "object") {
    throw new Error("data セクションが不正です");
  }

  return parsed.data;
}

function sanitizeImportedState(data) {
  const responseValues = data.responseValues && typeof data.responseValues === "object"
    ? data.responseValues
    : {};
  const completedProblems = data.completedProblems && typeof data.completedProblems === "object"
    ? data.completedProblems
    : {};
  const history = data.history && typeof data.history === "object" ? data.history : {};
  const viewSelection = data.viewSelection && typeof data.viewSelection === "object"
    ? data.viewSelection
    : {};

  return {
    responseValues,
    completedProblems,
    undoStack: Array.isArray(history.undoStack) ? history.undoStack : [],
    redoStack: Array.isArray(history.redoStack) ? history.redoStack : [],
    viewSelection: {
      datasetId: typeof viewSelection.datasetId === "string" ? viewSelection.datasetId : null,
      pageKey: typeof viewSelection.pageKey === "string" ? viewSelection.pageKey : "all",
    },
  };
}

async function applyImportedState(importedState) {
  state.responseValues = cloneSerializable(importedState.responseValues) ?? {};
  state.completedProblems = cloneSerializable(importedState.completedProblems) ?? {};
  state.undoStack = cloneSerializable(importedState.undoStack) ?? [];
  state.redoStack = cloneSerializable(importedState.redoStack) ?? [];
  trimHistory(state.undoStack);
  trimHistory(state.redoStack);

  persistResponseValues();
  persistCompletedProblems();
  persistHistoryState();
  sanitizeCompletedProblems();

  const viewSelection = importedState.viewSelection ?? { datasetId: null, pageKey: "all" };
  const fallbackDatasetId = state.datasetCatalog[0]?.id ?? null;

  if (viewSelection.pageKey !== "all" && findPageEntry(viewSelection.pageKey)) {
    await applyPageSelection(viewSelection.pageKey);
    return;
  }

  if (viewSelection.datasetId && findDatasetEntry(viewSelection.datasetId)) {
    await applyDataset(viewSelection.datasetId, "all");
    return;
  }

  if (fallbackDatasetId) {
    await applyDataset(fallbackDatasetId, "all");
  } else {
    render();
  }
}

async function importPersistedState(file) {
  const rawText = await file.text();
  const parsed = parseImportedObject(rawText);
  const importedState = sanitizeImportedState(parsed);
  await applyImportedState(importedState);
  setStorageTransferStatus("記憶データを読み込みました。", "success");
}

function buildPageCatalog(catalog, datasetsById) {
  const pages = [];

  for (const entry of catalog.datasets) {
    const dataset = datasetsById[entry.id];
    for (const page of dataset.pages ?? []) {
      pages.push({
        key: makePageKey(entry.id, page.page),
        datasetId: entry.id,
        datasetLabel: entry.label,
        page: page.page,
      });
    }
  }

  return pages.sort((left, right) => {
    if (left.page !== right.page) {
      return left.page - right.page;
    }
    return left.datasetLabel.localeCompare(right.datasetLabel, "ja");
  });
}

function populateDatasetSelect(catalog) {
  elements.datasetSelect.innerHTML = "";
  for (const entry of catalog.datasets) {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.label;
    elements.datasetSelect.appendChild(option);
  }
}

function populatePageFilter(pageCatalog, progressMap) {
  elements.pageFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "すべて（現在の問題セット）";
  elements.pageFilter.appendChild(allOption);

  for (const entry of pageCatalog) {
    const option = document.createElement("option");
    option.value = entry.key;
    option.textContent = formatPageOptionLabel(entry, progressMap);
    elements.pageFilter.appendChild(option);
  }
}

function refreshPageFilterLabels(progressMap) {
  const options = [...elements.pageFilter.querySelectorAll("option")];

  for (const option of options) {
    if (option.value === "all") {
      option.textContent = "すべて（現在の問題セット）";
      continue;
    }

    const entry = findPageEntry(option.value);
    if (!entry) {
      continue;
    }

    option.textContent = formatPageOptionLabel(entry, progressMap);
  }
}

function updateToolbar() {
  elements.clearVisible.textContent = state.selectedPageKey === "all" ? "表示中をクリア" : "このページをクリア";
  elements.clearVisible.disabled = getVisibleResponseKeys().length === 0;
  elements.undoClear.disabled = state.undoStack.length === 0;
  elements.redoClear.disabled = state.redoStack.length === 0;
  elements.toggleAnswers.textContent = state.showAnswers ? "答えを隠す" : "答えを表示";
  elements.toggleExplanations.textContent = state.showExplanations
    ? "解説を隠す"
    : "解説を表示";
}

function updateHeader() {
  const selectedEntry = findDatasetEntry(state.selectedDatasetId);
  if (!selectedEntry || !state.dataset) {
    return;
  }

  elements.title.textContent = state.dataset.meta.title;

  const sourceParts = [selectedEntry.label];
  if (state.selectedPageKey !== "all") {
    const pageEntry = findPageEntry(state.selectedPageKey);
    if (pageEntry) {
      sourceParts.push(`${pageEntry.page}ページ`);
    }
  }
  sourceParts.push(state.dataset.meta.source, `v${state.dataset.meta.version}`);
  elements.source.textContent = sourceParts.join(" / ");
}

function loadPersistedJson(storageKey) {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistJson(storageKey, value) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    if (value === null) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    }
  } catch {
    // Ignore browser persistence errors.
  }
}

function loadPersistedResponseValues() {
  const parsed = loadPersistedJson(RESPONSE_STORAGE_KEY);
  return parsed && typeof parsed === "object" ? parsed : {};
}

function loadPersistedCompletedProblems() {
  const parsed = loadPersistedJson(COMPLETION_STORAGE_KEY);
  return parsed && typeof parsed === "object" ? parsed : {};
}

function persistResponseValues() {
  persistJson(RESPONSE_STORAGE_KEY, state.responseValues);
}

function persistCompletedProblems() {
  persistJson(COMPLETION_STORAGE_KEY, state.completedProblems);
}

function loadPersistedViewSelection() {
  const parsed = loadPersistedJson(VIEW_SELECTION_STORAGE_KEY);
  if (!parsed || typeof parsed !== "object") {
    return { datasetId: null, pageKey: "all" };
  }

  return {
    datasetId: typeof parsed.datasetId === "string" ? parsed.datasetId : null,
    pageKey: typeof parsed.pageKey === "string" ? parsed.pageKey : "all",
  };
}

function persistViewSelection() {
  persistJson(VIEW_SELECTION_STORAGE_KEY, {
    datasetId: state.selectedDatasetId,
    pageKey: state.selectedPageKey,
  });
}

function loadPersistedHistoryState() {
  const parsed = loadPersistedJson(HISTORY_STORAGE_KEY);
  if (!parsed || typeof parsed !== "object") {
    return { undoStack: [], redoStack: [] };
  }

  return {
    undoStack: Array.isArray(parsed.undoStack) ? parsed.undoStack : [],
    redoStack: Array.isArray(parsed.redoStack) ? parsed.redoStack : [],
  };
}

function persistHistoryState() {
  persistJson(HISTORY_STORAGE_KEY, {
    undoStack: state.undoStack,
    redoStack: state.redoStack,
  });
}

function commitResponseValues(nextResponseValues) {
  const previous = cloneSerializable(state.responseValues);
  const next = cloneSerializable(nextResponseValues) ?? {};

  if (areEqual(previous, next)) {
    return false;
  }

  state.undoStack.push(previous);
  trimHistory(state.undoStack);
  state.redoStack = [];
  state.responseValues = next;
  persistResponseValues();
  persistHistoryState();
  return true;
}

function isNonEmptyValue(value) {
  if (typeof value === "string") {
    return value.trim() !== "";
  }
  return value !== null && value !== undefined;
}

function isResponseComplete(response, value, answer) {
  if (!response || response.type === "none") {
    return true;
  }

  if (response.type === "blank" || response.type === "free_text") {
    return isNonEmptyValue(value);
  }

  if (response.type === "multi_blank") {
    return (response.fields ?? []).every((field) => isNonEmptyValue(value?.[field.key]));
  }

  if (response.type === "choice") {
    if (response.multiple) {
      return Array.isArray(value) && value.length > 0;
    }
    return isNonEmptyValue(value);
  }

  if (response.type === "table_fill") {
    return (response.targets ?? []).every((target) => isNonEmptyValue(value?.[target.key]));
  }

  if (response.type === "draw_graph") {
    if (Array.isArray(answer?.value)) {
      return Array.isArray(value) && value.length === answer.value.length;
    }

    if (Array.isArray(answer?.value?.bins)) {
      return Array.isArray(value?.bins) && value.bins.length === answer.value.bins.length;
    }

    return false;
  }

  if (response.type === "draw_point") {
    const expectedKeys = Object.keys(answer?.value ?? {});
    if (expectedKeys.length === 0) {
      return false;
    }
    return expectedKeys.every((key) => isNonEmptyValue(value?.[key]));
  }

  return false;
}

function getProblemCompletionStatus(problem, datasetId = state.selectedDatasetId) {
  const descriptors = getProblemResponseDescriptors(problem);
  const incompleteCount = descriptors.filter(
    (entry) => !isResponseComplete(entry.response, state.responseValues[entry.key], entry.answer),
  ).length;
  const isCompletable = incompleteCount === 0;
  const completionKey = makeProblemCompletionKey(datasetId, problem.page, problem.id);
  const isComplete = isCompletable && Boolean(state.completedProblems[completionKey]);

  let message = "";
  if (!isCompletable) {
    message = incompleteCount === 1
      ? "入力が1か所そろうと完了にできます"
      : `入力が${incompleteCount}か所そろうと完了にできます`;
  } else if (isComplete) {
    message = "この問題は完了です";
  } else if (descriptors.length === 0) {
    message = "入力欄はありません。完了を付けられます";
  } else {
    message = "入力済みです。完了を付けられます";
  }

  return {
    isCompletable,
    isComplete,
    message,
    completionKey,
  };
}

function sanitizeCompletedProblems() {
  const nextCompletedProblems = {};

  for (const entry of state.datasetCatalog) {
    const dataset = state.datasetsById[entry.id];
    for (const page of dataset?.pages ?? []) {
      for (const problem of page.problems ?? []) {
        const problemWithPage = { ...problem, page: page.page };
        const status = getProblemCompletionStatus(problemWithPage, entry.id);
        if (status.isComplete) {
          nextCompletedProblems[status.completionKey] = true;
        }
      }
    }
  }

  if (!areEqual(state.completedProblems, nextCompletedProblems)) {
    state.completedProblems = nextCompletedProblems;
    persistCompletedProblems();
  }
}

function toggleProblemComplete(problem, shouldComplete) {
  const status = getProblemCompletionStatus(problem);
  const nextCompletedProblems = { ...state.completedProblems };

  if (shouldComplete && status.isCompletable) {
    nextCompletedProblems[status.completionKey] = true;
  } else {
    delete nextCompletedProblems[status.completionKey];
  }

  if (!areEqual(state.completedProblems, nextCompletedProblems)) {
    state.completedProblems = nextCompletedProblems;
    persistCompletedProblems();
  }

  renderProgressViews();
}

function buildPageProgressMap() {
  const summaries = {};

  for (const entry of state.datasetCatalog) {
    const dataset = state.datasetsById[entry.id];
    for (const page of dataset?.pages ?? []) {
      const problems = page.problems.map((problem) => ({ ...problem, page: page.page }));
      const completeCount = problems.filter(
        (problem) => getProblemCompletionStatus(problem, entry.id).isComplete,
      ).length;

      summaries[makePageKey(entry.id, page.page)] = {
        totalCount: problems.length,
        completeCount,
        remainingCount: problems.length - completeCount,
      };
    }
  }

  return summaries;
}

function formatPageOptionLabel(entry, progressMap) {
  const progress = progressMap?.[entry.key];
  if (!progress) {
    return `${entry.page}ページ / ${entry.datasetLabel}`;
  }
  return `${entry.page}ページ / ${entry.datasetLabel} / ${progress.completeCount}/${progress.totalCount} 完了`;
}

function renderPageProgress(progressMap) {
  const dataset = state.datasetsById[state.selectedDatasetId];
  elements.pageProgress.innerHTML = "";

  if (!dataset) {
    return;
  }

  const list = document.createElement("div");
  list.className = "page-progress-grid";

  for (const page of dataset.pages ?? []) {
    const pageKey = makePageKey(state.selectedDatasetId, page.page);
    const summary = progressMap[pageKey] ?? {
      totalCount: page.problems.length,
      completeCount: 0,
      remainingCount: page.problems.length,
    };

    const card = document.createElement("article");
    card.className = "page-progress-card";
    if (state.selectedPageKey === pageKey) {
      card.dataset.active = "true";
    }

    const title = document.createElement("p");
    title.className = "page-progress-title";
    title.textContent = `${page.page}ページ`;

    const counts = document.createElement("p");
    counts.className = "page-progress-counts";
    counts.textContent = `${summary.completeCount}/${summary.totalCount} 完了`;

    const remaining = document.createElement("p");
    remaining.className = "page-progress-remaining";
    remaining.textContent = `残り ${summary.remainingCount}問`;

    card.append(title, counts, remaining);
    list.appendChild(card);
  }

  elements.pageProgress.appendChild(list);
}

function renderProgressViews() {
  const progressMap = buildPageProgressMap();
  refreshPageFilterLabels(progressMap);
  renderPageProgress(progressMap);
}

function handleResponseChange(responseKey, valueOrUpdater) {
  const currentValue = state.responseValues[responseKey];
  const nextValue =
    typeof valueOrUpdater === "function"
      ? valueOrUpdater(currentValue)
      : valueOrUpdater;

  if (areEqual(currentValue, nextValue)) {
    return;
  }

  const nextResponseValues = { ...state.responseValues };
  nextResponseValues[responseKey] = cloneSerializable(nextValue);

  if (commitResponseValues(nextResponseValues)) {
    sanitizeCompletedProblems();
    renderProgressViews();
  }
}

function clearResponseKeys(responseKeys) {
  const nextResponseValues = { ...state.responseValues };

  for (const responseKey of new Set(responseKeys)) {
    delete nextResponseValues[responseKey];
  }

  if (commitResponseValues(nextResponseValues)) {
    sanitizeCompletedProblems();
    render();
  }
}

function clearProblemResponses(problem) {
  clearResponseKeys(getProblemResponseKeys(problem));
}

function clearVisibleResponses() {
  clearResponseKeys(getVisibleResponseKeys());
}

function undoHistory() {
  if (state.undoStack.length === 0) {
    return;
  }

  const current = cloneSerializable(state.responseValues);
  const previous = state.undoStack.pop();
  state.redoStack.push(current);
  trimHistory(state.redoStack);
  state.responseValues = cloneSerializable(previous) ?? {};
  persistResponseValues();
  persistHistoryState();
  sanitizeCompletedProblems();
  render();
}

function redoHistory() {
  if (state.redoStack.length === 0) {
    return;
  }

  const current = cloneSerializable(state.responseValues);
  const next = state.redoStack.pop();
  state.undoStack.push(current);
  trimHistory(state.undoStack);
  state.responseValues = cloneSerializable(next) ?? {};
  persistResponseValues();
  persistHistoryState();
  sanitizeCompletedProblems();
  render();
}

function render() {
  const visibleProblems = getVisibleProblems();

  renderProblems(elements.problemList, visibleProblems, {
    getProblemAnswerVisibility,
    getProblemExplanationVisibility,
    onToggleProblemAnswerVisibility: toggleProblemAnswerVisibility,
    onToggleProblemExplanationVisibility: toggleProblemExplanationVisibility,
    responseValues: state.responseValues,
    onResponseChange: handleResponseChange,
    onClearProblem: clearProblemResponses,
    getProblemCompletionStatus,
    onToggleProblemComplete: toggleProblemComplete,
    onProblemStatusChange: renderProgressViews,
  });
  renderProgressViews();
  updateToolbar();
}

async function applyDataset(datasetId, pageKey = "all") {
  const selectedEntry = findDatasetEntry(datasetId);
  if (!selectedEntry) {
    throw new Error(`Unknown dataset: ${datasetId}`);
  }

  state.dataset = state.datasetsById[selectedEntry.id];
  state.selectedDatasetId = selectedEntry.id;
  state.selectedPageKey = pageKey;

  elements.datasetSelect.value = selectedEntry.id;
  elements.pageFilter.value = pageKey;
  persistViewSelection();
  updateHeader();
  render();
}

async function applyPageSelection(pageKey) {
  if (pageKey === "all") {
    await applyDataset(state.selectedDatasetId, "all");
    return;
  }

  const pageEntry = findPageEntry(pageKey);
  if (!pageEntry) {
    throw new Error(`Unknown page selection: ${pageKey}`);
  }

  await applyDataset(pageEntry.datasetId, pageEntry.key);
}

async function bootstrap() {
  state.responseValues = loadPersistedResponseValues();
  state.completedProblems = loadPersistedCompletedProblems();
  const persistedViewSelection = loadPersistedViewSelection();
  const historyState = loadPersistedHistoryState();
  state.undoStack = historyState.undoStack;
  state.redoStack = historyState.redoStack;
  trimHistory(state.undoStack);
  trimHistory(state.redoStack);

  const catalog = await loadDatasetCatalog();
  state.datasetCatalog = catalog.datasets;

  if (!Array.isArray(state.datasetCatalog) || state.datasetCatalog.length === 0) {
    throw new Error("No datasets defined in src/data/index.json");
  }

  const datasets = await Promise.all(
    state.datasetCatalog.map(async (entry) => [entry.id, await loadDataset(entry.path)]),
  );
  state.datasetsById = Object.fromEntries(datasets);
  state.pageCatalog = buildPageCatalog(catalog, state.datasetsById);
  sanitizeCompletedProblems();

  const progressMap = buildPageProgressMap();
  populateDatasetSelect(catalog);
  populatePageFilter(state.pageCatalog, progressMap);

  elements.datasetSelect.addEventListener("change", async (event) => {
    await applyDataset(event.target.value, "all");
  });

  elements.pageFilter.addEventListener("change", async (event) => {
    await applyPageSelection(event.target.value);
  });

  elements.clearVisible.addEventListener("click", () => {
    clearVisibleResponses();
  });

  elements.undoClear.addEventListener("click", () => {
    undoHistory();
  });

  elements.redoClear.addEventListener("click", () => {
    redoHistory();
  });

  elements.toggleAnswers.addEventListener("click", () => {
    syncAnswerVisibility(!state.showAnswers);
  });

  elements.toggleExplanations.addEventListener("click", () => {
    syncExplanationVisibility(!state.showExplanations);
  });

  elements.exportStorage.addEventListener("click", () => {
    exportPersistedState();
  });

  elements.importStorage.addEventListener("click", () => {
    elements.importStorageFile.click();
  });

  elements.importStorageFile.addEventListener("change", async (event) => {
    const [file] = event.target.files ?? [];
    event.target.value = "";
    if (!file) {
      return;
    }

    try {
      await importPersistedState(file);
    } catch (error) {
      setStorageTransferStatus(`読み込みに失敗しました: ${error.message}`, "error");
    }
  });

  const fallbackDatasetId = catalog.defaultDatasetId ?? state.datasetCatalog[0].id;
  const hasPersistedPage =
    persistedViewSelection.pageKey !== "all" && findPageEntry(persistedViewSelection.pageKey);
  const hasPersistedDataset = persistedViewSelection.datasetId
    && findDatasetEntry(persistedViewSelection.datasetId);

  if (hasPersistedPage) {
    await applyPageSelection(persistedViewSelection.pageKey);
    return;
  }

  if (hasPersistedDataset) {
    await applyDataset(persistedViewSelection.datasetId, "all");
    return;
  }

  await applyDataset(fallbackDatasetId, "all");
}

bootstrap().catch((error) => {
  elements.problemList.innerHTML = "";
  const message = document.createElement("p");
  message.className = "error-message";
  message.textContent = `読み込みに失敗しました: ${error.message}`;
  elements.problemList.appendChild(message);
});
