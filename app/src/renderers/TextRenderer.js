export function renderPrompt(problem) {
  const wrapper = document.createElement("div");
  wrapper.className = "problem-prompt-block";

  if (problem.prompt?.text) {
    const prompt = document.createElement("p");
    prompt.className = "problem-prompt";
    prompt.textContent = problem.prompt.text;
    wrapper.appendChild(prompt);
  }

  if (problem.context?.text) {
    const context = document.createElement("p");
    context.className = "problem-context";
    context.textContent = problem.context.text;
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

  input.addEventListener("input", (event) => {
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
  text.textContent = choice.text;

  row.append(input, text);
  return row;
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
    for (const choice of response.choices ?? []) {
      list.appendChild(createChoiceControl(choice, response, responseKey, value, onChange));
    }
    wrapper.appendChild(list);
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

  const pre = document.createElement("pre");
  pre.textContent = JSON.stringify(answer, null, 2);
  wrapper.appendChild(pre);
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
