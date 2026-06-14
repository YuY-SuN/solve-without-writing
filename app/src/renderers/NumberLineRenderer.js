import { createCanvas, drawingTheme, line, valueToX, xToValue } from "./canvas.js";

const NUMBER_LINE_PADDING = 32;
const NUMBER_LINE_HIT_RADIUS = 12;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeNumber(value) {
  const rounded = Math.round(value * 1000) / 1000;
  return Math.abs(rounded) < 1e-9 ? 0 : rounded;
}

function snapToStep(value, step, min, max) {
  const safeStep = step && step > 0 ? step : 1;
  const snapped = Math.round((value - min) / safeStep) * safeStep + min;
  return normalizeNumber(clamp(snapped, min, max));
}

function cloneSerializable(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function getAxisY(height) {
  return Math.round(height * 0.56);
}

function drawNumberLineBase(ctx, visual, width, height, padding, axisY) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = drawingTheme.stroke;
  ctx.fillStyle = drawingTheme.stroke;
  line(ctx, padding, axisY, width - padding, axisY);

  for (let value = visual.range.min; value <= visual.range.max + 1e-9; value += visual.ticks.minor) {
    const x = valueToX(value, visual.range.min, visual.range.max, width, padding);
    const isMajor = Math.abs(value % visual.ticks.major) < 1e-9;
    line(ctx, x, axisY - (isMajor ? 12 : 7), x, axisY + (isMajor ? 12 : 7));
  }

  for (const label of visual.ticks.labels ?? []) {
    const x = valueToX(label, visual.range.min, visual.range.max, width, padding);
    ctx.textAlign = "center";
    ctx.fillText(String(label), x, axisY + 28);
  }

  for (const point of visual.points ?? []) {
    const x = valueToX(point.value, visual.range.min, visual.range.max, width, padding);
    ctx.beginPath();
    ctx.arc(x, axisY, 4, 0, Math.PI * 2);
    ctx.fill();
    if (point.label) {
      ctx.fillText(point.label, x, axisY - 16);
    }
  }
}

function getInteractiveMode(response) {
  if (response?.type === "draw_point" || response?.type === "draw_graph") {
    return response.type;
  }
  return null;
}

function getAnswerLabelOrder(answer) {
  if (!answer?.value || Array.isArray(answer.value) || typeof answer.value !== "object") {
    return [];
  }
  return Object.keys(answer.value);
}

function buildDrawPointEntries(value, answerLabelOrder) {
  const entries = [];
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const consumed = new Set();

  for (const label of answerLabelOrder) {
    if (typeof source[label] === "number") {
      entries.push({ id: label, label, value: normalizeNumber(source[label]) });
      consumed.add(label);
    }
  }

  for (const [label, pointValue] of Object.entries(source)) {
    if (consumed.has(label) || typeof pointValue !== "number") {
      continue;
    }
    entries.push({ id: label, label, value: normalizeNumber(pointValue) });
  }

  return entries;
}

function buildDrawGraphEntries(value) {
  const numbers = Array.isArray(value)
    ? value.filter((item) => typeof item === "number").map((item) => normalizeNumber(item)).sort((left, right) => left - right)
    : [];
  return numbers.map((pointValue, index) => ({
    id: `point-${index}`,
    label: "",
    value: pointValue,
  }));
}

function buildEntries(mode, value, answerLabelOrder) {
  return mode === "draw_point"
    ? buildDrawPointEntries(value, answerLabelOrder)
    : buildDrawGraphEntries(value);
}

function serializeEntries(mode, entries, answerLabelOrder) {
  if (mode === "draw_point") {
    const next = {};
    const order = answerLabelOrder.length > 0 ? answerLabelOrder : entries.map((entry) => entry.label);
    for (const label of order) {
      const match = entries.find((entry) => entry.label === label);
      if (match) {
        next[label] = normalizeNumber(match.value);
      }
    }
    for (const entry of entries) {
      if (!(entry.label in next)) {
        next[entry.label] = normalizeNumber(entry.value);
      }
    }
    return next;
  }

  return entries
    .map((entry) => normalizeNumber(entry.value))
    .sort((left, right) => left - right);
}

function getPointerPosition(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function findHitEntry(entries, visual, width, padding, pointerX) {
  let match = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const entry of entries) {
    const x = valueToX(entry.value, visual.range.min, visual.range.max, width, padding);
    const distance = Math.abs(pointerX - x);
    if (distance <= NUMBER_LINE_HIT_RADIUS && distance < bestDistance) {
      bestDistance = distance;
      match = entry;
    }
  }

  return match;
}

function drawInteractiveEntries(ctx, entries, visual, width, height, axisY, padding, selectedId) {
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = "center";

  for (const entry of entries) {
    const x = valueToX(entry.value, visual.range.min, visual.range.max, width, padding);
    const selected = entry.id === selectedId;
    ctx.beginPath();
    ctx.fillStyle = selected ? drawingTheme.accent : drawingTheme.stroke;
    ctx.arc(x, axisY, selected ? 6 : 5, 0, Math.PI * 2);
    ctx.fill();

    if (selected) {
      ctx.beginPath();
      ctx.strokeStyle = drawingTheme.accent;
      ctx.arc(x, axisY, 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (entry.label) {
      ctx.fillStyle = selected ? drawingTheme.accent : drawingTheme.stroke;
      ctx.fillText(entry.label, x, axisY - 18);
    }
  }
}

export function renderNumberLine(visual, container, options = {}) {
  const width = visual.width ?? 520;
  const height = visual.height ?? 120;
  const padding = NUMBER_LINE_PADDING;
  const axisY = getAxisY(height);
  const mode = getInteractiveMode(options.response);

  if (!mode || !options.onChange) {
    const { ctx } = createCanvas(container, width, height);
    drawNumberLineBase(ctx, visual, width, height, padding, axisY);
    return;
  }

  const answerLabelOrder = getAnswerLabelOrder(options.answer);
  const wrapper = document.createElement("div");
  wrapper.className = "interactive-visual";

  const stage = document.createElement("div");
  stage.className = "visual-canvas-stage";
  stage.style.width = `${width}px`;
  stage.style.height = `${height}px`;

  const { ctx: baseCtx } = createCanvas(stage, width, height, { className: "visual-canvas-layer" });
  const { canvas: overlayCanvas, ctx: overlayCtx } = createCanvas(stage, width, height, {
    className: "visual-canvas-layer",
  });
  overlayCanvas.style.touchAction = "none";
  overlayCanvas.tabIndex = 0;

  wrapper.appendChild(stage);

  const toolbar = document.createElement("div");
  toolbar.className = "visual-toolbar";

  const status = document.createElement("p");
  status.className = "visual-status";
  toolbar.appendChild(status);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "visual-mini-button";
  deleteButton.textContent = "選択を削除";
  toolbar.appendChild(deleteButton);

  wrapper.appendChild(toolbar);
  container.appendChild(wrapper);

  let currentValue = cloneSerializable(options.value) ?? (mode === "draw_point" ? {} : []);
  let draftEntries = buildEntries(mode, currentValue, answerLabelOrder);
  let selectedId = null;
  let dragging = null;

  function updateStatus() {
    if (mode === "draw_point") {
      const pendingLabels = answerLabelOrder.filter(
        (label) => !draftEntries.some((entry) => entry.label === label),
      );
      status.textContent = pendingLabels.length > 0
        ? `未配置: ${pendingLabels.join(", ")} / クリックで追加、ドラッグで移動`
        : "点をドラッグで移動できます。Delete またはボタンで削除できます。";
    } else {
      status.textContent = `点の数: ${draftEntries.length} / クリックで追加、ドラッグで移動`;
    }
    deleteButton.disabled = !draftEntries.some((entry) => entry.id === selectedId);
  }

  function syncSelection(snapshot) {
    if (!snapshot) {
      selectedId = null;
      return;
    }
    if (snapshot.type === "label") {
      selectedId = draftEntries.some((entry) => entry.label === snapshot.value) ? snapshot.value : null;
      return;
    }
    const match = draftEntries.find((entry) => Math.abs(entry.value - snapshot.value) < 1e-9);
    selectedId = match?.id ?? null;
  }

  function commitDraft(selectionSnapshot = null) {
    currentValue = serializeEntries(mode, draftEntries, answerLabelOrder);
    draftEntries = buildEntries(mode, currentValue, answerLabelOrder);
    syncSelection(selectionSnapshot);
    options.onChange?.(cloneSerializable(currentValue));
    redraw();
  }

  function redraw() {
    drawNumberLineBase(baseCtx, visual, width, height, padding, axisY);
    drawInteractiveEntries(overlayCtx, draftEntries, visual, width, height, axisY, padding, selectedId);
    updateStatus();
  }

  function deleteSelected() {
    if (!selectedId) {
      return;
    }
    draftEntries = draftEntries.filter((entry) => entry.id !== selectedId);
    selectedId = null;
    commitDraft();
  }

  deleteButton.addEventListener("click", () => {
    deleteSelected();
  });

  overlayCanvas.addEventListener("keydown", (event) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSelected();
    }
  });

  overlayCanvas.addEventListener("pointerdown", (event) => {
    overlayCanvas.focus();
    const pointer = getPointerPosition(event, overlayCanvas);
    const hit = findHitEntry(draftEntries, visual, width, padding, pointer.x);

    if (hit) {
      selectedId = hit.id;
      dragging = {
        pointerId: event.pointerId,
        selectedId: hit.id,
        selectionSnapshot: mode === "draw_point" ? { type: "label", value: hit.label } : { type: "value", value: hit.value },
      };
      overlayCanvas.setPointerCapture(event.pointerId);
      redraw();
      return;
    }

    const snappedValue = snapToStep(
      xToValue(pointer.x, visual.range.min, visual.range.max, width, padding),
      visual.ticks.minor,
      visual.range.min,
      visual.range.max,
    );

    if (mode === "draw_point") {
      const nextLabel = answerLabelOrder.find(
        (label) => !draftEntries.some((entry) => entry.label === label),
      );
      if (!nextLabel) {
        selectedId = null;
        redraw();
        return;
      }
      draftEntries = [...draftEntries, { id: nextLabel, label: nextLabel, value: snappedValue }];
      selectedId = nextLabel;
      commitDraft({ type: "label", value: nextLabel });
      return;
    }

    const duplicate = draftEntries.find((entry) => Math.abs(entry.value - snappedValue) < 1e-9);
    if (duplicate) {
      selectedId = duplicate.id;
      redraw();
      return;
    }

    draftEntries = [...draftEntries, { id: `point-${draftEntries.length}`, label: "", value: snappedValue }];
    commitDraft({ type: "value", value: snappedValue });
  });

  overlayCanvas.addEventListener("pointermove", (event) => {
    if (!dragging || dragging.pointerId !== event.pointerId) {
      return;
    }

    const pointer = getPointerPosition(event, overlayCanvas);
    const snappedValue = snapToStep(
      xToValue(pointer.x, visual.range.min, visual.range.max, width, padding),
      visual.ticks.minor,
      visual.range.min,
      visual.range.max,
    );

    draftEntries = draftEntries.map((entry) => {
      if (entry.id !== dragging.selectedId) {
        return entry;
      }
      return { ...entry, value: snappedValue };
    });
    selectedId = dragging.selectedId;
    redraw();
  });

  function finishDrag(event) {
    if (!dragging || dragging.pointerId !== event.pointerId) {
      return;
    }
    overlayCanvas.releasePointerCapture(event.pointerId);
    const snapshot = dragging.selectionSnapshot;
    dragging = null;
    commitDraft(snapshot);
  }

  overlayCanvas.addEventListener("pointerup", finishDrag);
  overlayCanvas.addEventListener("pointercancel", finishDrag);

  redraw();
}
