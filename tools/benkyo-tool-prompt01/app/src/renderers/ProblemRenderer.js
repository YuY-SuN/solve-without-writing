import { renderPrompt, renderResponse, renderAnswer, renderExplanation } from "./TextRenderer.js";
import { renderVisualList } from "./VisualRenderer.js";

function getItemResponseKey(problem, item) {
  return item.id ?? `${problem.id}-item-${item.no ?? "response"}`;
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
  headerSide.appendChild(completionBlock);

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
  for (const item of problem.items ?? []) {
    const itemNode = document.createElement("section");
    itemNode.className = "problem-item";
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
              updateCompletionAfterResponse();
            }
          : null,
        answer: item.answer,
        answerVisuals: item.answerVisuals ?? [],
      });
      itemNode.appendChild(itemVisuals);
    }
    if (item.response) {
      const responseNode = renderResponse(item.response, {
        responseKey,
        value: options.responseValues?.[responseKey] ?? null,
        onChange: (nextValue) => {
          options.onResponseChange?.(responseKey, nextValue);
          updateCompletionAfterResponse();
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
    items.appendChild(itemNode);
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
  if (options.showAnswers && problem.answer) {
    footer.appendChild(renderAnswer(problem.answer));
  }
  if (options.showExplanations && problem.explanation) {
    footer.appendChild(renderExplanation(problem.explanation));
  }

  article.append(header, prompt, visuals);
  if (items.childElementCount > 0) {
    article.appendChild(items);
  }
  if (options.showAnswers) {
    appendAnswerVisuals(article, problem.answerVisuals ?? []);
  }
  if (footer.childElementCount > 0) {
    article.appendChild(footer);
  }

  updateCompletionUi();

  return article;
}
