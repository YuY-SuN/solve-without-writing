function findLadderTarget(response, key) {
  return response?.targets?.find((entry) => entry.key === key) ?? null;
}

function canBindLadderCell(response, key) {
  return response?.type === "ladder_fill" && Boolean(findLadderTarget(response, key));
}

function createLadderInput(currentValue, key, options) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "response-input response-input-short ladder-fill-input";
  input.value = currentValue ?? "";
  input.addEventListener("input", (event) => {
    options.onChange?.((existingValue) => {
      const next = existingValue && typeof existingValue === "object" ? { ...existingValue } : {};
      next[key] = event.target.value;
      return next;
    });
  });
  return input;
}

function renderLadderCellValue(value, container, options) {
  if (value && typeof value === "object" && value.blank === true && value.key) {
    if (canBindLadderCell(options.response, value.key)) {
      const currentValue = options.value && typeof options.value === "object"
        ? options.value[value.key]
        : "";
      container.appendChild(createLadderInput(currentValue, value.key, options));
    } else {
      const blank = document.createElement("span");
      blank.className = "ladder-blank-placeholder";
      container.appendChild(blank);
    }
    return;
  }

  container.textContent = value ?? "";
}

function createStepCell(className, value, options) {
  const cell = document.createElement("div");
  cell.className = className;
  renderLadderCellValue(value, cell, options);
  return cell;
}

export function renderFactorizationLadder(visual, container, options = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "factorization-ladder";

  for (const step of visual.steps ?? []) {
    const row = document.createElement("div");
    row.className = "factorization-ladder-step";

    row.appendChild(createStepCell("factorization-ladder-divisor", step.divisor, options));

    const bracket = document.createElement("div");
    bracket.className = "factorization-ladder-bracket";
    row.appendChild(bracket);

    const right = document.createElement("div");
    right.className = "factorization-ladder-right";
    right.appendChild(createStepCell("factorization-ladder-dividend", step.dividend, options));
    right.appendChild(createStepCell("factorization-ladder-quotient", step.quotient, options));

    if (step.note) {
      const note = document.createElement("p");
      note.className = "factorization-ladder-note";
      note.textContent = step.note;
      right.appendChild(note);
    }

    row.appendChild(right);
    wrapper.appendChild(row);
  }

  if (visual.finalExpression) {
    const finalRow = document.createElement("div");
    finalRow.className = "factorization-ladder-final";

    const left = document.createElement("span");
    left.className = "factorization-ladder-final-left";
    left.textContent = `${visual.finalExpression.left} =`;

    const right = document.createElement("span");
    right.className = "factorization-ladder-final-right";
    renderLadderCellValue(visual.finalExpression.right, right, options);

    finalRow.append(left, right);
    wrapper.appendChild(finalRow);
  }

  container.appendChild(wrapper);
}
