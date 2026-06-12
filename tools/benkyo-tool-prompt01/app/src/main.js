import { renderProblems } from "./renderers/ProblemRenderer.js";

const state = {
  showAnswers: false,
  showExplanations: false,
  selectedPage: "all",
  selectedDatasetId: null,
  datasetCatalog: [],
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

function getAllProblems(dataset) {
  return dataset.pages.flatMap((page) =>
    page.problems.map((problem) => ({ ...problem, page: page.page })),
  );
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

function populatePageFilter(dataset) {
  const pages = dataset.pages.map((page) => page.page);
  elements.pageFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "すべて";
  elements.pageFilter.appendChild(allOption);

  for (const page of pages) {
    const option = document.createElement("option");
    option.value = String(page);
    option.textContent = `${page}ページ`;
    elements.pageFilter.appendChild(option);
  }
}

function updateToolbar() {
  elements.toggleAnswers.textContent = state.showAnswers ? "答えを隠す" : "答えを表示";
  elements.toggleExplanations.textContent = state.showExplanations
    ? "解説を隠す"
    : "解説を表示";
}

function updateHeader(dataset, selectedEntry) {
  elements.title.textContent = dataset.meta.title;
  const sourceParts = [selectedEntry.label, dataset.meta.source, `v${dataset.meta.version}`];
  elements.source.textContent = sourceParts.join(" / ");
}

function render() {
  const allProblems = getAllProblems(state.dataset);
  const visibleProblems =
    state.selectedPage === "all"
      ? allProblems
      : allProblems.filter((problem) => String(problem.page) === state.selectedPage);

  renderProblems(elements.problemList, visibleProblems, {
    showAnswers: state.showAnswers,
    showExplanations: state.showExplanations,
  });
  updateToolbar();
}

async function applyDataset(datasetId) {
  const selectedEntry = state.datasetCatalog.find((entry) => entry.id === datasetId);
  if (!selectedEntry) {
    throw new Error(`Unknown dataset: ${datasetId}`);
  }

  state.dataset = await loadDataset(selectedEntry.path);
  state.selectedDatasetId = selectedEntry.id;
  state.selectedPage = "all";

  elements.datasetSelect.value = selectedEntry.id;
  populatePageFilter(state.dataset);
  elements.pageFilter.value = state.selectedPage;
  updateHeader(state.dataset, selectedEntry);
  render();
}

async function bootstrap() {
  const catalog = await loadDatasetCatalog();
  state.datasetCatalog = catalog.datasets;

  if (!Array.isArray(state.datasetCatalog) || state.datasetCatalog.length === 0) {
    throw new Error("No datasets defined in src/data/index.json");
  }

  populateDatasetSelect(catalog);

  elements.datasetSelect.addEventListener("change", async (event) => {
    await applyDataset(event.target.value);
  });

  elements.pageFilter.addEventListener("change", (event) => {
    state.selectedPage = event.target.value;
    render();
  });

  elements.toggleAnswers.addEventListener("click", () => {
    state.showAnswers = !state.showAnswers;
    render();
  });

  elements.toggleExplanations.addEventListener("click", () => {
    state.showExplanations = !state.showExplanations;
    render();
  });

  await applyDataset(catalog.defaultDatasetId ?? state.datasetCatalog[0].id);
}

bootstrap().catch((error) => {
  elements.problemList.innerHTML = "";
  const message = document.createElement("p");
  message.className = "error-message";
  message.textContent = `読み込みに失敗しました: ${error.message}`;
  elements.problemList.appendChild(message);
});
