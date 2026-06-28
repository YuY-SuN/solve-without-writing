import { renderProblems } from "./renderers/ProblemRenderer.js?v20260628-2";
import { renderVisualList } from "./renderers/VisualRenderer.js?v20260617-1";

const RESPONSE_STORAGE_KEY = "benkyo-tool-prompt01:response-values:v1";
const WORK_STORAGE_KEY = "benkyo-tool-prompt01:work-values:v1";
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
  workValues: {},
  completedProblems: {},
  undoStack: [],
  redoStack: [],
  dataset: null,
  transferMode: false,
  transferContentMode: "response",
};

const elements = {
  appShell: document.querySelector(".app-shell"),
  title: document.querySelector("#app-title"),
  source: document.querySelector("#app-source"),
  datasetSelect: document.querySelector("#dataset-select"),
  pageFilter: document.querySelector("#page-filter"),
  clearVisible: document.querySelector("#clear-visible"),
  undoClear: document.querySelector("#undo-clear"),
  redoClear: document.querySelector("#redo-clear"),
  toggleAnswers: document.querySelector("#toggle-answers"),
  toggleExplanations: document.querySelector("#toggle-explanations"),
  toggleTransferMode: document.querySelector("#toggle-transfer-mode"),
  toggleTransferContent: document.querySelector("#toggle-transfer-content"),
  printTransfer: document.querySelector("#print-transfer"),
  exportStorage: document.querySelector("#export-storage"),
  importStorage: document.querySelector("#import-storage"),
  importStorageFile: document.querySelector("#import-storage-file"),
  storageTransferStatus: document.querySelector("#storage-transfer-status"),
  pageProgressPanel: document.querySelector(".page-progress-panel"),
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

function getItemWorkKey(problem, item) {
  return item.id ?? `${problem.id}-item-${item.no ?? "work"}`;
}

function collectResponseDescriptors(owner, items, descriptors) {
  for (const item of items ?? []) {
    if (item.response) {
      descriptors.push({
        key: getItemResponseKey(owner, item),
        response: item.response,
        answer: item.answer,
      });
    }

    if (item.items?.length) {
      collectResponseDescriptors(owner, item.items, descriptors);
    }
  }
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

  collectResponseDescriptors(problem, problem.items, descriptors);
  return descriptors;
}

function getProblemResponseKeys(problem) {
  return getProblemResponseDescriptors(problem).map((entry) => entry.key);
}
function collectWorkKeys(owner, items, keys) {
  for (const item of items ?? []) {
    if (item.work) {
      keys.push(getItemWorkKey(owner, item));
    }
    if (item.items?.length) {
      collectWorkKeys(owner, item.items, keys);
    }
  }
}

function getProblemWorkKeys(problem) {
  const keys = [];
  if (problem.work) {
    keys.push(problem.id);
  }
  collectWorkKeys(problem, problem.items, keys);
  return keys;
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

function getVisibleWorkKeys() {
  return getVisibleProblems().flatMap((problem) => getProblemWorkKeys(problem));
}

function getVisibleCompletedProblems() {
  return getVisibleProblems().filter((problem) => getProblemCompletionStatus(problem).isComplete);
}

function getTransferProblems() {
  return getAllProblems(state.dataset).filter((problem) => getProblemCompletionStatus(problem).isComplete);
}

function cloneDeep(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function applyNamedValuesToVisual(value, mapping = {}) {
  if (Array.isArray(value)) {
    return value.map((entry) => applyNamedValuesToVisual(entry, mapping));
  }

  if (value && typeof value === "object") {
    if (value.blank === true && value.key && Object.prototype.hasOwnProperty.call(mapping, value.key)) {
      return mapping[value.key];
    }

    const next = {};
    for (const [key, entry] of Object.entries(value)) {
      next[key] = applyNamedValuesToVisual(entry, mapping);
    }
    return next;
  }

  return value;
}

function normalizePointListFromValue(rawValue) {
  if (Array.isArray(rawValue)) {
    return rawValue.map((entry) => ({ label: "", value: typeof entry === "object" && entry?.type === "fraction" ? entry.numerator / entry.denominator : entry }))
      .filter((entry) => typeof entry.value === "number");
  }

  if (rawValue && typeof rawValue === "object") {
    if (Array.isArray(rawValue.points)) {
      return rawValue.points.map((entry) => ({ label: "", value: entry })).filter((entry) => typeof entry.value === "number");
    }

    return Object.entries(rawValue).map(([label, value]) => ({ label, value })).filter((entry) => typeof entry.value === "number");
  }

  return [];
}

function buildHistogramVisual(template, rawValue) {
  if (!template || !rawValue || !Array.isArray(rawValue.bins)) {
    return null;
  }
  const next = cloneDeep(template);
  next.values = rawValue.bins.map((entry) => Number(entry) || 0);
  return next;
}

function buildNumberLineVisual(template, rawValue) {
  if (!template) {
    return null;
  }
  const points = normalizePointListFromValue(rawValue);
  const next = cloneDeep(template);
  next.points = [
    ...(Array.isArray(template.points) ? template.points : []),
    ...points,
  ];
  return next;
}

function buildTransferVisualsForNode(node, responseValue) {
  const mode = state.transferContentMode;
  const visuals = [];
  const problemResponse = node.response?.type && node.response.type !== "none" ? node.response : null;

  for (const visual of node.visuals ?? []) {
    if (visual.type === "table" || visual.type === "factorization_ladder") {
      if (mode === "response" && problemResponse && responseValue && typeof responseValue === "object") {
        visuals.push(applyNamedValuesToVisual(cloneDeep(visual), responseValue));
        continue;
      }
      if (mode === "answer" && node.answer?.value && typeof node.answer.value === "object") {
        visuals.push(applyNamedValuesToVisual(cloneDeep(visual), node.answer.value));
        continue;
      }
      visuals.push(cloneDeep(visual));
      continue;
    }

    if (visual.type === "number_line" && problemResponse?.type === "draw_graph") {
      const source = mode === "answer" ? (node.answer?.value?.points ?? node.answer?.value) : responseValue;
      const nextVisual = buildNumberLineVisual(visual, source);
      visuals.push(nextVisual ?? cloneDeep(visual));
      continue;
    }

    if (visual.type === "number_line" && problemResponse?.type === "draw_point") {
      const source = mode === "answer" ? node.answer?.value : responseValue;
      const nextVisual = buildNumberLineVisual(visual, source);
      visuals.push(nextVisual ?? cloneDeep(visual));
      continue;
    }

    if (visual.type === "graph_grid" && problemResponse?.type === "draw_graph") {
      const histogramTemplate = (node.answerVisuals ?? []).find((entry) => entry.type === "histogram") ?? null;
      const source = mode === "answer" ? node.answer?.value : responseValue;
      const histogram = buildHistogramVisual(histogramTemplate, source);
      visuals.push(histogram ?? cloneDeep(visual));
      continue;
    }

    visuals.push(cloneDeep(visual));
  }

  if (mode === "answer" && visuals.length === 0 && (node.answerVisuals?.length ?? 0) > 0) {
    return cloneDeep(node.answerVisuals);
  }

  return visuals;
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
      workValues: state.workValues,
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
  const workValues = data.workValues && typeof data.workValues === "object"
    ? data.workValues
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
    workValues,
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
  const migratedResponseState = migrateResponseValuesWithDataset(importedState.responseValues, state.datasetsById);
  const migratedUndoStack = migrateHistoryStackWithDataset(importedState.undoStack, state.datasetsById);
  const migratedRedoStack = migrateHistoryStackWithDataset(importedState.redoStack, state.datasetsById);

  state.responseValues = migratedResponseState.responseValues;
  state.workValues = cloneSerializable(importedState.workValues) ?? {};
  state.completedProblems = cloneSerializable(importedState.completedProblems) ?? {};
  state.undoStack = migratedUndoStack.historyStack;
  state.redoStack = migratedRedoStack.historyStack;
  trimHistory(state.undoStack);
  trimHistory(state.redoStack);

  persistResponseValues();
  persistWorkValues();
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
  const transferProblems = state.dataset ? getTransferProblems() : [];
  elements.clearVisible.textContent = state.selectedPageKey === "all" ? "表示中をクリア" : "このページをクリア";
  elements.clearVisible.disabled = state.transferMode || (getVisibleResponseKeys().length === 0 && getVisibleWorkKeys().length === 0);
  elements.undoClear.disabled = state.transferMode || state.undoStack.length === 0;
  elements.redoClear.disabled = state.transferMode || state.redoStack.length === 0;
  elements.toggleAnswers.textContent = state.showAnswers ? "答えを隠す" : "答えを表示";
  elements.toggleExplanations.textContent = state.showExplanations
    ? "解説を隠す"
    : "解説を表示";
  elements.toggleAnswers.disabled = state.transferMode;
  elements.toggleExplanations.disabled = state.transferMode;
  elements.toggleTransferMode.textContent = state.transferMode ? "通常表示に戻る" : "転記モード";
  elements.toggleTransferContent.disabled = !state.transferMode;
  elements.toggleTransferContent.textContent = state.transferContentMode === "answer"
    ? "転記内容: 解答"
    : "転記内容: 入力内容";
  elements.pageFilter.disabled = state.transferMode;
  elements.printTransfer.disabled = !state.transferMode || transferProblems.length === 0;
  elements.printTransfer.textContent = transferProblems.length > 0
    ? `転記を印刷 (${transferProblems.length}問)`
    : "転記を印刷";
  if (elements.appShell) {
    elements.appShell.dataset.viewMode = state.transferMode ? "transfer" : "normal";
  }
  if (elements.pageProgressPanel) {
    elements.pageProgressPanel.dataset.mode = state.transferMode ? "transfer" : "normal";
  }
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

function loadPersistedWorkValues() {
  const parsed = loadPersistedJson(WORK_STORAGE_KEY);
  return parsed && typeof parsed === "object" ? parsed : {};
}

function fillMissingResponseFields(rawValue, response, answer) {
  if (response?.type !== "multi_blank") {
    return { value: rawValue, changed: false };
  }

  if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
    return { value: rawValue, changed: false };
  }

  if (!answer?.value || typeof answer.value !== "object" || Array.isArray(answer.value)) {
    return { value: rawValue, changed: false };
  }

  let changed = false;
  const nextValue = { ...rawValue };

  for (const field of response.fields ?? []) {
    const fieldKey = field.key;
    const hasStoredValue = isNonEmptyValue(nextValue[fieldKey]);
    const hasAnswerValue = isNonEmptyValue(answer.value[fieldKey]);
    if (!hasStoredValue && hasAnswerValue) {
      nextValue[fieldKey] = cloneSerializable(answer.value[fieldKey]);
      changed = true;
    }
  }

  return { value: changed ? nextValue : rawValue, changed };
}

function migrateResponseValuesWithDataset(responseValues, datasetsById = {}) {
  const nextResponseValues = cloneSerializable(responseValues) ?? {};
  let changed = false;

  for (const dataset of Object.values(datasetsById)) {
    for (const page of dataset?.pages ?? []) {
      for (const problem of page.problems ?? []) {
        const descriptors = getProblemResponseDescriptors(problem);
        for (const descriptor of descriptors) {
          if (!Object.prototype.hasOwnProperty.call(nextResponseValues, descriptor.key)) {
            continue;
          }
          const migrated = fillMissingResponseFields(
            nextResponseValues[descriptor.key],
            descriptor.response,
            descriptor.answer,
          );
          if (migrated.changed) {
            nextResponseValues[descriptor.key] = migrated.value;
            changed = true;
          }
        }
      }
    }
  }

  return { responseValues: nextResponseValues, changed };
}

function migrateHistoryStackWithDataset(historyStack, datasetsById = {}) {
  if (!Array.isArray(historyStack)) {
    return { historyStack: [], changed: false };
  }

  let changed = false;
  const nextHistoryStack = historyStack.map((entry) => {
    const migrated = migrateResponseValuesWithDataset(entry, datasetsById);
    changed = changed || migrated.changed;
    return migrated.responseValues;
  });

  return { historyStack: nextHistoryStack, changed };
}

function loadPersistedCompletedProblems() {
  const parsed = loadPersistedJson(COMPLETION_STORAGE_KEY);
  return parsed && typeof parsed === "object" ? parsed : {};
}

function persistResponseValues() {
  persistJson(RESPONSE_STORAGE_KEY, state.responseValues);
}

function persistWorkValues() {
  persistJson(WORK_STORAGE_KEY, state.workValues);
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

  if (response.type === "table_fill" || response.type === "ladder_fill") {
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

function renderTransferSummary(datasetProblems, completedProblems) {
  elements.pageProgress.innerHTML = "";
  const card = document.createElement("article");
  card.className = "transfer-summary-card";

  const title = document.createElement("p");
  title.className = "page-progress-title";
  title.textContent = state.transferContentMode === "answer" ? "転記モード: 解答" : "転記モード: 入力内容";

  const counts = document.createElement("p");
  counts.className = "page-progress-counts";
  counts.textContent = `${completedProblems.length}/${datasetProblems.length} 問を転記対象として表示`;

  const note = document.createElement("p");
  note.className = "page-progress-remaining";
  note.textContent = "現在の問題セットの全ページから完了済み問題だけを抽出しています。ページ絞り込みは転記モード中は無効です。";

  card.append(title, counts, note);
  elements.pageProgress.appendChild(card);
}

function formatTransferPrimitive(value) {
  if (value === null || value === undefined) {
    return "未入力";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? "未入力" : trimmed;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts = value.map((entry) => formatTransferPrimitive(entry)).filter((entry) => entry !== "未入力");
    return parts.length > 0 ? parts.join("、") : "未入力";
  }

  if (typeof value === "object") {
    if (typeof value.formula === "string") {
      return value.formula;
    }
    if (value.type === "fraction" && Number.isFinite(value.numerator) && Number.isFinite(value.denominator)) {
      return `${value.numerator}/${value.denominator}`;
    }
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function formatTransferNamedObject(value, labels = null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return formatTransferPrimitive(value);
  }

  const entries = labels
    ? labels.map((entry) => [entry.key, entry.label ?? entry.key])
    : Object.keys(value).map((key) => [key, key]);

  const parts = [];
  for (const [key, label] of entries) {
    if (!(key in value)) {
      continue;
    }
    parts.push(`${label}: ${formatTransferPrimitive(value[key])}`);
  }

  for (const [key, entryValue] of Object.entries(value)) {
    if (entries.some(([entryKey]) => entryKey === key)) {
      continue;
    }
    parts.push(`${key}: ${formatTransferPrimitive(entryValue)}`);
  }

  return parts.length > 0 ? parts.join(" / ") : "未入力";
}

function formatTransferDrawGraphValue(rawValue, answerVisuals = []) {
  if (Array.isArray(rawValue)) {
    return rawValue.map((entry) => formatTransferPrimitive(entry)).join("、");
  }

  if (rawValue && typeof rawValue === "object") {
    if (Array.isArray(rawValue.points)) {
      return rawValue.points.map((entry) => formatTransferPrimitive(entry)).join("、");
    }

    if (Array.isArray(rawValue.bins)) {
      const histogram = (answerVisuals ?? []).find((visual) => visual.type === "histogram");
      if (histogram?.xAxis?.bins) {
        return rawValue.bins.map((entry, index) => {
          const bin = histogram.xAxis.bins[index];
          const label = bin ? `${bin.from}-${bin.to}` : `bin${index + 1}`;
          return `${label}: ${formatTransferPrimitive(entry)}`;
        }).join(" / ");
      }
      return rawValue.bins.map((entry, index) => `bin${index + 1}: ${formatTransferPrimitive(entry)}`).join(" / ");
    }
  }

  return formatTransferPrimitive(rawValue);
}

function formatTransferResponseValue(response, rawValue, answer = null, answerVisuals = []) {
  if (!response) {
    return formatTransferPrimitive(rawValue);
  }

  if (response.type === "blank") {
    const base = formatTransferPrimitive(rawValue);
    return response.unit && base !== "未入力" ? `${base}${response.unit}` : base;
  }

  if (response.type === "free_text") {
    return formatTransferPrimitive(rawValue);
  }

  if (response.type === "multi_blank") {
    return formatTransferNamedObject(rawValue, response.fields ?? []);
  }

  if (response.type === "choice") {
    const selectedValues = response.multiple
      ? (Array.isArray(rawValue) ? rawValue : [])
      : [rawValue].filter((value) => value !== null && value !== undefined && value !== "");
    const labels = selectedValues.map((value) => {
      const choice = (response.choices ?? []).find((entry) => (entry.key ?? entry.text ?? "") === value);
      return choice?.text ?? String(value);
    });
    return labels.length > 0 ? labels.join("、") : "未入力";
  }

  if (response.type === "table_fill" || response.type === "ladder_fill") {
    return formatTransferNamedObject(rawValue, response.targets ?? []);
  }

  if (response.type === "draw_point") {
    const labels = Object.keys(answer?.value ?? {}).map((key) => ({ key, label: key }));
    return formatTransferNamedObject(rawValue, labels);
  }

  if (response.type === "draw_graph") {
    return formatTransferDrawGraphValue(rawValue, answerVisuals);
  }

  return formatTransferPrimitive(rawValue);
}

function formatTransferAnswerValue(answer, response = null, answerVisuals = []) {
  if (!answer) {
    return "答えデータなし";
  }

  if (typeof answer.display === "string") {
    return answer.display;
  }

  if (Array.isArray(answer.display)) {
    return answer.display.join("、");
  }

  if (response?.type === "multi_blank") {
    return formatTransferNamedObject(answer.value, response.fields ?? []);
  }

  if (response?.type === "table_fill" || response?.type === "ladder_fill") {
    return formatTransferNamedObject(answer.value, response.targets ?? []);
  }

  if (response?.type === "draw_point") {
    const labels = Object.keys(answer.value ?? {}).map((key) => ({ key, label: key }));
    const relation = answer.relation ? ` (${answer.relation})` : "";
    return `${formatTransferNamedObject(answer.value, labels)}${relation}`;
  }

  if (response?.type === "draw_graph") {
    if (answer?.value?.points) {
      return answer.value.points.map((entry) => formatTransferPrimitive(entry)).join("、");
    }
    if (answer?.value?.bins) {
      return formatTransferDrawGraphValue(answer.value, answerVisuals);
    }
  }

  if (typeof answer.value === "string" || typeof answer.value === "number") {
    return String(answer.value);
  }

  if (Array.isArray(answer.value)) {
    return answer.value.map((entry) => formatTransferPrimitive(entry)).join("、");
  }

  if (answer.display && typeof answer.display === "object") {
    return JSON.stringify(answer.display, null, 2);
  }

  return JSON.stringify(answer.value ?? answer, null, 2);
}

function hasTransferAnswerContent(answer) {
  if (!answer || typeof answer !== "object") {
    return false;
  }
  return answer.value !== undefined || answer.display !== undefined;
}

function collectTransferRows(problem, items, rows, mode) {
  for (const item of items ?? []) {
    const hasResponse = Boolean(item.response && item.response.type !== "none");
    const hasAnswer = hasTransferAnswerContent(item.answer);
    const responseValue = state.responseValues[getItemResponseKey(problem, item)];
    const visuals = buildTransferVisualsForNode(item, responseValue);

    if (mode === "response" && hasResponse) {
      rows.push({
        label: item.no ? `小問${item.no}` : (item.label ?? "小問"),
        prompt: item.text ?? "",
        visuals,
        value: formatTransferResponseValue(item.response, responseValue, item.answer, item.answerVisuals ?? []),
      });
    }

    if (mode === "answer" && hasAnswer) {
      rows.push({
        label: item.no ? `小問${item.no}` : (item.label ?? "小問"),
        prompt: item.text ?? "",
        visuals,
        value: formatTransferAnswerValue(item.answer, item.response, item.answerVisuals ?? []),
      });
    }

    if (item.items?.length) {
      collectTransferRows(problem, item.items, rows, mode);
    }
  }
}

function buildTransferRows(problem) {
  const rows = [];
  const mode = state.transferContentMode;
  const responseValue = state.responseValues[problem.id];
  const visuals = buildTransferVisualsForNode(problem, responseValue);

  if (mode === "response" && problem.response && problem.response.type !== "none") {
    rows.push({
      label: "問題本体",
      prompt: problem.prompt?.text ?? "",
      visuals,
      value: formatTransferResponseValue(problem.response, responseValue, problem.answer, problem.answerVisuals ?? []),
    });
  }

  if (mode === "answer" && hasTransferAnswerContent(problem.answer)) {
    rows.push({
      label: "問題本体",
      prompt: problem.prompt?.text ?? "",
      visuals,
      value: formatTransferAnswerValue(problem.answer, problem.response, problem.answerVisuals ?? []),
    });
  }

  collectTransferRows(problem, problem.items, rows, mode);

  if (rows.length === 0 && hasTransferAnswerContent(problem.answer)) {
    rows.push({
      label: mode === "answer" ? "解答" : "答え",
      prompt: mode === "answer" ? "入力欄がない問題" : "入力欄がない問題",
      visuals,
      value: formatTransferAnswerValue(problem.answer, problem.response, problem.answerVisuals ?? []),
    });
  }

  return rows;
}

function renderTransferMode() {
  const datasetProblems = getAllProblems(state.dataset);
  const completedProblems = getTransferProblems();
  elements.problemList.innerHTML = "";
  renderTransferSummary(datasetProblems, completedProblems);

  if (completedProblems.length === 0) {
    const message = document.createElement("p");
    message.className = "error-message";
    message.textContent = "この問題セットには、転記モードで表示できる完了済み問題がありません。";
    elements.problemList.appendChild(message);
    return;
  }

  const list = document.createElement("div");
  list.className = "transfer-list";

  for (const problem of completedProblems) {
    const card = document.createElement("article");
    card.className = "transfer-card";

    const header = document.createElement("div");
    header.className = "transfer-card-header";

    const title = document.createElement("h2");
    title.className = "transfer-card-title";
    title.textContent = problem.section.title;

    const meta = document.createElement("p");
    meta.className = "transfer-meta";
    meta.textContent = `${problem.page}ページ / ${problem.id}`;

    header.append(title, meta);
    card.appendChild(header);

    const rows = buildTransferRows(problem);
    const answerBlock = document.createElement("div");
    answerBlock.className = "transfer-answer-block";

    const answerLabel = document.createElement("p");
    answerLabel.className = "answer-label";
    answerLabel.textContent = "転記用回答";
    answerBlock.appendChild(answerLabel);

    const answerList = document.createElement("div");
    answerList.className = "transfer-answer-list";

    for (const row of rows) {
      const item = document.createElement("section");
      item.className = "transfer-answer-item";

      const rowLabel = document.createElement("p");
      rowLabel.className = "transfer-answer-item-label";
      rowLabel.textContent = row.label;

      const rowPrompt = document.createElement("p");
      rowPrompt.className = "transfer-answer-item-prompt";
      rowPrompt.textContent = row.prompt || "";

      item.append(rowLabel, rowPrompt);

      if (row.visuals?.length) {
        const visualBlock = document.createElement("div");
        visualBlock.className = "transfer-visuals-block";
        renderVisualList(row.visuals, visualBlock, {});
        item.appendChild(visualBlock);
      }

      const rowValue = document.createElement("pre");
      rowValue.className = "transfer-answer-item-value";
      rowValue.textContent = row.value;

      item.appendChild(rowValue);
      answerList.appendChild(item);
    }

    answerBlock.appendChild(answerList);
    card.appendChild(answerBlock);
    list.appendChild(card);
  }

  elements.problemList.appendChild(list);
}

function renderProgressViews() {
  const progressMap = buildPageProgressMap();
  refreshPageFilterLabels(progressMap);
  if (state.transferMode) {
    renderTransferSummary(getAllProblems(state.dataset), getTransferProblems());
    return;
  }
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

function handleWorkChange(workKey, valueOrUpdater) {
  const currentValue = state.workValues[workKey];
  const nextValue =
    typeof valueOrUpdater === "function"
      ? valueOrUpdater(currentValue)
      : valueOrUpdater;

  if (areEqual(currentValue, nextValue)) {
    return;
  }

  state.workValues = {
    ...state.workValues,
    [workKey]: cloneSerializable(nextValue),
  };
  persistWorkValues();
}

function clearStoredKeys(responseKeys, workKeys) {
  const nextResponseValues = { ...state.responseValues };
  const nextWorkValues = { ...state.workValues };

  for (const responseKey of new Set(responseKeys)) {
    delete nextResponseValues[responseKey];
  }
  for (const workKey of new Set(workKeys)) {
    delete nextWorkValues[workKey];
  }

  const responseChanged = commitResponseValues(nextResponseValues);
  const workChanged = !areEqual(state.workValues, nextWorkValues);
  if (workChanged) {
    state.workValues = nextWorkValues;
    persistWorkValues();
  }

  if (responseChanged || workChanged) {
    sanitizeCompletedProblems();
    render();
  }
}

function clearProblemResponses(problem) {
  clearStoredKeys(getProblemResponseKeys(problem), getProblemWorkKeys(problem));
}

function clearVisibleResponses() {
  clearStoredKeys(getVisibleResponseKeys(), getVisibleWorkKeys());
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

  if (state.transferMode) {
    renderTransferMode();
    updateToolbar();
    return;
  }

  renderProblems(elements.problemList, visibleProblems, {
    getProblemAnswerVisibility,
    getProblemExplanationVisibility,
    onToggleProblemAnswerVisibility: toggleProblemAnswerVisibility,
    onToggleProblemExplanationVisibility: toggleProblemExplanationVisibility,
    responseValues: state.responseValues,
    workValues: state.workValues,
    onResponseChange: handleResponseChange,
    onWorkChange: handleWorkChange,
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
  state.workValues = loadPersistedWorkValues();
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
  const migratedResponseState = migrateResponseValuesWithDataset(state.responseValues, state.datasetsById);
  const migratedUndoStack = migrateHistoryStackWithDataset(state.undoStack, state.datasetsById);
  const migratedRedoStack = migrateHistoryStackWithDataset(state.redoStack, state.datasetsById);
  state.responseValues = migratedResponseState.responseValues;
  state.undoStack = migratedUndoStack.historyStack;
  state.redoStack = migratedRedoStack.historyStack;
  if (migratedResponseState.changed || migratedUndoStack.changed || migratedRedoStack.changed) {
    persistResponseValues();
    persistHistoryState();
  }
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

  elements.toggleTransferMode.addEventListener("click", () => {
    state.transferMode = !state.transferMode;
    render();
  });

  elements.toggleTransferContent.addEventListener("click", () => {
    state.transferContentMode = state.transferContentMode === "answer" ? "response" : "answer";
    if (state.transferMode) {
      render();
    } else {
      updateToolbar();
    }
  });

  elements.printTransfer.addEventListener("click", () => {
    if (!state.transferMode || getTransferProblems().length === 0) {
      return;
    }
    window.print();
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
