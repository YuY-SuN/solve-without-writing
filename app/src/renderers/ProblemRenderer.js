import {
  isLongContextText,
  renderPrompt,
  renderResponse,
  renderAnswer,
  renderExplanation,
} from "./TextRenderer.js?v20261009-1";
import { renderVisualList } from "./VisualRenderer.js?v20261007-1";
import { englishInteractionOverrides } from "../interactions/english.js?v20261006-5";
import { inspectWordOrderPrefix } from "../interactions/word-order-feedback.js?v20261006-1";

let interactionSessionGrowth = 0;
const interactionGrowthIndicators = new Set();

function advanceInteractionGrowth(amount = 0.5) {
  interactionSessionGrowth = Math.min(3, interactionSessionGrowth + amount);
  const stage = String(Math.ceil(interactionSessionGrowth));
  for (const indicator of interactionGrowthIndicators) {
    if (!indicator.isConnected) {
      interactionGrowthIndicators.delete(indicator);
    } else {
      indicator.dataset.stage = stage;
      indicator.style.setProperty("--growth-stem-height", `${11 + interactionSessionGrowth * 4}px`);
    }
  }
}

function getItemResponseKey(problem, item) {
  return item.id ?? `${problem.id}-item-${item.no ?? "response"}`;
}

function appendAnswerVisuals(node, answerVisuals, options = {}) {
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
  renderVisualList(answerVisuals, visuals, options);
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

function formatInteractionWordOrder(response, keys) {
  const textByKey = new Map((response.tokens ?? []).map((token) => [token.key, token.text]));
  return keys.map((key) => textByKey.get(key)).filter(Boolean).join(" ")
    .replace(/\s+([.,!?;:])/g, "$1").trim();
}

function renderInteractionWordOrder(parent, response, keys, mismatchIndex = -1) {
  const textByKey = new Map((response.tokens ?? []).map((token) => [token.key, token.text]));
  parent.replaceChildren();
  keys.forEach((key, index) => {
    const tokenText = textByKey.get(key) ?? "";
    if (index > 0 && !/^[.,!?;:]/.test(tokenText)) parent.appendChild(document.createTextNode(" "));
    if (index === mismatchIndex) {
      const marked = document.createElement("mark");
      marked.textContent = tokenText;
      parent.appendChild(marked);
    } else {
      parent.appendChild(document.createTextNode(tokenText));
    }
  });
}

function normalizeInteractionToken(token) {
  return token.replace(/^[“"'([{]+|[.,!?;:’"')\]}]+$/g, "").toLowerCase();
}

function replaceRepairToken(text, tokenIndex, replacement) {
  const parts = text.split(/(\s+)/);
  let currentIndex = 0;
  const partIndex = parts.findIndex((part) => {
    if (!part || /^\s+$/.test(part)) return false;
    return currentIndex++ === tokenIndex;
  });
  if (partIndex < 0) return text;
  const punctuation = parts[partIndex].match(/[.,!?;:]+$/)?.[0] ?? "";
  parts[partIndex] = `${replacement}${punctuation}`;
  return parts.join("");
}

function renderRepairSentence(parent, text, definition, repairedTargetIds, selectedTargetId, onSelectTarget, highlight, completed) {
  parent.replaceChildren();
  const targetByIndex = new Map((definition.repairTargets ?? [])
    .filter((target) => !repairedTargetIds.has(target.id))
    .map((target) => [target.tokenIndex, target]));
  let tokenIndex = 0;

  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      parent.appendChild(document.createTextNode(part));
      continue;
    }

    const target = targetByIndex.get(tokenIndex);
    const matchingTarget = target
      && normalizeInteractionToken(part) === normalizeInteractionToken(target.token)
      ? target
      : null;
    const word = document.createElement("button");
    word.type = "button";
    word.className = "interaction-word";
    word.textContent = part;
    word.disabled = completed;
    word.setAttribute("aria-label", `語を選ぶ: ${part}`);
    word.setAttribute("aria-pressed", String(matchingTarget?.id === selectedTargetId));
    if (highlight && normalizeInteractionToken(part) === normalizeInteractionToken(highlight)) {
      word.classList.add("is-changed");
    }
    word.addEventListener("click", () => onSelectTarget(matchingTarget, part));
    parent.appendChild(word);
    tokenIndex += 1;
  }
}

function createInteractionUnit(definition, response, answer, explanationText, onComplete) {
  const root = document.createElement("section");
  root.className = "english-interaction";
  root.setAttribute("aria-label", "操作して解く");
  const growth = document.createElement("div");
  growth.className = "interaction-growth";
  growth.setAttribute("aria-label", "学習の進み具合");
  growth.innerHTML = '<span class="interaction-growth-stem"></span><span class="interaction-growth-leaf"></span><span class="interaction-growth-bloom"></span>';
  const current = document.createElement("p");
  current.className = "interaction-current-state";
  current.setAttribute("aria-live", "polite");
  const conversationReply = document.createElement("div");
  conversationReply.className = "interaction-partner-reply";
  conversationReply.hidden = true;
  const prompt = document.createElement("p");
  prompt.className = "interaction-prompt";
  const options = document.createElement("div");
  options.className = "interaction-options";
  const status = document.createElement("p");
  status.className = "interaction-status";
  status.setAttribute("aria-live", "polite");
  const moreHint = document.createElement("button");
  moreHint.type = "button";
  moreHint.className = "secondary-button interaction-more-hint";
  moreHint.textContent = "もう少しヒント";
  moreHint.hidden = true;
  const actions = document.createElement("div");
  actions.className = "interaction-actions";
  const undo = document.createElement("button");
  undo.type = "button";
  undo.className = "secondary-button";
  undo.textContent = "1手戻す";
  const explain = document.createElement("button");
  explain.type = "button";
  explain.className = "secondary-button";
  explain.textContent = "どうしてこの形になる？";
  const explanation = document.createElement("div");
  explanation.className = "interaction-explanation";
  explanation.hidden = true;
  if (answer?.display) {
    const answerNode = renderAnswer(answer);
    explanation.appendChild(answerNode);
  }
  if (answer?.value !== undefined && !answer?.display) {
    explanation.appendChild(renderAnswer(answer));
  }
  if (explanationText) explanation.appendChild(renderExplanation(explanationText));
  explain.addEventListener("click", () => {
    explanation.hidden = !explanation.hidden;
    explain.textContent = explanation.hidden ? "どうしてこの形になる？" : "説明を閉じる";
  });
  actions.append(undo, explain);
  root.append(growth, conversationReply, current, prompt, options, status, moreHint, actions, explanation);

  let stateIndex = 0;
  let stateText = definition.initialState ?? "";
  let completed = false;
  let currentHighlight = null;
  let wordKeys = [];
  let bestPrefix = 0;
  let showMoreHint = false;
  let hintLevel = 0;
  let selectedRepairTargetId = null;
  const repairedTargetIds = new Set();
  const history = [];
  const wordOrder = definition.type === "word_order";
  const targetRepair = definition.type === "repair" && Array.isArray(definition.repairTargets);
  const conversation = definition.type === "conversation";
  const wordOrderGoal = Array.isArray(answer?.value) ? answer.value : (definition.tokenOrder ?? []);
  interactionGrowthIndicators.add(growth);
  const saveHistory = () => history.push({
    stateIndex,
    stateText,
    completed,
    currentHighlight,
    wordKeys: [...wordKeys],
    hintLevel,
    selectedRepairTargetId,
    repairedTargetIds: [...repairedTargetIds],
  });
  const renderState = () => {
    const visibleGrowthStage = Math.ceil(interactionSessionGrowth);
    growth.dataset.stage = String(visibleGrowthStage);
    growth.style.setProperty("--growth-stem-height", `${11 + interactionSessionGrowth * 4}px`);
    growth.setAttribute("aria-label", ["開始", "操作を試しました", "もう少し", "完成"][visibleGrowthStage]);
    const wordOrderInspection = wordOrder
      ? inspectWordOrderPrefix(wordKeys, wordOrderGoal)
      : { matchedPrefixLength: 0, mismatchIndex: -1 };
    const { mismatchIndex } = wordOrderInspection;
    const displayText = wordOrder ? (formatInteractionWordOrder(response, wordKeys) || "単語を選んで英文を作ります") : stateText;
    conversationReply.hidden = !conversation;
    conversationReply.replaceChildren();
    if (conversation) {
      const replyLabel = document.createElement("span");
      replyLabel.className = "interaction-speaker-label";
      replyLabel.textContent = `${definition.partnerLabel ?? "相手の返事"}：`;
      const replyText = document.createElement("span");
      replyText.textContent = definition.partnerReply ?? "";
      conversationReply.append(replyLabel, replyText);
    }
    if (targetRepair) {
      renderRepairSentence(
        current,
        stateText,
        definition,
        repairedTargetIds,
        selectedRepairTargetId,
        (target, tokenText) => {
          selectedRepairTargetId = target?.id ?? null;
          hintLevel = 0;
          currentHighlight = null;
          status.textContent = target
            ? ""
            : `${tokenText} は今のままでもよさそうです。別のところも見てみましょう。`;
          status.dataset.kind = target ? "" : "hint";
          renderState();
        },
        currentHighlight,
        completed,
      );
    } else if (wordOrder && wordKeys.length > 0) {
      renderInteractionWordOrder(current, response, wordKeys, mismatchIndex);
    } else if (wordOrder) {
      current.textContent = "単語を選んで英文を作ります";
    } else {
      current.replaceChildren();
      if (conversation) {
        const speaker = document.createElement("span");
        speaker.className = "interaction-speaker-label";
        speaker.textContent = "あなた：";
        current.appendChild(speaker);
      }
      const activeHighlight = currentHighlight;
      const highlightIndex = activeHighlight ? displayText.indexOf(activeHighlight) : -1;
      if (highlightIndex >= 0) {
        current.append(document.createTextNode(displayText.slice(0, highlightIndex)));
        const marked = document.createElement("mark");
        marked.textContent = activeHighlight;
        current.append(marked, document.createTextNode(displayText.slice(highlightIndex + activeHighlight.length)));
      } else {
        current.appendChild(document.createTextNode(displayText));
      }
    }
    current.classList.toggle("is-complete", completed);
    const selectedRepairTarget = definition.repairTargets?.find((target) => target.id === selectedRepairTargetId);
    prompt.textContent = wordOrder
      ? "次の語句をタップして、答えを組み立てましょう。"
      : targetRepair
        ? selectedRepairTarget
          ? definition.repairSelectionPrompt ?? "この語にできる修理を選びましょう。"
          : definition.repairPrompt ?? "直したい語を英文の中からタップしてみましょう。"
        : definition.steps[stateIndex]?.prompt ?? "";
    options.innerHTML = "";
    if (targetRepair || conversation) {
      const hints = definition.hints ?? [];
      moreHint.hidden = completed || hints.length === 0 || hintLevel >= hints.length;
      moreHint.textContent = hintLevel === 0 ? "ヒント" : "もう少しヒント";
      if (targetRepair && hintLevel > 0 && !completed) {
        status.textContent = hints[hintLevel - 1];
        status.dataset.kind = "hint";
      }
      if (selectedRepairTarget && !completed) {
        for (const operation of selectedRepairTarget.operations ?? []) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "interaction-option";
          button.textContent = operation.label;
          button.addEventListener("click", () => {
            if (operation.outcome === "invalid") {
              status.textContent = operation.message ?? "その修理方法は合わないようです。別の操作を試してみましょう。";
              status.dataset.kind = "hint";
              return;
            }
            saveHistory();
            stateText = operation.result ?? replaceRepairToken(
              stateText,
              selectedRepairTarget.tokenIndex,
              operation.replacement,
            );
            currentHighlight = operation.highlight ?? null;
            if (operation.outcome === "progress") advanceInteractionGrowth(0.6);
            repairedTargetIds.add(selectedRepairTarget.id);
            selectedRepairTargetId = null;
            hintLevel = 0;
            const reachedGoal = definition.goalState
              && stateText.trim().replace(/\s+/g, " ") === definition.goalState.trim().replace(/\s+/g, " ");
            if (operation.complete || reachedGoal) {
              completed = true;
              if (operation.outcome !== "progress") advanceInteractionGrowth(0.6);
              status.textContent = "できた";
              status.dataset.kind = "complete";
              onComplete?.();
            } else {
              status.textContent = operation.message ?? "ここが整いました。ほかに直すところがあるか見てみましょう。";
              status.dataset.kind = "progress";
            }
            renderState();
          });
          options.appendChild(button);
        }
      }
      if (conversation && !completed) {
        for (const option of definition.steps[stateIndex]?.options ?? []) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "interaction-option";
          button.textContent = option.label;
          button.addEventListener("click", () => {
            if (["grammar_invalid", "conversation_mismatch", "invalid"].includes(option.outcome)) {
              status.textContent = option.message ?? "別の聞き方を考えてみましょう。";
              status.dataset.kind = option.outcome === "invalid" ? "invalid" : option.outcome;
              return;
            }
            saveHistory();
            stateText = option.result ?? stateText;
            currentHighlight = option.highlight ?? null;
            if (option.outcome === "progress") advanceInteractionGrowth(option.complete ? 0.9 : 0.6);
            status.textContent = option.message ?? "";
            status.dataset.kind = option.outcome ?? "progress";
            const reachedGoal = definition.goalState
              && stateText.trim().replace(/\s+/g, " ") === definition.goalState.trim().replace(/\s+/g, " ");
            if (option.complete || reachedGoal) {
              completed = true;
              status.textContent = "できた";
              status.dataset.kind = "complete";
              onComplete?.();
            } else if (option.nextStep) {
              const nextIndex = definition.steps.findIndex((step) => step.id === option.nextStep);
              if (nextIndex >= 0) stateIndex = nextIndex;
            }
            renderState();
          });
          options.appendChild(button);
        }
      }
    } else {
      moreHint.hidden = true;
    }
    if (!completed) {
      if (targetRepair) {
        // Repair choices are shown only after a tappable word is selected.
      } else if (conversation) {
        // Conversation choices are defined by each item and rendered above.
      } else if (wordOrder) {
        if (mismatchIndex >= 0) {
          const okayPrefix = mismatchIndex > 0
            ? formatInteractionWordOrder(response, wordKeys.slice(0, mismatchIndex))
            : "";
          status.textContent = okayPrefix
            ? `${okayPrefix} まではよさそうです。その次から見直してみよう。`
            : "最初に置いた語から、もう一度見直してみよう。";
          status.dataset.kind = "hint";
          moreHint.hidden = false;
          if (showMoreHint) {
            const detail = document.createElement("span");
            detail.className = "interaction-more-hint-text";
            detail.textContent = definition.moreHint ?? "単語のまとまりと、文の形を見直してみよう。";
            status.appendChild(detail);
            moreHint.hidden = true;
          }
        } else if (wordKeys.length > 0) {
          status.textContent = "ここまではよさそうです。続けてみよう。";
          status.dataset.kind = "prefix";
        } else {
          status.textContent = "";
        }
        const chosen = new Set(wordKeys);
        for (const token of response.tokens ?? []) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "interaction-option";
          button.textContent = token.text;
          button.disabled = chosen.has(token.key);
          button.addEventListener("click", () => {
            saveHistory();
            wordKeys.push(token.key);
            showMoreHint = false;
            const nextPrefix = inspectWordOrderPrefix(wordKeys, wordOrderGoal).matchedPrefixLength;
            if (nextPrefix > bestPrefix) {
              const growthPerPrefix = Math.min(0.3, 0.9 / Math.max(1, wordOrderGoal.length));
              advanceInteractionGrowth(growthPerPrefix * (nextPrefix - bestPrefix));
              bestPrefix = nextPrefix;
            }
            const goal = wordOrderGoal;
            if (wordKeys.length === goal.length && wordKeys.every((key, index) => key === goal[index])) {
              completed = true;
              advanceInteractionGrowth(0.45);
              onComplete?.();
            }
            status.textContent = completed ? "できた" : "";
            renderState();
          });
          options.appendChild(button);
        }
      } else {
        for (const option of definition.steps[stateIndex]?.options ?? []) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "interaction-option";
          button.textContent = option.label;
          button.addEventListener("click", () => {
            if (["invalid", "grammar_invalid", "conversation_mismatch"].includes(option.outcome)) {
              status.textContent = option.message ?? "この操作は使えません。別の操作を試してみましょう。";
              status.dataset.kind = option.outcome === "invalid" ? "invalid" : option.outcome;
              return;
            }
            saveHistory();
            stateText = option.result ?? stateText;
            currentHighlight = option.highlight ?? null;
            if (option.outcome === "progress") advanceInteractionGrowth(option.complete ? 0.9 : 0.6);
            status.textContent = option.message ?? "";
            status.dataset.kind = option.outcome ?? "progress";
            const reachedConversationGoal = conversation
              && definition.goalState
              && stateText.trim().replace(/\s+/g, " ") === definition.goalState.trim().replace(/\s+/g, " ");
            if (option.complete || reachedConversationGoal) {
              completed = true;
              status.textContent = "できた";
              onComplete?.();
            } else if (option.nextStep) {
              const nextIndex = definition.steps.findIndex((step) => step.id === option.nextStep);
              if (nextIndex >= 0) stateIndex = nextIndex;
            }
            renderState();
          });
          options.appendChild(button);
        }
      }
    } else {
      status.textContent = "できた";
      status.dataset.kind = "complete";
    }
    undo.disabled = history.length === 0;
  };
  undo.addEventListener("click", () => {
    const previous = history.pop();
    if (!previous) return;
    if (completed && !previous.completed) onComplete?.(false);
    ({ stateIndex, stateText, completed, currentHighlight, wordKeys, hintLevel, selectedRepairTargetId } = previous);
    repairedTargetIds.clear();
    for (const targetId of previous.repairedTargetIds ?? []) repairedTargetIds.add(targetId);
    status.textContent = "";
    renderState();
  });
  moreHint.addEventListener("click", () => {
    if (targetRepair || conversation) {
      hintLevel = Math.min(hintLevel + 1, definition.hints?.length ?? 0);
      if (!targetRepair && hintLevel > 0) {
        status.textContent = definition.hints[hintLevel - 1];
        status.dataset.kind = "hint";
      }
    } else {
      showMoreHint = true;
    }
    renderState();
  });
  renderState();
  return root;
}

function getInteractionCompletionValue(response, answer, currentValue) {
  if (response?.type === "mode_switch") {
    const mode = response.defaultMode;
    const modeValue = answer?.modes?.[mode]?.value;
    return {
      ...(currentValue && typeof currentValue === "object" ? currentValue : {}),
      mode,
      values: { ...(currentValue?.values ?? {}), [mode]: modeValue },
    };
  }
  return answer?.value;
}

function renderResponseFeedback(feedbackNode, stateClassNode, status, response, answer, value, explanation, answerVisuals, options = {}) {
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
    appendAnswerVisuals(feedback, answerVisuals, options);
  }
  feedbackNode.appendChild(feedback);
}

function createResponseUnit(response, answer, explanation, responseKey, options, answerVisuals = []) {
  const initialValue = options.responseValues?.[responseKey] ?? null;
  let currentValue = initialValue;
  let checkState = options.checkedResponses?.[responseKey] ?? null;
  let refreshWordOrderFeedback = () => {};
  let checkButton = null;
  let feedbackNode = null;
  let interactionModeSelected = false;

  function commitValue(nextValue) {
    const resolvedValue = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
    if (JSON.stringify(currentValue) === JSON.stringify(resolvedValue)) {
      return;
    }
    currentValue = resolvedValue;
    checkState = null;
    refreshWordOrderFeedback();
    options.onResponseChange?.(responseKey, nextValue);
    options.onStatusChange?.();
    if (feedbackNode) renderFeedback();
    if (checkButton) updateCheckButton();
  }

  const createResponseNode = () => renderResponse(response, {
    responseKey,
    value: currentValue,
    answer,
    explanation,
    onChange: commitValue,
  });
  const responseNode = createResponseNode();
  if (!responseNode) {
    return null;
  }

  const unit = document.createElement("div");
  unit.className = "response-unit";
  const interactionDefinition = options.subjectId === "english"
    ? englishInteractionOverrides[responseKey]
      ?? (response.type === "word_order"
        ? { type: "word_order", moreHint: "文の意味と、今置いた語の役割を見直してみよう。" }
        : null)
    : null;
  let valueBeforeInteractionCompletion;
  let checkStateBeforeInteractionCompletion = null;
  let interactionCompletionSnapshot = null;
  const responsePane = document.createElement("div");
  responsePane.className = "response-mode-pane";
  responsePane.appendChild(responseNode);
  if (options.subjectId === "english" && response.type === "word_order") {
    const wordOrderFeedback = document.createElement("div");
    wordOrderFeedback.className = "word-order-prefix-feedback";
    wordOrderFeedback.setAttribute("aria-live", "polite");
    responsePane.appendChild(wordOrderFeedback);
    refreshWordOrderFeedback = () => {
      const keys = Array.isArray(currentValue) ? currentValue : [];
      wordOrderFeedback.replaceChildren();
      if (keys.length === 0) return;
      const { matchedPrefixLength, mismatchIndex } = inspectWordOrderPrefix(keys, answer?.value ?? []);
      responseNode.querySelectorAll(".word-order-token-mismatch").forEach((token) => token.classList.remove("word-order-token-mismatch"));
      const message = document.createElement("span");
      message.className = "word-order-prefix-message";
      if (mismatchIndex >= 0) {
        const prefix = (answer?.value ?? []).slice(0, matchedPrefixLength)
          .map((key) => response.tokens?.find((token) => token.key === key)?.text)
          .filter(Boolean)
          .join(" ");
        message.textContent = prefix
          ? `${prefix} まではよさそうです。その次から見直してみよう。`
          : "最初に置いた語から、もう一度見直してみよう。";
        message.dataset.kind = "hint";
        const mismatchedKey = keys[mismatchIndex];
        const highlightMismatch = () => {
          [...responseNode.querySelectorAll("[data-token-key]")]
            .find((token) => token.dataset.tokenKey === mismatchedKey)
            ?.classList.add("word-order-token-mismatch");
        };
        if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(highlightMismatch);
        } else {
          setTimeout(highlightMismatch, 0);
        }
        const hintButton = document.createElement("button");
        hintButton.type = "button";
        hintButton.className = "secondary-button word-order-prefix-hint-button";
        hintButton.textContent = "ヒント";
        hintButton.addEventListener("click", () => {
          const hint = document.createElement("span");
          hint.className = "word-order-prefix-detail";
          hint.textContent = englishInteractionOverrides[responseKey]?.moreHint
            ?? "文の意味と、今置いた語の役割を見直してみよう。";
          wordOrderFeedback.appendChild(hint);
          hintButton.disabled = true;
        });
        wordOrderFeedback.append(message, hintButton);
      } else {
        message.textContent = "ここまではよさそうです。続けてみよう。";
        message.dataset.kind = "prefix";
        wordOrderFeedback.appendChild(message);
      }
    };
    refreshWordOrderFeedback();
  }
  const interactionPane = interactionDefinition
    ? createInteractionUnit(
        interactionDefinition,
        response,
        answer,
        explanation,
        (shouldComplete) => {
          if (shouldComplete === false) {
            commitValue(valueBeforeInteractionCompletion);
            checkState = options.onInteractionComplete?.(
              responseKey,
              response,
              answer,
              currentValue,
              false,
              interactionCompletionSnapshot,
            ) ?? checkStateBeforeInteractionCompletion;
            interactionCompletionSnapshot = null;
            renderFeedback();
            updateCheckButton();
            options.onStatusChange?.();
            return;
          }
          valueBeforeInteractionCompletion = currentValue;
          checkStateBeforeInteractionCompletion = checkState;
          const completedValue = getInteractionCompletionValue(response, answer, currentValue);
          commitValue(completedValue);
          interactionCompletionSnapshot = options.onInteractionComplete?.(
            responseKey,
            response,
            answer,
            completedValue,
            true,
            { checkedStatus: checkStateBeforeInteractionCompletion },
          ) ?? { checkedStatus: null, status: "correct", wasComplete: false };
          checkState = interactionCompletionSnapshot.status ?? "correct";
          renderFeedback();
          updateCheckButton();
          options.onStatusChange?.();
        },
      )
    : null;
  if (interactionDefinition) {
    const modeControls = document.createElement("div");
    modeControls.className = "mode-switch-controls interaction-mode-controls";
    modeControls.setAttribute("role", "group");
    modeControls.setAttribute("aria-label", "回答方法");
    const answerMode = document.createElement("button");
    answerMode.type = "button";
    answerMode.className = "mode-switch-button";
    answerMode.textContent = "選んで答える・自力入力";
    const interactionMode = document.createElement("button");
    interactionMode.type = "button";
    interactionMode.className = "mode-switch-button";
    interactionMode.textContent = "操作して解く";
    const selectMode = (mode) => {
      const isInteraction = mode === "interaction";
      interactionModeSelected = isInteraction;
      answerMode.setAttribute("aria-pressed", String(!isInteraction));
      interactionMode.setAttribute("aria-pressed", String(isInteraction));
      if (!isInteraction) responsePane.replaceChildren(createResponseNode());
      responsePane.hidden = isInteraction;
      interactionPane.hidden = !isInteraction;
      if (checkButton) checkButton.hidden = isInteraction;
      if (feedbackNode) feedbackNode.hidden = isInteraction;
    };
    answerMode.addEventListener("click", () => selectMode("answer"));
    interactionMode.addEventListener("click", () => selectMode("interaction"));
    modeControls.append(answerMode, interactionMode);
    interactionPane.hidden = true;
    selectMode("answer");
    unit.append(modeControls, responsePane, interactionPane);
  } else {
    unit.appendChild(responseNode);
  }

  checkButton = document.createElement("button");
  checkButton.type = "button";
  checkButton.className = "response-check-button";
  feedbackNode = document.createElement("div");
  feedbackNode.className = "response-check-result";
  unit.append(checkButton, feedbackNode);
  checkButton.hidden = interactionModeSelected;
  feedbackNode.hidden = interactionModeSelected;

  function updateCheckButton() {
    const active = getActiveResponse(response, answer, currentValue);
    const guidedMode = active.response?.type === "guided_steps";
    const canAutoCheck = (
      active.response?.type === "choice"
      && active.answer?.value !== undefined
    ) || (
      active.response?.type === "word_order"
      && Array.isArray(active.answer?.value)
    );
    checkButton.textContent = canAutoCheck ? "答え合わせ" : "見比べてみる";
    checkButton.hidden = interactionModeSelected || guidedMode;
    feedbackNode.hidden = interactionModeSelected || guidedMode;
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
      options,
    );
  }

  function syncExternalValue(nextValue) {
    const resolvedValue = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
    if (JSON.stringify(currentValue) === JSON.stringify(resolvedValue)) {
      return;
    }
    currentValue = resolvedValue;
    checkState = null;
    refreshWordOrderFeedback();
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

const READING_VIEW_MODES = [
  { value: "default", label: "通常" },
  { value: "split", label: "2カラム" },
  { value: "modal", label: "モーダル" },
];

function isReferenceProblem(problem) {
  const hasLongTextReference = isLongContextText(problem.context?.text);
  const hasImageReference = (problem.visuals ?? []).some((visual) => visual?.type === "image");
  const hasReferenceMaterial = Boolean(problem.context?.text) || (problem.visuals?.length ?? 0) > 0;
  if (!hasReferenceMaterial) return false;
  if (problem.layout?.referenceText === true) return true;
  const countResponses = (node) => Number(Boolean(node.response && node.response.type !== "none"))
    + (node.items ?? []).reduce((count, child) => count + countResponses(child), 0);
  return (hasLongTextReference || hasImageReference) && countResponses(problem) >= 2;
}

function createReferenceViewControls(problem, selectedMode, onChange) {
  const group = document.createElement("div");
  group.className = "reference-view-controls";
  group.dataset.problemId = problem.id;
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "参照資料の表示モード");

  const label = document.createElement("span");
  label.className = "reference-view-label";
  label.textContent = "参照資料表示";
  group.appendChild(label);

  const buttons = document.createElement("div");
  buttons.className = "reference-view-buttons";
  for (const mode of READING_VIEW_MODES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "reference-view-button";
    button.dataset.readingViewMode = mode.value;
    button.textContent = mode.label;
    button.setAttribute("aria-pressed", String(mode.value === selectedMode));
    button.addEventListener("click", () => onChange?.(mode.value, problem.id));
    buttons.appendChild(button);
  }
  group.appendChild(buttons);
  return group;
}

function createReferenceDialog(problem) {
  const safeId = String(problem.id).replace(/[^a-zA-Z0-9_-]/g, "-");
  const dialog = document.createElement("dialog");
  dialog.className = "reference-dialog";
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", `reference-dialog-title-${safeId}`);

  const header = document.createElement("header");
  header.className = "reference-dialog-header";
  const title = document.createElement("h2");
  title.id = `reference-dialog-title-${safeId}`;
  title.textContent = "参照資料";
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "reference-dialog-close";
  closeButton.textContent = "閉じる";
  closeButton.setAttribute("aria-label", "参照資料を閉じる");
  header.append(title, closeButton);

  const body = document.createElement("div");
  body.className = "reference-dialog-body";
  body.tabIndex = -1;
  dialog.append(header, body);

  let opener = null;
  let savedScrollX = 0;
  let savedScrollY = 0;
  let savedOverflow = "";
  let savedPaddingRight = "";

  function restorePage() {
    dialog.classList.remove("problem-dialog");
    if (document.body?.style) {
      document.body.style.overflow = savedOverflow;
      document.body.style.paddingRight = savedPaddingRight;
    }
    const returnFocus = opener;
    const scrollX = savedScrollX;
    const scrollY = savedScrollY;
    opener = null;
    // Run after the native dialog close algorithm so browser focus restoration
    // cannot override the explicit return to the button that opened the dialog.
    window.setTimeout(() => {
      if (returnFocus?.isConnected) {
        returnFocus.focus({ preventScroll: true });
      }
      window.scrollTo(scrollX, scrollY);
    }, 0);
  }

  function open(button, { title: nextTitle = "参照資料", content = null, problemModal = false } = {}) {
    opener = button;
    savedScrollX = window.scrollX;
    savedScrollY = window.scrollY;
    if (document.body?.style) {
      savedOverflow = document.body.style.overflow;
      savedPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      if (scrollbarWidth > 0) {
        const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
        document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
    }
    title.textContent = nextTitle;
    closeButton.setAttribute("aria-label", `${nextTitle}を閉じる`);
    dialog.classList.toggle("problem-dialog", problemModal);
    body.replaceChildren();
    if (content) body.appendChild(content);
    dialog.showModal();
    closeButton.focus();
  }

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", restorePage);
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && (event.isComposing || event.keyCode === 229)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  return { dialog, open };
}

function hasProblemModalContent(problem) {
  let itemCount = 0;
  let hasItemReference = false;
  const inspectItems = (items = []) => {
    for (const item of items) {
      itemCount += 1;
      hasItemReference ||= Boolean(item.context?.text)
        || (item.visuals?.length ?? 0) > 0
        || isLongContextText(item.text);
      inspectItems(item.items);
    }
  };
  inspectItems(problem.items);
  return Boolean(problem.context?.text)
    || (problem.visuals?.length ?? 0) > 0
    || isLongContextText(problem.prompt?.text)
    || itemCount > 1
    || hasItemReference;
}

function createProblemModalContent(problem, item, options) {
  const content = document.createElement("div");
  content.className = "problem-modal-content";

  const heading = document.createElement("h3");
  heading.className = "problem-modal-section-title";
  heading.textContent = problem.section?.title ?? "問題";
  content.appendChild(heading);

  if (problem.prompt?.text || problem.context?.text) {
    content.appendChild(renderPrompt(problem));
  }

  if (problem.visuals?.length) {
    const visuals = document.createElement("div");
    visuals.className = "problem-visuals problem-modal-visuals";
    renderVisualList(problem.visuals, visuals, { datasetUrl: options.datasetUrl });
    content.appendChild(visuals);
  }

  if (item?.text) {
    const itemText = document.createElement("p");
    itemText.className = "problem-item-text problem-modal-item-text";
    const itemLabel = [item.no, item.label].filter(Boolean).join(" ");
    itemText.textContent = itemLabel ? `${itemLabel} ${item.text}` : item.text;
    content.appendChild(itemText);
  }

  if (item?.context?.text) {
    content.appendChild(renderPrompt({ prompt: null, context: item.context }));
  }
  if (item?.visuals?.length) {
    const visuals = document.createElement("div");
    visuals.className = "problem-visuals problem-modal-visuals";
    renderVisualList(item.visuals, visuals, { datasetUrl: options.datasetUrl });
    content.appendChild(visuals);
  }
  return content;
}

function createAnswerReveal(answer, explanation, answerVisuals = [], options = {}) {
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
    appendAnswerVisuals(content, answerVisuals, options);
  }
  button.addEventListener("click", () => {
    content.hidden = !content.hidden;
    button.textContent = content.hidden ? "答え・解説を見る" : "答え・解説を隠す";
  });
  wrapper.append(button, content);
  return wrapper;
}

function renderItemNode(problem, item, options, depth = 0, inheritedExplanation = null, referenceId = null, openReference = null, referenceLabel = "本文を見る", problemDialog = null, showProblemModal = false) {
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

  if (showProblemModal && problemDialog) {
    const problemButton = document.createElement("button");
    problemButton.type = "button";
    problemButton.className = "problem-context-return problem-modal-open";
    problemButton.textContent = "問題を見る";
    problemButton.addEventListener("click", () => {
      problemDialog.open(problemButton, {
        title: "問題",
        content: createProblemModalContent(problem, item, options),
        problemModal: true,
      });
    });
    itemNode.appendChild(problemButton);
  }

  if (referenceId) {
    const contextLink = document.createElement("button");
    contextLink.type = "button";
    contextLink.className = "problem-context-return";
    contextLink.textContent = referenceLabel;
    contextLink.addEventListener("click", () => openReference?.(contextLink));
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
        {
          ...options,
          onInteractionComplete: (...args) => options.onInteractionComplete?.(problem, ...args),
        },
        item.answerVisuals ?? [],
      )
    : null;

  if (item.visuals?.length) {
    const itemVisuals = document.createElement("div");
    itemVisuals.className = "problem-visuals";
    renderVisualList(item.visuals, itemVisuals, {
      datasetUrl: options.datasetUrl,
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
    const answerReveal = createAnswerReveal(item.answer, item.explanation, item.answerVisuals ?? [], options);
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
        referenceId,
        openReference,
        referenceLabel,
        problemDialog,
        showProblemModal,
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

  const hasReferenceLayout = isReferenceProblem(problem);
  const showProblemModal = hasProblemModalContent(problem);
  const referenceId = (hasReferenceLayout || isLongContextText(problem.context?.text))
    ? `problem-reference-${String(problem.id).replace(/[^a-zA-Z0-9_-]/g, "-")}`
    : null;
  const readingViewMode = ["default", "split", "modal"].includes(options.readingViewMode)
    ? options.readingViewMode
    : "default";
  const prompt = hasReferenceLayout
    ? renderPrompt({ ...problem, context: null })
    : renderPrompt(problem, { contextId: referenceId });
  const visuals = document.createElement("div");
  visuals.className = "problem-visuals";

  let referenceLayout = null;
  let sourcePane = null;
  let questionPane = null;
  let referenceContent = null;
  let referenceVisuals = null;
  let referenceDialog = null;
  let readingControls = null;

  if (hasReferenceLayout) {
    referenceContent = document.createElement("div");
    referenceContent.className = "reference-material-content";
    referenceContent.id = referenceId;
    referenceContent.tabIndex = -1;
    if (problem.context?.text) {
      referenceContent.appendChild(renderPrompt({ prompt: null, context: problem.context }));
    }
    if (!isLongContextText(problem.context?.text) && (problem.visuals?.length ?? 0) > 0) {
      const label = document.createElement("p");
      label.className = "reference-material-label";
      label.textContent = "参照資料";
      referenceContent.prepend(label);
    }
    if (problem.visuals?.length) {
      referenceVisuals = document.createElement("div");
      referenceVisuals.className = "problem-visuals reference-material-visuals";
      referenceContent.appendChild(referenceVisuals);
    }
    referenceLayout = document.createElement("div");
    referenceLayout.className = "reference-layout";
    referenceLayout.dataset.readingViewMode = readingViewMode;
    sourcePane = document.createElement("div");
    sourcePane.className = "reference-source-pane";
    questionPane = document.createElement("div");
    questionPane.className = "reference-question-pane";
    readingControls = createReferenceViewControls(
      problem,
      readingViewMode,
      options.onReadingViewModeChange,
    );

    if (readingViewMode === "modal") {
      referenceDialog = createReferenceDialog(problem);
    } else {
      sourcePane.appendChild(referenceContent);
    }
    referenceLayout.append(sourcePane, questionPane);
  }

  const openReference = (opener) => {
    if (hasReferenceLayout && readingViewMode === "modal" && referenceDialog) {
      referenceDialog.open(opener, { title: "参照資料", content: referenceContent });
      return;
    }
    const context = referenceContent
      ?? prompt.querySelector(".problem-context");
    context?.scrollIntoView({ block: "start" });
    context?.focus({ preventScroll: true });
  };

  if (!referenceDialog && showProblemModal) {
    referenceDialog = createReferenceDialog(problem);
  }

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
        {
          ...options,
          onStatusChange: updateCompletionAfterResponse,
          onInteractionComplete: (...args) => options.onInteractionComplete?.(problem, ...args),
        },
        problem.answerVisuals ?? [],
      )
    : null;

  renderVisualList(problem.visuals ?? [], referenceVisuals ?? visuals, {
    datasetUrl: options.datasetUrl,
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
    }, 0, problem.explanation, referenceId, openReference, hasReferenceLayout ? "参照資料を見る" : "本文を見る", referenceDialog, showProblemModal));
  }

  article.append(header, prompt);
  if (readingControls) {
    article.appendChild(readingControls);
  }

  if (hasReferenceLayout) {
    article.appendChild(referenceLayout);
  }
  const problemContent = questionPane ?? article;
  if (!hasReferenceLayout) {
    problemContent.appendChild(visuals);
  }
  if (problemResponseUnit) {
    problemContent.appendChild(problemResponseUnit.node);
  } else if (!hasResponseInTree(problem)) {
    const answerReveal = createAnswerReveal(problem.answer, problem.explanation, problem.answerVisuals ?? [], options);
    if (answerReveal) {
      problemContent.appendChild(answerReveal);
    }
  }
  if (items.childElementCount > 0) {
    problemContent.appendChild(items);
  }
  if (referenceDialog) {
    article.appendChild(referenceDialog.dialog);
  }
  article.appendChild(problemControls);

  updateCompletionUi();

  return article;
}
