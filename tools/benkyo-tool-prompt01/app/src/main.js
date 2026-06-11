import { renderProblems } from "./renderers/ProblemRenderer.js";

const state = {
  showAnswers: false,
  showExplanations: false,
  selectedPage: "all",
  dataset: null,
};

const elements = {
  title: document.querySelector("#app-title"),
  source: document.querySelector("#app-source"),
  pageFilter: document.querySelector("#page-filter"),
  toggleAnswers: document.querySelector("#toggle-answers"),
  toggleExplanations: document.querySelector("#toggle-explanations"),
  problemList: document.querySelector("#problem-list"),
};

async function loadProblems() {
  const res = await fetch("./src/data/problems.json");
  if (!res.ok) {
    throw new Error(`Failed to load problems.json: ${res.status}`);
  }
  return res.json();
}

function getAllProblems(dataset) {
  return dataset.pages.flatMap((page) =>
    page.problems.map((problem) => ({ ...problem, page: page.page })),
  );
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

async function bootstrap() {
  state.dataset = await loadProblems();
  elements.title.textContent = state.dataset.meta.title;
  elements.source.textContent = `${state.dataset.meta.source} / v${state.dataset.meta.version}`;

  populatePageFilter(state.dataset);
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

  render();
}

bootstrap().catch((error) => {
  elements.problemList.innerHTML = "";
  const message = document.createElement("p");
  message.className = "error-message";
  message.textContent = `読み込みに失敗しました: ${error.message}`;
  elements.problemList.appendChild(message);
});
