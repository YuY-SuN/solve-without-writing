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

export function renderResponse(response) {
  if (!response || response.type === "none") {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "response-block";

  const label = document.createElement("p");
  label.className = "response-label";
  label.textContent = "解答欄";
  wrapper.appendChild(label);

  if (response.type === "blank") {
    const line = document.createElement("div");
    line.className = "response-inline";
    line.innerHTML = `<span class="blank-field"></span>${response.unit ? `<span>${response.unit}</span>` : ""}`;
    wrapper.appendChild(line);
    return wrapper;
  }

  if (response.type === "multi_blank") {
    const group = document.createElement("div");
    group.className = "response-grid";
    for (const field of response.fields ?? []) {
      const cell = document.createElement("div");
      cell.className = "response-cell";
      cell.innerHTML = `<span>${field.label}</span><span class="blank-field short"></span>`;
      group.appendChild(cell);
    }
    wrapper.appendChild(group);
    return wrapper;
  }

  if (response.type === "free_text") {
    const lines = document.createElement("div");
    lines.className = "free-text-lines";
    for (let index = 0; index < (response.lines ?? 2); index += 1) {
      const line = document.createElement("span");
      line.className = "blank-field";
      lines.appendChild(line);
    }
    wrapper.appendChild(lines);
    return wrapper;
  }

  if (response.type === "choice") {
    const list = document.createElement("div");
    list.className = "choice-list";
    for (const choice of response.choices ?? []) {
      const row = document.createElement("label");
      row.className = "choice-item";
      const marker = document.createElement("span");
      marker.className = response.multiple ? "choice-marker checkbox" : "choice-marker radio";
      const text = document.createElement("span");
      text.textContent = choice.text;
      row.append(marker, text);
      list.appendChild(row);
    }
    wrapper.appendChild(list);
    return wrapper;
  }

  if (response.type === "draw_graph") {
    const hint = document.createElement("div");
    hint.className = "draw-graph-hint";
    hint.textContent = "数直線やグラフ上に作図する問題です。";
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
