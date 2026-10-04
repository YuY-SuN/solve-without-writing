import {
  isLongContextText,
  renderPrompt,
  renderResponse,
  renderAnswer,
  renderExplanation,
} from "./TextRenderer.js?v20261005-1";
import { renderVisualList } from "./VisualRenderer.js?v20260617-1";

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

function getActiveResponse(response, answer, value) {
  if (response?.type !== "mode_switch") {
    return { response, answer, value };
  }

  const mode = value?.mode && Object.hasOwn(response.modes ?? {}, value.mode)
    ? value.mode
    : response.defaultMode;
  return {
    response: response.modes?.[mode],
    answer: answer?.modes?.[mode],
    value: value?.values?.[mode],
    mode,
  };
}

function formatWordOrder(response, value) {
  if (!Array.isArray(value)) {
    return "未入力";
  }
  const textByKey = new Map((response.tokens ?? []).map((token) => [token.key, token.text]));
  return value
    .map((key) => textByKey.get(key))
    .filter((text) => typeof text === "string")
    .join(" ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .trim();
}

function formatResponseValue(response, value, answer = null) {
  if (response?.type === "mode_switch") {
    const active = getActiveResponse(response, answer, value);
    return formatResponseValue(active.response, active.value, active.answer);
  }
  if (response?.type === "choice") {
    const values = response.multiple ? (Array.isArray(value) ? value : []) : [value];
    const labels = values
      .filter((entry) => entry !== null && entry !== undefined && entry !== "")
      .map((entry) => response.choices?.find((choice) => choice.key === entry)?.text ?? String(entry));
    return labels.length > 0 ? labels.join("、") : "未入力";
  }
  if (response?.type === "word_order") {
    return formatWordOrder(response, value);
  }
  if (response?.type === "multi_blank") {
    return (response.fields ?? [])
      .map((field) => `${field.label}: ${value?.[field.key] ?? ""}`)
      .join(" / ") || JSON.stringify(value ?? {});
  }
  if (response?.type === "table_fill" || response?.type === "ladder_fill") {
    return (response.targets ?? [])
      .map((target) => `${target.label ?? target.key}: ${value?.[target.key] ?? ""}`)
      .join(" / ") || JSON.stringify(value ?? {});
  }
  if (value === null || value === undefined || value === "") {
    return "未入力";
  }
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : JSON.stringify(value);
}

function getAnswerText(response, answer, value) {
  const active = getActiveResponse(response, answer, value);
  const activeDisplay = active.answer?.display;
  if (typeof activeDisplay === "string") {
    return activeDisplay;
  }
  if (Array.isArray(activeDisplay)) {
    return activeDisplay.join("、");
  }
  if (typeof answer?.display === "string") {
    return answer.display;
  }
  if (Array.isArray(answer?.display)) {
    return answer.display.join("、");
  }
  if (active.answer?.value !== undefined) {
    return formatResponseValue(active.response, active.answer.value, active.answer);
  }
  return answer?.value !== undefined
    ? formatResponseValue(response, answer.value, answer)
    : "答えデータなし";
}

function getChoiceExplanations(response, value) {
  const active = getActiveResponse(response, null, value);
  if (active.response?.type !== "choice") {
    return [];
  }
  const selected = active.response.multiple
    ? (Array.isArray(active.value) ? active.value : [])
    : [active.value];
  return [...new Set(selected
    .map((key) => active.response.choices?.find((choice) => choice.key === key)?.explanation)
    .filter((explanation) => typeof explanation === "string" && explanation.length > 0))];
}

function appendValuePanel(parent, labelText, value) {
  const panel = document.createElement("div");
  panel.className = "response-check-value";
  const label = document.createElement("p");
  label.className = "response-check-value-label";
  label.textContent = labelText;
  const text = document.createElement("p");
  text.className = "response-check-value-text";
  text.textContent = value;
  panel.append(label, text);
  parent.appendChild(panel);
}

function renderResponseFeedback(feedbackNode, stateClassNode, status, response, answer, value, explanation, answerVisuals) {
  feedbackNode.innerHTML = "";
  stateClassNode.classList.remove("is-checked-correct", "is-checked-incorrect", "is-compare-open");
  if (!status) {
    return;
  }

  const feedback = document.createElement("div");
  feedback.className = "response-check-feedback";
  feedback.setAttribute("aria-live", "polite");
  const statusText = document.createElement("p");
  statusText.className = "response-check-status";

  if (status === "unanswered") {
    statusText.textContent = "まず回答してください。";
    feedback.appendChild(statusText);
    feedbackNode.appendChild(feedback);
    return;
  }

  const isAutoChecked = status === "correct" || status === "incorrect";
  if (status === "correct") {
    statusText.textContent = "✓ 正解";
    stateClassNode.classList.add("is-checked-correct");
  } else if (status === "incorrect") {
    statusText.textContent = "△ 確認してみよう";
    stateClassNode.classList.add("is-checked-incorrect");
  } else {
    statusText.textContent = "見比べてみよう";
    stateClassNode.classList.add("is-compare-open");
  }
  feedback.appendChild(statusText);

  appendValuePanel(feedback, "あなたの回答", formatResponseValue(response, value, answer));
  appendValuePanel(
    feedback,
    isAutoChecked ? "正答" : "正答・解答例",
    getAnswerText(response, answer, value),
  );

  if (status === "incorrect") {
    for (const choiceExplanation of getChoiceExplanations(response, value)) {
      const choiceBlock = renderExplanation(choiceExplanation);
      choiceBlock.querySelector(".answer-label").textContent = "この選択肢について";
      feedback.appendChild(choiceBlock);
    }
  }
  if (explanation) {
    feedback.appendChild(renderExplanation(explanation));
  }
  if (answerVisuals?.length) {
    appendAnswerVisuals(feedback, answerVisuals);
  }
  feedbackNode.appendChild(feedback);
}

function createResponseUnit(response, answer, explanation, responseKey, options, answerVisuals = []) {
  const initialValue = options.responseValues?.[responseKey] ?? null;
  let currentValue = initialValue;
  let checkState = options.checkedResponses?.[responseKey] ?? null;

  function commitValue(nextValue) {
    const resolvedValue = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
    if (JSON.stringify(currentValue) === JSON.stringify(resolvedValue)) {
      return;
    }
    currentValue = resolvedValue;
    checkState = null;
    options.onResponseChange?.(responseKey, nextValue);
    options.onStatusChange?.();
    renderFeedback();
    updateCheckButton();
  }

  const responseNode = renderResponse(response, {
    responseKey,
    value: currentValue,
    onChange: commitValue,
  });
  if (!responseNode) {
    return null;
  }

  const unit = document.createElement("div");
  unit.className = "response-unit";
  unit.appendChild(responseNode);

  const checkButton = document.createElement("button");
  checkButton.type = "button";
  checkButton.className = "response-check-button";
  const feedbackNode = document.createElement("div");
  feedbackNode.className = "response-check-result";
  unit.append(checkButton, feedbackNode);

  function updateCheckButton() {
    const active = getActiveResponse(response, answer, currentValue);
    const canAutoCheck = (
      active.response?.type === "choice"
      && active.answer?.value !== undefined
    ) || (
      active.response?.type === "word_order"
      && Array.isArray(active.answer?.value)
    );
    checkButton.textContent = canAutoCheck ? "答え合わせ" : "見比べてみる";
    checkButton.disabled = (Boolean(checkState) && checkState !== "unanswered")
      || (options.isResponseComplete?.(response, currentValue, answer) === false);
  }

  function renderFeedback(status = checkState) {
    renderResponseFeedback(
      feedbackNode,
      unit,
      status,
      response,
      answer,
      currentValue,
      explanation,
      answerVisuals,
    );
  }

  function syncExternalValue(nextValue) {
    const resolvedValue = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
    if (JSON.stringify(currentValue) === JSON.stringify(resolvedValue)) {
      return;
    }
    currentValue = resolvedValue;
    checkState = null;
    renderFeedback();
    updateCheckButton();
  }

  checkButton.addEventListener("click", () => {
    checkState = options.onCheckResponse?.(responseKey, response, answer, currentValue) ?? "compare";
    renderFeedback(checkState);
    updateCheckButton();
  });

  renderFeedback();
  updateCheckButton();
  return { node: unit, syncExternalValue };
}

function hasResponseInTree(node) {
  if (node.response && node.response.type !== "none") {
    return true;
  }
  return (node.items ?? []).some(hasResponseInTree);
}

function createAnswerReveal(answer, explanation, answerVisuals = []) {
  if (!answer && !explanation && answerVisuals.length === 0) {
    return null;
  }
  const wrapper = document.createElement("div");
  wrapper.className = "answer-reveal";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary-button answer-reveal-toggle";
  button.textContent = "答え・解説を見る";
  const content = document.createElement("div");
  content.className = "answer-reveal-content";
  content.hidden = true;
  if (answer) {
    content.appendChild(renderAnswer(answer));
  }
  if (explanation) {
    content.appendChild(renderExplanation(explanation));
  }
  if (answerVisuals.length) {
    appendAnswerVisuals(content, answerVisuals);
  }
  button.addEventListener("click", () => {
    content.hidden = !content.hidden;
    button.textContent = content.hidden ? "答え・解説を見る" : "答え・解説を隠す";
  });
  wrapper.append(button, content);
  return wrapper;
}

function renderItemNode(problem, item, options, depth = 0, inheritedExplanation = null, contextAnchorId = null) {
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
    itemText.className = "problem-item-text";
    itemText.textContent = item.text;
    itemNode.appendChild(itemText);
  }

  if (contextAnchorId) {
    const contextLink = document.createElement("a");
    contextLink.className = "problem-context-return";
    contextLink.href = `#${contextAnchorId}`;
    contextLink.textContent = "本文を見る";
    itemNode.appendChild(contextLink);
  }

  if (item.context?.text) {
    itemNode.appendChild(renderPrompt({ prompt: null, context: item.context }));
  }

  const responseKey = item.response && item.response.type !== "none"
    ? getItemResponseKey(problem, item)
    : null;
  const responseUnit = responseKey
    ? createResponseUnit(
        item.response,
        item.answer,
        item.explanation ?? inheritedExplanation,
        responseKey,
        options,
        item.answerVisuals ?? [],
      )
    : null;

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
            responseUnit?.syncExternalValue(nextValue);
            options.onStatusChange?.();
          }
        : null,
      answer: item.answer,
      answerVisuals: item.answerVisuals ?? [],
    });
    itemNode.appendChild(itemVisuals);
  }

  if (responseUnit) {
    itemNode.appendChild(responseUnit.node);
  } else if (!hasResponseInTree(item)) {
    const answerReveal = createAnswerReveal(item.answer, item.explanation, item.answerVisuals ?? []);
    if (answerReveal) {
      itemNode.appendChild(answerReveal);
    }
  }

  if (item.items?.length) {
    const nestedItems = document.createElement("div");
    nestedItems.className = "problem-items problem-items-nested";
    for (const child of item.items) {
      nestedItems.appendChild(renderItemNode(
        problem,
        child,
        options,
        depth + 1,
        item.explanation ?? inheritedExplanation,
        contextAnchorId,
      ));
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

  const contextAnchorId = isLongContextText(problem.context?.text)
    ? `problem-context-${String(problem.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`
    : null;
  const prompt = renderPrompt(problem, { contextId: contextAnchorId });
  const visuals = document.createElement("div");
  visuals.className = "problem-visuals";

  const updateCompletionAfterResponse = () => {
    updateCompletionUi();
    options.onProblemStatusChange?.();
  };

  const problemResponseKey = problem.response && problem.response.type !== "none" ? problem.id : null;
  const problemResponseUnit = problemResponseKey
    ? createResponseUnit(
        problem.response,
        problem.answer,
        problem.explanation,
        problemResponseKey,
        { ...options, onStatusChange: updateCompletionAfterResponse },
        problem.answerVisuals ?? [],
      )
    : null;

  renderVisualList(problem.visuals ?? [], visuals, {
    response: problem.response,
    responseKey: problemResponseKey,
    value: problemResponseKey ? options.responseValues?.[problemResponseKey] ?? null : null,
    onChange: problemResponseKey ? (nextValue) => {
      options.onResponseChange?.(problemResponseKey, nextValue);
      problemResponseUnit?.syncExternalValue(nextValue);
      updateCompletionAfterResponse();
    } : null,
    answer: problem.answer,
    answerVisuals: problem.answerVisuals ?? [],
  });

  const items = document.createElement("div");
  items.className = "problem-items";

  for (const item of problem.items ?? []) {
    items.appendChild(renderItemNode(problem, item, {
      ...options,
      onStatusChange: updateCompletionAfterResponse,
    }, 0, problem.explanation, contextAnchorId));
  }

  article.append(header, prompt, visuals);
  if (problemResponseUnit) {
    article.appendChild(problemResponseUnit.node);
  } else if (!hasResponseInTree(problem)) {
    const answerReveal = createAnswerReveal(problem.answer, problem.explanation, problem.answerVisuals ?? []);
    if (answerReveal) {
      article.appendChild(answerReveal);
    }
  }
  if (items.childElementCount > 0) {
    article.appendChild(items);
  }
  article.appendChild(problemControls);

  updateCompletionUi();

  return article;
}
