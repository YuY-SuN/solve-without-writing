export function renderPrompt(problem) {
  const wrapper = document.createElement("div");
  wrapper.className = "problem-prompt";
  wrapper.textContent = problem.prompt?.text ?? "";
  return wrapper;
}

export function renderResponse(response) {
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
  }

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
