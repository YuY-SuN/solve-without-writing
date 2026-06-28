import { renderPrompt, renderResponse, renderAnswer, renderExplanation } from "./TextRenderer.js?v20260617-1";
import { renderVisualList } from "./VisualRenderer.js?v20260617-1";
import { renderWork } from "./WorkRenderer.js?v20260628-2";

function getItemResponseKey(problem, item) {
  return item.id ?? `${problem.id}-item-${item.no ?? "response"}`;
}

function getItemWorkKey(problem, item) {
  return item.id ?? `${problem.id}-item-${item.no ?? "work"}`;
}

function appendAnswerVisuals(node, answerVisuals) {
  if (!answerVisuals?.length) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "answer-visuals-block";

  const label = document.createElement("p");
  label.className = "answer-label";
  label.textContent = "答えの図";
  wrapper.appendChild(label);

  const visuals = document.createElement("div");
  visuals.className = "problem-visuals answer-visuals";
  renderVisualList(answerVisuals, visuals);
  wrapper.appendChild(visuals);

  node.appendChild(wrapper);
}

function itemHasAnswerContent(item) {
  if (item.answer || (item.answerVisuals?.length ?? 0) > 0) {
    return true;
  }

  return (item.items ?? []).some((child) => itemHasAnswerContent(child));
}

function itemHasExplanationContent(item) {
  if (item.explanation) {
    return true;
  }

  return (item.items ?? []).some((child) => itemHasExplanationContent(child));
}

function hasAnswerContent(problem) {
  if (problem.answer || (problem.answerVisuals?.length ?? 0) > 0) {
    return true;
  }

  return (problem.items ?? []).some((item) => itemHasAnswerContent(item));
}

function hasExplanationContent(problem) {
  if (problem.explanation) {
    return true;
  }

  return (problem.items ?? []).some((item) => itemHasExplanationContent(item));
}

function renderItemNode(problem, item, options, depth = 0) {
  const itemNode = document.createElement("section");
  itemNode.className = "problem-item";
  itemNode.dataset.depth = String(depth);

  if (item.label || item.no) {
    const itemTitle = document.createElement("h3");
    itemTitle.textContent = [item.no, item.label].filter(Boolean).join(" ");
    itemNode.appendChild(itemTitle);
  }

  if (item.text) {
    const itemText = document.createElement("p");
    itemText.textContent = item.text;
    itemNode.appendChild(itemText);
  }

  if (item.context?.text) {
    itemNode.appendChild(renderPrompt({ prompt: null, context: item.context }));
  }

  const responseKey = item.response ? getItemResponseKey(problem, item) : null;

  if (item.visuals?.length) {
    const itemVisuals = document.createElement("div");
    itemVisuals.className = "problem-visuals";
    renderVisualList(item.visuals, itemVisuals, {
      response: item.response,
      responseKey,
      value: responseKey ? options.responseValues?.[responseKey] ?? null : null,
      onChange: responseKey
        ? (nextValue) => {
            options.onResponseChange?.(responseKey, nextValue);
            options.onStatusChange?.();
          }
        : null,
      answer: item.answer,
      answerVisuals: item.answerVisuals ?? [],
    });
    itemNode.appendChild(itemVisuals);
  }

  if (item.work) {
    const workKey = getItemWorkKey(problem, item);
    const workNode = renderWork(item.work, {
      value: options.workValues?.[workKey] ?? null,
      onChange: (nextValue) => {
        options.onWorkChange?.(workKey, nextValue);
      },
    });
    if (workNode) {
      itemNode.appendChild(workNode);
    }
  }

  if (item.response) {
    const responseNode = renderResponse(item.response, {
      responseKey,
      value: options.responseValues?.[responseKey] ?? null,
      onChange: (nextValue) => {
        options.onResponseChange?.(responseKey, nextValue);
        options.onStatusChange?.();
      },
    });
    if (responseNode) {
      itemNode.appendChild(responseNode);
    }
  }

  if (options.showAnswers && item.answer) {
    itemNode.appendChild(renderAnswer(item.answer));
  }
  if (options.showAnswers) {
    appendAnswerVisuals(itemNode, item.answerVisuals ?? []);
  }
  if (options.showExplanations && item.explanation) {
    itemNode.appendChild(renderExplanation(item.explanation));
  }

  if (item.items?.length) {
    const nestedItems = document.createElement("div");
    nestedItems.className = "problem-items problem-items-nested";
    for (const child of item.items) {
      nestedItems.appendChild(renderItemNode(problem, child, options, depth + 1));
    }
    itemNode.appendChild(nestedItems);
  }

  return itemNode;
}

export function renderProblems(container, problems, options) {
  container.innerHTML = "";

  for (const problem of problems) {
    container.appendChild(renderProblem(problem, options));
  }
}

function renderProblem(problem, options) {
  const article = document.createElement("article");
  article.className = "problem-card";

  const header = document.createElement("header");
  header.className = "problem-card-header";

  const heading = document.createElement("div");
  heading.className = "problem-heading";
  heading.innerHTML = `
    <p class="section-line">${problem.section.no}. ${problem.section.category}</p>
    <h2>${problem.section.title}</h2>
  `;

  const meta = document.createElement("div");
  meta.className = "problem-meta";
  meta.innerHTML = `
    <span>問題ID: ${problem.id}</span>
    <span>${problem.page}ページ</span>
  `;

  const headerSide = document.createElement("div");
  headerSide.className = "problem-header-side";
  headerSide.appendChild(meta);

  const problemControls = document.createElement("div");
  problemControls.className = "problem-controls";

  const detailActions = document.createElement("div");
  detailActions.className = "problem-detail-actions";
  const canShowAnswer = hasAnswerContent(problem);
  const canShowExplanation = hasExplanationContent(problem);

  const answerToggle = document.createElement("button");
  answerToggle.type = "button";
  answerToggle.className = "secondary-button";

  const explanationToggle = document.createElement("button");
  explanationToggle.type = "button";
  explanationToggle.className = "secondary-button";

  detailActions.append(answerToggle, explanationToggle);
  problemControls.appendChild(detailActions);

  const completionBlock = document.createElement("div");
  completionBlock.className = "problem-completion-block";

  const completionLabel = document.createElement("label");
  completionLabel.className = "problem-completion-toggle";

  const completionCheckbox = document.createElement("input");
  completionCheckbox.type = "checkbox";
  completionCheckbox.className = "problem-completion-input";

  const completionText = document.createElement("span");
  completionText.textContent = "完了";
  completionLabel.append(completionCheckbox, completionText);

  const completionHint = document.createElement("p");
  completionHint.className = "problem-completion-hint";

  completionBlock.append(completionLabel, completionHint);
  problemControls.appendChild(completionBlock);

  function updateCompletionUi() {
    const status = options.getProblemCompletionStatus?.(problem) ?? {
      isCompletable: true,
      isComplete: false,
      message: "",
    };

    completionCheckbox.checked = status.isComplete;
    completionCheckbox.disabled = !status.isCompletable;
    completionHint.textContent = status.message ?? "";
    article.dataset.completionState = status.isComplete
      ? "complete"
      : status.isCompletable
        ? "ready"
        : "locked";
  }

  function updateDetailToggleUi() {
    const showAnswers = options.getProblemAnswerVisibility?.(problem) ?? false;
    const showExplanations = options.getProblemExplanationVisibility?.(problem) ?? false;
    answerToggle.disabled = !canShowAnswer;
    explanationToggle.disabled = !canShowExplanation;
    answerToggle.textContent = showAnswers ? "この問題の答えを隠す" : "この問題の答えを表示";
    explanationToggle.textContent = showExplanations
      ? "この問題の解説を隠す"
      : "この問題の解説を表示";
  }

  answerToggle.addEventListener("click", () => {
    options.onToggleProblemAnswerVisibility?.(problem);
  });

  explanationToggle.addEventListener("click", () => {
    options.onToggleProblemExplanationVisibility?.(problem);
  });

  completionCheckbox.addEventListener("change", (event) => {
    options.onToggleProblemComplete?.(problem, event.target.checked);
    updateCompletionUi();
  });

  if (options.onClearProblem) {
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "secondary-button";
    clearButton.textContent = "この問題をクリア";
    clearButton.addEventListener("click", () => {
      options.onClearProblem(problem);
      updateCompletionUi();
    });
    headerSide.appendChild(clearButton);
  }

  header.append(heading, headerSide);

  const prompt = renderPrompt(problem);
  const visuals = document.createElement("div");
  visuals.className = "problem-visuals";

  const updateCompletionAfterResponse = () => {
    updateCompletionUi();
    options.onProblemStatusChange?.();
  };

  renderVisualList(problem.visuals ?? [], visuals, {
    response: problem.response,
    responseKey: problem.id,
    value: options.responseValues?.[problem.id] ?? null,
    onChange: (nextValue) => {
      options.onResponseChange?.(problem.id, nextValue);
      updateCompletionAfterResponse();
    },
    answer: problem.answer,
    answerVisuals: problem.answerVisuals ?? [],
  });

  const items = document.createElement("div");
  items.className = "problem-items";
  const showAnswers = options.getProblemAnswerVisibility?.(problem) ?? false;
  const showExplanations = options.getProblemExplanationVisibility?.(problem) ?? false;

  for (const item of problem.items ?? []) {
    items.appendChild(renderItemNode(problem, item, {
      responseValues: options.responseValues,
      workValues: options.workValues,
      onResponseChange: options.onResponseChange,
      onWorkChange: options.onWorkChange,
      onStatusChange: updateCompletionAfterResponse,
      showAnswers,
      showExplanations,
    }));
  }

  const problemWork = document.createElement("div");
  problemWork.className = "problem-work";
  if (problem.work) {
    const workNode = renderWork(problem.work, {
      value: options.workValues?.[problem.id] ?? null,
      onChange: (nextValue) => {
        options.onWorkChange?.(problem.id, nextValue);
      },
    });
    if (workNode) {
      problemWork.appendChild(workNode);
    }
  }

  const footer = document.createElement("footer");
  footer.className = "problem-footer";
  if (problem.response) {
    const responseNode = renderResponse(problem.response, {
      responseKey: problem.id,
      value: options.responseValues?.[problem.id] ?? null,
      onChange: (nextValue) => {
        options.onResponseChange?.(problem.id, nextValue);
        updateCompletionAfterResponse();
      },
    });
    if (responseNode) {
      footer.appendChild(responseNode);
    }
  }
  if (showAnswers && problem.answer) {
    footer.appendChild(renderAnswer(problem.answer));
  }
  if (showExplanations && problem.explanation) {
    footer.appendChild(renderExplanation(problem.explanation));
  }

  article.append(header, prompt, visuals);
  if (items.childElementCount > 0) {
    article.appendChild(items);
  }
  if (problemWork.childElementCount > 0) {
    article.appendChild(problemWork);
  }
  if (showAnswers) {
    appendAnswerVisuals(article, problem.answerVisuals ?? []);
  }
  if (footer.childElementCount > 0) {
    article.appendChild(footer);
  }
  article.appendChild(problemControls);

  updateDetailToggleUi();
  updateCompletionUi();

  return article;
}
