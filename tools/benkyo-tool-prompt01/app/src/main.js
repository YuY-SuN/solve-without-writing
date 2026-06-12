import { renderProblems } from "./renderers/ProblemRenderer.js";

const RESPONSE_STORAGE_KEY = "benkyo-tool-prompt01:response-values:v1";
const HISTORY_STORAGE_KEY = "benkyo-tool-prompt01:response-history:v1";
const MAX_HISTORY_ENTRIES = 10;

const state = {
  showAnswers: false,
  showExplanations: false,
  selectedPageKey: "all",
  selectedDatasetId: null,
  datasetCatalog: [],
  datasetsById: {},
  pageCatalog: [],
  responseValues: {},
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

function getItemResponseKey(problem, item) {
  return item.id ?? `${problem.id}-item-${item.no ?? "response"}`;
}

function getProblemResponseKeys(problem) {
  const keys = [];

  if (problem.response) {
    keys.push(problem.id);
  }

  for (const item of problem.items ?? []) {
    if (item.response) {
      keys.push(getItemResponseKey(problem, item));
    }
  }

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

function populatePageFilter(pageCatalog) {
  elements.pageFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "すべて（現在の問題セット）";
  elements.pageFilter.appendChild(allOption);

  for (const entry of pageCatalog) {
    const option = document.createElement("option");
    option.value = entry.key;
    option.textContent = `${entry.page}ページ / ${entry.datasetLabel}`;
    elements.pageFilter.appendChild(option);
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

function persistResponseValues() {
  persistJson(RESPONSE_STORAGE_KEY, state.responseValues);
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
  commitResponseValues(nextResponseValues);
}

function clearResponseKeys(responseKeys) {
  const nextResponseValues = { ...state.responseValues };

  for (const responseKey of new Set(responseKeys)) {
    delete nextResponseValues[responseKey];
  }

  if (commitResponseValues(nextResponseValues)) {
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
  render();
}

function render() {
  const visibleProblems = getVisibleProblems();

  renderProblems(elements.problemList, visibleProblems, {
    showAnswers: state.showAnswers,
    showExplanations: state.showExplanations,
    responseValues: state.responseValues,
    onResponseChange: handleResponseChange,
    onClearProblem: clearProblemResponses,
  });
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

  populateDatasetSelect(catalog);
  populatePageFilter(state.pageCatalog);

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
    state.showAnswers = !state.showAnswers;
    render();
  });

  elements.toggleExplanations.addEventListener("click", () => {
    state.showExplanations = !state.showExplanations;
    render();
  });

  await applyDataset(catalog.defaultDatasetId ?? state.datasetCatalog[0].id, "all");
}

bootstrap().catch((error) => {
  elements.problemList.innerHTML = "";
  const message = document.createElement("p");
  message.className = "error-message";
  message.textContent = `読み込みに失敗しました: ${error.message}`;
  elements.problemList.appendChild(message);
});
