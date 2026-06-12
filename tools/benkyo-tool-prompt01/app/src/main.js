import { renderProblems } from "./renderers/ProblemRenderer.js";

const state = {
  showAnswers: false,
  showExplanations: false,
  selectedPageKey: "all",
  selectedDatasetId: null,
  datasetCatalog: [],
  datasetsById: {},
  pageCatalog: [],
  responseValues: {},
  dataset: null,
};

const elements = {
  title: document.querySelector("#app-title"),
  source: document.querySelector("#app-source"),
  datasetSelect: document.querySelector("#dataset-select"),
  pageFilter: document.querySelector("#page-filter"),
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

function makePageKey(datasetId, page) {
  return `${datasetId}::${page}`;
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

function handleResponseChange(responseKey, valueOrUpdater) {
  state.responseValues[responseKey] =
    typeof valueOrUpdater === "function"
      ? valueOrUpdater(state.responseValues[responseKey])
      : valueOrUpdater;
}


function render() {
  const allProblems = getAllProblems(state.dataset);
  const pageEntry = state.selectedPageKey === "all" ? null : findPageEntry(state.selectedPageKey);
  const visibleProblems =
    pageEntry === null
      ? allProblems
      : allProblems.filter((problem) => String(problem.page) === String(pageEntry.page));

  renderProblems(elements.problemList, visibleProblems, {
    showAnswers: state.showAnswers,
    showExplanations: state.showExplanations,
    responseValues: state.responseValues,
    onResponseChange: handleResponseChange,
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
