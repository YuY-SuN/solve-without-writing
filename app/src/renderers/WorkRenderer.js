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

function cloneGuideValue(value, defaults) {
  const next = { ...defaults };
  if (!value || typeof value !== "object") {
    return next;
  }

  for (const key of Object.keys(defaults)) {
    next[key] = typeof value[key] === "string" ? value[key] : defaults[key];
  }
  return next;
}

function createWorkBlock(work, descriptionText) {
  const details = document.createElement("details");
  details.className = "work-block";
  details.open = work.defaultOpen !== false;

  const summary = document.createElement("summary");
  summary.className = "work-summary";
  summary.textContent = `${work.label ?? "考え方・途中式"}${work.optional === false ? "" : "（任意）"}`;
  details.appendChild(summary);

  const description = document.createElement("p");
  description.className = "work-description";
  description.textContent = descriptionText;
  details.appendChild(description);

  return details;
}

function createGuideCard(titleText, bodyText) {
  const card = document.createElement("section");
  card.className = "work-guide-card";

  const title = document.createElement("h4");
  title.className = "work-guide-title";
  title.textContent = titleText;
  card.appendChild(title);

  if (bodyText) {
    const body = document.createElement("p");
    body.className = "work-guide-text";
    body.textContent = bodyText;
    card.appendChild(body);
  }

  return card;
}

function createGuideField(labelText, control, hintText = "") {
  const field = document.createElement("label");
  field.className = "work-guide-field";

  const label = document.createElement("span");
  label.className = "work-guide-label";
  label.textContent = labelText;
  field.append(label, control);

  if (hintText) {
    const hint = document.createElement("span");
    hint.className = "work-guide-hint";
    hint.textContent = hintText;
    field.appendChild(hint);
  }

  return field;
}

function createTextInput(value, placeholder, onChange, className = "expression-input") {
  const input = document.createElement("input");
  input.type = "text";
  input.className = className;
  input.inputMode = "text";
  input.value = value ?? "";
  input.placeholder = placeholder;
  input.addEventListener("input", (event) => onChange(event.target.value));
  return input;
}

function createSelectControl(optionDefs, value, onChange, placeholder = "選んでください") {
  const select = document.createElement("select");
  select.className = "work-relation-select";

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = placeholder;
  select.appendChild(firstOption);

  for (const optionDef of optionDefs) {
    const option = document.createElement("option");
    if (typeof optionDef === "string") {
      option.value = optionDef;
      option.textContent = optionDef;
    } else {
      option.value = optionDef.value;
      option.textContent = optionDef.label;
    }
    select.appendChild(option);
  }

  select.value = value ?? "";
  select.addEventListener("change", (event) => onChange(event.target.value));
  return select;
}

function createGuidePreview() {
  const preview = document.createElement("p");
  preview.className = "work-guide-preview";
  return preview;
}

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
  const input = createTextInput(value, "例: 1/2 + 1/3, 3(x+2), 2^3 × 3^2", onChange, "expression-input");
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

function renderExpressionSteps(work, options = {}) {
  const { value = null, onChange = null } = options;
  let steps = cloneSteps(value, work);

  const details = createWorkBlock(
    work,
    work.description ?? "式を1行ずつ変形し、必要なら何をしたかをメモします。最終解答とは別に保存されます。",
  );

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

function renderDistributionGuide(work, options = {}) {
  const defaults = {
    operation: "",
    sharedFactor: "",
    firstTerm: "",
    secondTerm: "",
    rewrittenExpression: "",
    result: "",
    note: "",
  };
  let state = cloneGuideValue(options.value, defaults);
  const onChange = options.onChange ?? null;

  const details = createWorkBlock(
    work,
    work.description ?? "先に『どの数が両方にかかるか』を見つけてから、ばらした式を書きます。",
  );

  const operationCard = createGuideCard(
    "1. どの見方で進める？",
    work.prompts?.operation ?? "この式は、1つの数を2つの項へ配る見方ができるかを見ます。",
  );
  const operationSelect = createSelectControl(
    work.operationOptions ?? [
      { value: "expand", label: "ばらして見る" },
      { value: "keep", label: "まだまとめたまま見る" },
    ],
    state.operation,
    (nextValue) => updateState({ operation: nextValue }),
    "見方を選ぶ",
  );
  operationCard.appendChild(
    createGuideField(
      work.prompts?.operationLabel ?? "見方",
      operationSelect,
      work.hints?.operation ?? "迷ったら、同じ数が2つの項にかかっていないか探します。",
    ),
  );

  const splitCard = createGuideCard(
    "2. どこを配る？",
    work.prompts?.split ?? "『外側で同じようにかかる数』と『まとまりの中の2つの項』に分けて見ます。",
  );
  splitCard.append(
    createGuideField(
      work.prompts?.sharedFactor ?? "両方に同じようにかかる数",
      createTextInput(state.sharedFactor, work.placeholders?.sharedFactor ?? "例: (-12)", (nextValue) => updateState({ sharedFactor: nextValue })),
      work.hints?.sharedFactor ?? "外側で同じようにかかっている数を書きます。",
    ),
    createGuideField(
      work.prompts?.firstTerm ?? "まとまりの1つ目",
      createTextInput(state.firstTerm, work.placeholders?.firstTerm ?? "例: 100", (nextValue) => updateState({ firstTerm: nextValue })),
      work.hints?.firstTerm ?? "かっこの中やまとまりの1つ目を書きます。",
    ),
    createGuideField(
      work.prompts?.secondTerm ?? "まとまりの2つ目",
      createTextInput(state.secondTerm, work.placeholders?.secondTerm ?? "例: -1", (nextValue) => updateState({ secondTerm: nextValue })),
      work.hints?.secondTerm ?? "2つ目は符号も含めて考えると整理しやすいです。",
    ),
  );

  const preview = createGuidePreview();
  splitCard.appendChild(preview);

  const rewriteCard = createGuideCard(
    "3. ばらしたあとの形を書く",
    work.prompts?.rewrite ?? "それぞれの項に同じ数をかけた形へ言いかえます。",
  );
  rewriteCard.append(
    createGuideField(
      work.prompts?.rewrittenExpression ?? "言いかえた式",
      createTextInput(state.rewrittenExpression, work.placeholders?.rewrittenExpression ?? "例: 100×(-12)-1×(-12)", (nextValue) => updateState({ rewrittenExpression: nextValue })),
      work.hints?.rewrittenExpression ?? "まずは計算せず、形の言いかえだけを書きます。",
    ),
    createGuideField(
      work.prompts?.result ?? "計算結果",
      createTextInput(state.result, work.placeholders?.result ?? "例: -1188", (nextValue) => updateState({ result: nextValue })),
      work.hints?.result ?? "最後に数の計算へ進みます。",
    ),
    createGuideField(
      work.prompts?.note ?? "気づいたことメモ",
      createTextInput(state.note, work.placeholders?.note ?? "例: 符号を先に確認した", (nextValue) => updateState({ note: nextValue }), "work-note-input"),
      work.hints?.note ?? "どこを見れば分配しやすいかを一言で残します。",
    ),
  );

  details.append(operationCard, splitCard, rewriteCard);
  syncPreview();
  return details;

  function updateState(patch) {
    state = { ...state, ...patch };
    onChange?.({ ...state });
    syncPreview();
  }

  function syncPreview() {
    const pieces = [];
    if (state.firstTerm && state.sharedFactor) {
      pieces.push(`${state.firstTerm} に ${state.sharedFactor} をかける`);
    }
    if (state.secondTerm && state.sharedFactor) {
      pieces.push(`${state.secondTerm} にも ${state.sharedFactor} をかける`);
    }

    if (pieces.length === 0) {
      preview.textContent = work.previewFallback ?? "ここで『どの数が両方にかかるか』が見えると、式をばらしやすくなります。";
      return;
    }

    const head = state.operation === "expand"
      ? "ばらして見ると: "
      : state.operation === "keep"
        ? "まだ整理途中でも: "
        : "見方のメモ: ";
    preview.textContent = `${head}${pieces.join(" / ")}`;
  }
}

function renderFractionGuide(work, options = {}) {
  const defaults = {
    commonDenominator: "",
    leftMultiplier: "",
    rightMultiplier: "",
    leftConverted: "",
    rightConverted: "",
    sumExpression: "",
    result: "",
    note: "",
  };
  let state = cloneGuideValue(options.value, defaults);
  const onChange = options.onChange ?? null;

  const details = createWorkBlock(
    work,
    work.description ?? "先に分母をそろえる先を決めてから、それぞれ何倍するかを考えます。",
  );

  const decideCard = createGuideCard(
    "1. どこへそろえる？",
    work.prompts?.decide ?? "2つの分母を見比べて、同じ分母にそろえる先を決めます。",
  );
  decideCard.appendChild(
    createGuideField(
      work.prompts?.commonDenominator ?? "共通の分母",
      createTextInput(state.commonDenominator, work.placeholders?.commonDenominator ?? "例: 18", (nextValue) => updateState({ commonDenominator: nextValue })),
      work.hints?.commonDenominator ?? "9 と 6 の両方を割り切れる数を選びます。",
    ),
  );

  const multiplierCard = createGuideCard(
    "2. それぞれ何倍する？",
    work.prompts?.multiplier ?? "分母をそろえるために、左と右をそれぞれ何倍するか考えます。",
  );
  multiplierCard.append(
    createGuideField(
      work.prompts?.leftMultiplier ?? `${work.leftLabel ?? "左の分数"}は何倍？`,
      createTextInput(state.leftMultiplier, work.placeholders?.leftMultiplier ?? "例: 2", (nextValue) => updateState({ leftMultiplier: nextValue })),
      work.hints?.leftMultiplier ?? "分母 9 を共通分母へ合わせる倍率です。",
    ),
    createGuideField(
      work.prompts?.rightMultiplier ?? `${work.rightLabel ?? "右の分数"}は何倍？`,
      createTextInput(state.rightMultiplier, work.placeholders?.rightMultiplier ?? "例: 3", (nextValue) => updateState({ rightMultiplier: nextValue })),
      work.hints?.rightMultiplier ?? "分母 6 を共通分母へ合わせる倍率です。",
    ),
  );

  const preview = createGuidePreview();
  multiplierCard.appendChild(preview);

  const convertCard = createGuideCard(
    "3. 通分後の形と計算を書く",
    work.prompts?.convert ?? "分母をそろえた形を書いてから、分子を計算します。",
  );
  convertCard.append(
    createGuideField(
      work.prompts?.leftConverted ?? `${work.leftLabel ?? "左の分数"}を通分した形`,
      createTextInput(state.leftConverted, work.placeholders?.leftConverted ?? "例: -4/18", (nextValue) => updateState({ leftConverted: nextValue })),
      work.hints?.leftConverted ?? "分子も同じ倍率で変わることを意識します。",
    ),
    createGuideField(
      work.prompts?.rightConverted ?? `${work.rightLabel ?? "右の分数"}を通分した形`,
      createTextInput(state.rightConverted, work.placeholders?.rightConverted ?? "例: -15/18", (nextValue) => updateState({ rightConverted: nextValue })),
      work.hints?.rightConverted ?? "符号もそのまま引き継ぎます。",
    ),
    createGuideField(
      work.prompts?.sumExpression ?? "通分後のたし算", 
      createTextInput(state.sumExpression, work.placeholders?.sumExpression ?? "例: -4/18 + -15/18", (nextValue) => updateState({ sumExpression: nextValue })),
      work.hints?.sumExpression ?? "分母がそろったら分子どうしを見ます。",
    ),
    createGuideField(
      work.prompts?.result ?? "計算結果",
      createTextInput(state.result, work.placeholders?.result ?? "例: -19/18", (nextValue) => updateState({ result: nextValue })),
      work.hints?.result ?? "最後に必要なら帯分数や約分も考えます。",
    ),
    createGuideField(
      work.prompts?.note ?? "気づいたことメモ",
      createTextInput(state.note, work.placeholders?.note ?? "例: 先に 18 を目標にした", (nextValue) => updateState({ note: nextValue }), "work-note-input"),
      work.hints?.note ?? "『何にそろえたか』を一言で残すと再現しやすいです。",
    ),
  );

  details.append(decideCard, multiplierCard, convertCard);
  syncPreview();
  return details;

  function updateState(patch) {
    state = { ...state, ...patch };
    onChange?.({ ...state });
    syncPreview();
  }

  function syncPreview() {
    if (!state.commonDenominator && !state.leftMultiplier && !state.rightMultiplier) {
      preview.textContent = work.previewFallback ?? "まず『分母をどこへそろえるか』を決めると、次に何倍するかが見えてきます。";
      return;
    }

    const parts = [];
    if (state.commonDenominator) {
      parts.push(`分母を ${state.commonDenominator} にそろえる`);
    }
    if (state.leftMultiplier) {
      parts.push(`${work.leftLabel ?? "左"}は ${state.leftMultiplier} 倍`);
    }
    if (state.rightMultiplier) {
      parts.push(`${work.rightLabel ?? "右"}は ${state.rightMultiplier} 倍`);
    }
    preview.textContent = `通分の見通し: ${parts.join(" / ")}`;
  }
}

export function renderWork(work, options = {}) {
  if (!work?.type) {
    return null;
  }

  if (work.type === "expression_steps") {
    return renderExpressionSteps(work, options);
  }

  if (work.type === "distribution_guide") {
    return renderDistributionGuide(work, options);
  }

  if (work.type === "fraction_common_denominator_guide") {
    return renderFractionGuide(work, options);
  }

  return null;
}
