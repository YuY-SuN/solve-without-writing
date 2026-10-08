import { renderGuidedSteps } from "./GuidedStepsRenderer.js?v20261009-2";

const choiceOrderCache = new WeakMap();
const tokenOrderCache = new WeakMap();

export function isLongContextText(text) {
  return typeof text === "string"
    && (text.length >= 180 || (text.match(/\n/g) ?? []).length >= 2);
}

export function renderPrompt(problem, { contextId = null } = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "problem-prompt-block";

  if (problem.prompt?.text) {
    const prompt = document.createElement("p");
    prompt.className = "problem-prompt";
    prompt.textContent = problem.prompt.text;
    wrapper.appendChild(prompt);
  }

  if (problem.context?.text) {
    const longContext = isLongContextText(problem.context.text);
    const context = document.createElement("section");
    context.className = longContext ? "problem-context problem-context-long" : "problem-context";
    if (longContext && contextId) {
      context.id = contextId;
      context.tabIndex = -1;
    }
    if (longContext) {
      const label = document.createElement("p");
      label.className = "problem-context-label";
      label.textContent = "本文・資料";
      context.appendChild(label);
    }
    const text = document.createElement("div");
    text.className = "problem-context-text";
    text.textContent = problem.context.text;
    context.appendChild(text);
    wrapper.appendChild(context);
  }

  return wrapper;
}

function createTextInput(value, { short = false, multiline = false, onChange } = {}) {
  const input = multiline ? document.createElement("textarea") : document.createElement("input");
  input.className = short ? "response-input response-input-short" : "response-input";
  input.value = value ?? "";

  if (multiline) {
    input.rows = 2;
  } else {
    input.type = "text";
  }

  let isComposing = false;
  input.addEventListener("compositionstart", () => {
    isComposing = true;
  });
  input.addEventListener("compositionend", (event) => {
    isComposing = false;
    onChange?.(event.target.value);
  });
  input.addEventListener("input", (event) => {
    if (isComposing || event.isComposing) {
      return;
    }
    onChange?.(event.target.value);
  });

  return input;
}

function createChoiceControl(choice, response, responseKey, selectedValue, onChange) {
  const row = document.createElement("label");
  row.className = "choice-item";

  const input = document.createElement("input");
  input.className = "choice-input";
  input.type = response.multiple ? "checkbox" : "radio";
  input.name = responseKey;
  input.value = choice.key ?? choice.text ?? "";

  if (response.multiple) {
    const values = Array.isArray(selectedValue) ? selectedValue : [];
    input.checked = values.includes(input.value);
    input.addEventListener("change", (event) => {
      onChange?.((currentValue) => {
        const nextValues = new Set(Array.isArray(currentValue) ? currentValue : []);
        if (event.target.checked) {
          nextValues.add(input.value);
        } else {
          nextValues.delete(input.value);
        }
        return [...nextValues];
      });
    });
  } else {
    input.checked = selectedValue === input.value;
    input.addEventListener("change", (event) => {
      if (event.target.checked) {
        onChange?.(input.value);
      }
    });
  }

  const text = document.createElement("span");
  const showKey = response.showKeys !== false;
  text.textContent = showKey && choice.key && choice.key !== choice.text
    ? `${choice.key} ${choice.text}`
    : choice.text;

  row.append(input, text);
  return row;
}

function getStableChoiceOrder(response) {
  const choices = response.choices ?? [];
  if (response.shuffle !== true) {
    return choices;
  }

  if (!choiceOrderCache.has(response)) {
    const shuffled = [...choices];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    choiceOrderCache.set(response, shuffled);
  }

  return choiceOrderCache.get(response);
}

function getStableTokenOrder(response) {
  const tokens = response.tokens ?? [];
  if (response.shuffle !== true) {
    return tokens;
  }

  if (!tokenOrderCache.has(response)) {
    const shuffled = [...tokens];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    tokenOrderCache.set(response, shuffled);
  }

  return tokenOrderCache.get(response);
}

function createModeSwitch(response, options) {
  const modes = response.modes ?? {};
  const defaultMode = response.defaultMode;
  const storedValue = options.value && typeof options.value === "object" ? options.value : {};
  let activeMode = Object.hasOwn(modes, storedValue.mode) ? storedValue.mode : defaultMode;
  let modeValue = storedValue.values && typeof storedValue.values === "object" ? { ...storedValue.values } : {};
  const wrapper = document.createElement("div");
  wrapper.className = "mode-switch-response";

  const controls = document.createElement("div");
  controls.className = "mode-switch-controls";
  const buttons = new Map();
  const activeContainer = document.createElement("div");
  activeContainer.className = "mode-switch-active";

  function renderActiveMode() {
    activeContainer.innerHTML = "";
    for (const [modeName, button] of buttons) {
      button.setAttribute("aria-pressed", String(modeName === activeMode));
    }

    const activeResponse = modes[activeMode];
    if (!activeResponse) {
      return;
    }
    const activeControl = renderResponse(activeResponse, {
      responseKey: `${options.responseKey ?? "response"}-${activeMode}`,
      value: modeValue[activeMode] ?? null,
      answer: options.answer?.modes?.[activeMode],
      explanation: options.explanation,
      onChange: (nextValue) => {
        options.onChange?.((currentValue) => {
          const current = currentValue && typeof currentValue === "object" ? currentValue : {};
          const currentValues = current.values && typeof current.values === "object" ? current.values : {};
          const previousModeValue = currentValues[activeMode];
          const nextModeValue = typeof nextValue === "function" ? nextValue(previousModeValue) : nextValue;
          modeValue = { ...modeValue, [activeMode]: nextModeValue };
          return {
            mode: activeMode,
            values: { ...currentValues, [activeMode]: nextModeValue },
          };
        });
      },
    });
    if (activeControl) {
      activeContainer.appendChild(activeControl);
    }
  }

  const preferredModes = ["guided", "choice", "input"];
  const modeNames = Object.keys(modes).sort((left, right) => {
    const leftOrder = preferredModes.indexOf(left);
    const rightOrder = preferredModes.indexOf(right);
    return (leftOrder < 0 ? preferredModes.length : leftOrder)
      - (rightOrder < 0 ? preferredModes.length : rightOrder);
  });
  for (const modeName of modeNames) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mode-switch-button";
    button.textContent = modeName === "choice"
      ? "選択式"
      : modeName === "input"
        ? "入力式"
        : modeName === "guided"
          ? "操作式"
          : modeName;
    button.addEventListener("click", () => {
      activeMode = modeName;
      options.onChange?.({
        mode: modeName,
        values: modeValue,
      });
      renderActiveMode();
    });
    buttons.set(modeName, button);
    controls.appendChild(button);
  }
  wrapper.appendChild(controls);
  wrapper.appendChild(activeContainer);
  renderActiveMode();

  return wrapper;
}

function createWordOrder(response, options) {
  const orderedTokens = getStableTokenOrder(response);
  let selectedKeys = Array.isArray(options.value) ? [...options.value] : [];
  const tokenByKey = new Map(orderedTokens.map((token) => [token.key, token]));
  const wrapper = document.createElement("div");
  wrapper.className = "word-order-response";

  function commit(nextKeys) {
    selectedKeys = nextKeys;
    options.onChange?.([...selectedKeys]);
    renderWordOrder();
  }

  function renderWordOrder() {
    wrapper.innerHTML = "";
    const answerLabel = document.createElement("p");
    answerLabel.className = "word-order-label";
    answerLabel.textContent = "回答";
    wrapper.appendChild(answerLabel);

    const answerRow = document.createElement("div");
    answerRow.className = "word-order-answer";
    answerRow.setAttribute("aria-label", "選んだ語句");
    for (const [index, key] of selectedKeys.entries()) {
      const token = tokenByKey.get(key);
      if (!token) {
        continue;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "word-order-token word-order-token-selected";
      button.textContent = token.text;
      button.dataset.tokenKey = token.key;
      button.title = "クリックして候補へ戻す";
      button.setAttribute("aria-label", `${token.text} を候補へ戻す`);
      button.addEventListener("click", () => {
        commit(selectedKeys.filter((_, selectedIndex) => selectedIndex !== index));
      });
      answerRow.appendChild(button);
    }
    if (answerRow.childElementCount === 0) {
      const placeholder = document.createElement("span");
      placeholder.className = "word-order-placeholder";
      placeholder.textContent = "語句を選んで英文を作ります。";
      answerRow.appendChild(placeholder);
    }
    wrapper.appendChild(answerRow);

    const actions = document.createElement("div");
    actions.className = "word-order-actions";
    const undoButton = document.createElement("button");
    undoButton.type = "button";
    undoButton.className = "secondary-button";
    undoButton.textContent = "最後の1語を戻す";
    undoButton.disabled = selectedKeys.length === 0;
    undoButton.addEventListener("click", () => commit(selectedKeys.slice(0, -1)));
    actions.appendChild(undoButton);
    wrapper.appendChild(actions);

    const choicesLabel = document.createElement("p");
    choicesLabel.className = "word-order-label";
    choicesLabel.textContent = "候補";
    wrapper.appendChild(choicesLabel);

    const selectedKeySet = new Set(selectedKeys);
    const choices = document.createElement("div");
    choices.className = "word-order-choices";
    choices.setAttribute("aria-label", "選べる語句");
    for (const token of orderedTokens) {
      if (selectedKeySet.has(token.key)) {
        continue;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "word-order-token";
      button.textContent = token.text;
      button.addEventListener("click", () => commit([...selectedKeys, token.key]));
      choices.appendChild(button);
    }
    wrapper.appendChild(choices);
  }

  renderWordOrder();
  return wrapper;
}

export function renderResponse(response, options = {}) {
  if (!response || response.type === "none") {
    return null;
  }

  const { responseKey = "response", value = null, onChange = null } = options;

  const wrapper = document.createElement("div");
  wrapper.className = "response-block";

  const label = document.createElement("p");
  label.className = "response-label";
  label.textContent = "解答欄";
  wrapper.appendChild(label);

  if (response.type === "blank") {
    const line = document.createElement("div");
    line.className = "response-inline";
    line.appendChild(createTextInput(value, { onChange }));
    if (response.unit) {
      const unit = document.createElement("span");
      unit.textContent = response.unit;
      line.appendChild(unit);
    }
    wrapper.appendChild(line);
    return wrapper;
  }

  if (response.type === "multi_blank") {
    const group = document.createElement("div");
    group.className = "response-grid";
    for (const field of response.fields ?? []) {
      const cell = document.createElement("label");
      cell.className = "response-cell";

      const fieldLabel = document.createElement("span");
      fieldLabel.textContent = field.label;
      cell.appendChild(fieldLabel);

      const fieldValue = value && typeof value === "object" ? value[field.key] : "";
      const input = createTextInput(fieldValue, {
        short: true,
        onChange: (nextValue) => {
          onChange?.((currentValue) => {
            const next = currentValue && typeof currentValue === "object" ? { ...currentValue } : {};
            next[field.key] = nextValue;
            return next;
          });
        },
      });
      cell.appendChild(input);
      group.appendChild(cell);
    }
    wrapper.appendChild(group);
    return wrapper;
  }

  if (response.type === "free_text") {
    const lines = document.createElement("div");
    lines.className = "free-text-lines";

    if ((response.lines ?? 2) <= 1) {
      lines.appendChild(createTextInput(value, { onChange }));
    } else {
      lines.appendChild(createTextInput(value, { multiline: true, onChange }));
    }

    wrapper.appendChild(lines);
    return wrapper;
  }

  if (response.type === "choice") {
    const list = document.createElement("div");
    list.className = "choice-list";
    for (const choice of getStableChoiceOrder(response)) {
      list.appendChild(createChoiceControl(choice, response, responseKey, value, onChange));
    }
    wrapper.appendChild(list);
    return wrapper;
  }

  if (response.type === "mode_switch") {
    wrapper.appendChild(createModeSwitch(response, { ...options, responseKey, value, onChange }));
    return wrapper;
  }

  if (response.type === "guided_steps") {
    wrapper.appendChild(renderGuidedSteps(response, {
      value,
      onChange,
      answerContent: options.answer ? renderAnswer(options.answer) : null,
      explanationContent: options.explanation ? renderExplanation(options.explanation) : null,
    }));
    return wrapper;
  }

  if (response.type === "word_order") {
    wrapper.appendChild(createWordOrder(response, { ...options, value, onChange }));
    return wrapper;
  }

  if (response.type === "table_fill") {
    const hint = document.createElement("p");
    hint.className = "response-hint";
    hint.textContent = "表の空欄セルに直接入力してください。";
    wrapper.appendChild(hint);
    return wrapper;
  }

  if (response.type === "ladder_fill") {
    const hint = document.createElement("p");
    hint.className = "response-hint";
    hint.textContent = "素因数分解の階段図の空欄に直接入力してください。";
    wrapper.appendChild(hint);
    return wrapper;
  }

  if (response.type === "draw_graph") {
    const hint = document.createElement("div");
    hint.className = "draw-graph-hint";
    hint.textContent = "図の上をクリックまたはドラッグして入力します。";
    wrapper.appendChild(hint);
    return wrapper;
  }

  if (response.type === "draw_point") {
    const hint = document.createElement("div");
    hint.className = "draw-graph-hint";
    hint.textContent = "図の上をクリックまたはドラッグして点を入力します。";
    wrapper.appendChild(hint);
    return wrapper;
  }

  const unsupported = document.createElement("p");
  unsupported.className = "response-unsupported";
  unsupported.textContent = `未対応の解答形式: ${response.type}`;
  wrapper.appendChild(unsupported);
  return wrapper;
}

export function renderAnswer(answer) {
  const wrapper = document.createElement("div");
  wrapper.className = "answer-block";

  const label = document.createElement("p");
  label.className = "answer-label";
  label.textContent = "答え";
  wrapper.appendChild(label);

  if (typeof answer?.display === "string" || Array.isArray(answer?.display)) {
    const display = document.createElement("p");
    display.className = "answer-display";
    display.textContent = Array.isArray(answer.display) ? answer.display.join("、") : answer.display;
    wrapper.appendChild(display);
  } else {
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(answer, null, 2);
    wrapper.appendChild(pre);
  }
  return wrapper;
}

export function renderExplanation(explanation) {
  const wrapper = document.createElement("div");
  wrapper.className = "explanation-block";

  const label = document.createElement("p");
  label.className = "answer-label";
  label.textContent = "解説";
  wrapper.appendChild(label);

  const text = document.createElement("p");
  text.textContent = explanation;
  wrapper.appendChild(text);
  return wrapper;
}
