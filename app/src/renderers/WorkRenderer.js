const RELATION_OPTIONS = ["", "=", "≈", "<", ">", "→", "⇔"];
const DEFAULT_NOTES = ["通分", "約分", "分配法則", "移項", "同類項をまとめる", "計算"];
const SYMBOL_BUTTONS = [
  { label: "分数", insert: "□/□" },
  { label: "累乗", insert: "^" },
  { label: "√", insert: "√" },
  { label: "( )", insert: "(  )" },
  { label: "×", insert: "×" },
  { label: "÷", insert: "÷" },
  { label: "−", insert: "−" },
];

function cloneSteps(value, work) {
  if (Array.isArray(value?.steps)) {
    return value.steps.map((step) => ({
      relation: typeof step.relation === "string" ? step.relation : "",
      expression: typeof step.expression === "string" ? step.expression : "",
      note: typeof step.note === "string" ? step.note : "",
    }));
  }

  const starterExpression = work?.starter?.expression;
  return [
    {
      relation: "",
      expression: typeof starterExpression === "string" ? starterExpression : "",
      note: "",
    },
  ];
}

function normalizeSteps(steps) {
  return {
    steps: steps.map((step) => ({
      relation: step.relation ?? "",
      expression: step.expression ?? "",
      note: step.note ?? "",
    })),
  };
}

function createMathInput(value, onChange) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "expression-input";
  input.inputMode = "text";
  input.value = value ?? "";
  input.placeholder = "例: 1/2 + 1/3, 3(x+2), 2^3 × 3^2";
  input.addEventListener("input", (event) => onChange(event.target.value));
  return input;
}

function insertAtCursor(input, text) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const nextValue = `${input.value.slice(0, start)}${text}${input.value.slice(end)}`;
  input.value = nextValue;
  const cursor = start + text.length;
  input.setSelectionRange(cursor, cursor);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
}

function appendStepRow(list, steps, index, commit, redraw) {
  const step = steps[index];
  const row = document.createElement("div");
  row.className = "work-step-row";

  const relation = document.createElement("select");
  relation.className = "work-relation-select";
  relation.setAttribute("aria-label", `${index + 1}行目の関係記号`);
  for (const optionValue of RELATION_OPTIONS) {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue || "初期式";
    relation.appendChild(option);
  }
  relation.value = step.relation ?? "";
  relation.addEventListener("change", (event) => {
    steps[index] = { ...steps[index], relation: event.target.value };
    commit(steps);
  });

  const expressionGroup = document.createElement("div");
  expressionGroup.className = "expression-input-group";
  const expressionInput = createMathInput(step.expression, (nextExpression) => {
    steps[index] = { ...steps[index], expression: nextExpression };
    commit(steps);
  });

  const toolbar = document.createElement("div");
  toolbar.className = "expression-toolbar";
  for (const symbol of SYMBOL_BUTTONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "expression-symbol-button";
    button.textContent = symbol.label;
    button.addEventListener("click", () => insertAtCursor(expressionInput, symbol.insert));
    toolbar.appendChild(button);
  }
  expressionGroup.append(expressionInput, toolbar);

  const note = document.createElement("input");
  note.type = "text";
  note.className = "work-note-input";
  note.value = step.note ?? "";
  note.placeholder = "メモ（通分、約分など）";
  note.addEventListener("input", (event) => {
    steps[index] = { ...steps[index], note: event.target.value };
    commit(steps);
  });

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "work-row-remove secondary-button";
  removeButton.textContent = "行を削除";
  removeButton.disabled = steps.length <= 1;
  removeButton.addEventListener("click", () => {
    steps.splice(index, 1);
    redraw(steps);
  });

  row.append(relation, expressionGroup, note, removeButton);
  list.appendChild(row);
}

function renderSuggestedNotes(work, getSteps, redraw) {
  const notes = [...new Set([...(work.suggestedNotes ?? []), ...DEFAULT_NOTES])];
  const wrapper = document.createElement("div");
  wrapper.className = "work-suggested-notes";

  const label = document.createElement("span");
  label.textContent = "メモ候補:";
  wrapper.appendChild(label);

  for (const noteText of notes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "expression-note-button";
    button.textContent = noteText;
    button.addEventListener("click", () => {
      const currentSteps = getSteps();
      const lastIndex = Math.max(0, currentSteps.length - 1);
      currentSteps[lastIndex] = { ...currentSteps[lastIndex], note: noteText };
      redraw(currentSteps);
    });
    wrapper.appendChild(button);
  }

  return wrapper;
}

export function renderWork(work, options = {}) {
  if (!work || work.type !== "expression_steps") {
    return null;
  }

  const { value = null, onChange = null } = options;
  let steps = cloneSteps(value, work);

  const details = document.createElement("details");
  details.className = "work-block";
  details.open = work.defaultOpen !== false;

  const summary = document.createElement("summary");
  summary.className = "work-summary";
  summary.textContent = `${work.label ?? "考え方・途中式"}${work.optional === false ? "" : "（任意）"}`;
  details.appendChild(summary);

  const description = document.createElement("p");
  description.className = "work-description";
  description.textContent = "式を1行ずつ変形し、必要なら何をしたかをメモします。最終解答とは別に保存されます。";
  details.appendChild(description);

  const list = document.createElement("div");
  list.className = "work-steps";
  details.appendChild(list);

  function commit(nextSteps) {
    steps = nextSteps.map((step) => ({ ...step }));
    onChange?.(normalizeSteps(steps));
  }

  function redraw(nextSteps) {
    commit(nextSteps);
    redrawRows();
  }

  function redrawRows() {
    list.innerHTML = "";
    steps.forEach((_, index) => appendStepRow(list, steps, index, commit, redraw));
  }

  redrawRows();
  details.appendChild(renderSuggestedNotes(work, () => steps.map((step) => ({ ...step })), redraw));

  const actions = document.createElement("div");
  actions.className = "work-actions";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "secondary-button";
  addButton.textContent = "＋ 行を追加";
  addButton.addEventListener("click", () => {
    redraw([...steps, { relation: "=", expression: "", note: "" }]);
  });

  actions.appendChild(addButton);
  details.appendChild(actions);

  return details;
}
