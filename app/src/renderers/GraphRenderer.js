import { createCanvas, drawingTheme, line } from "./canvas.js";

const GRAPH_PADDING = { top: 20, right: 20, bottom: 40, left: 44 };

function cloneSerializable(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getInnerSize(width, height) {
  return {
    innerWidth: width - GRAPH_PADDING.left - GRAPH_PADDING.right,
    innerHeight: height - GRAPH_PADDING.top - GRAPH_PADDING.bottom,
  };
}

function drawGraphGridBase(ctx, visual, width, height) {
  const { innerWidth, innerHeight } = getInnerSize(width, height);
  const xTickCount = (visual.xAxis.max - visual.xAxis.min) / visual.xAxis.tick;
  const yTickCount = (visual.yAxis.max - visual.yAxis.min) / visual.yAxis.tick;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = drawingTheme.gridStroke;
  for (let index = 0; index <= xTickCount; index += 1) {
    const x = GRAPH_PADDING.left + (innerWidth / xTickCount) * index;
    line(ctx, x, GRAPH_PADDING.top, x, height - GRAPH_PADDING.bottom);
  }
  for (let index = 0; index <= yTickCount; index += 1) {
    const y = height - GRAPH_PADDING.bottom - (innerHeight / yTickCount) * index;
    line(ctx, GRAPH_PADDING.left, y, width - GRAPH_PADDING.right, y);
  }

  ctx.strokeStyle = drawingTheme.stroke;
  line(ctx, GRAPH_PADDING.left, GRAPH_PADDING.top, GRAPH_PADDING.left, height - GRAPH_PADDING.bottom);
  line(ctx, GRAPH_PADDING.left, height - GRAPH_PADDING.bottom, width - GRAPH_PADDING.right, height - GRAPH_PADDING.bottom);

  ctx.textAlign = "center";
  for (let index = 0; index <= xTickCount; index += 1) {
    const value = visual.xAxis.min + visual.xAxis.tick * index;
    const x = GRAPH_PADDING.left + (innerWidth / xTickCount) * index;
    ctx.fillText(String(value), x, height - 12);
  }

  ctx.textAlign = "right";
  for (let index = 0; index <= yTickCount; index += 1) {
    const value = visual.yAxis.min + visual.yAxis.tick * index;
    const y = height - GRAPH_PADDING.bottom - (innerHeight / yTickCount) * index;
    ctx.fillText(String(value), GRAPH_PADDING.left - 8, y + 4);
  }

  ctx.textAlign = "left";
  ctx.fillText(visual.xAxis.label, width - GRAPH_PADDING.right - 10, height - 12);
  ctx.fillText(visual.yAxis.label, 8, GRAPH_PADDING.top + 6);
}

function findHistogramVisual(answerVisuals) {
  return (answerVisuals ?? []).find((item) => item.type === "histogram") ?? null;
}

function normalizeBins(value, binCount) {
  const bins = value && typeof value === "object" && Array.isArray(value.bins) ? value.bins : [];
  return Array.from({ length: binCount }, (_, index) => {
    const raw = bins[index];
    return typeof raw === "number" ? raw : 0;
  });
}

function valueToY(value, yAxis, height) {
  const { innerHeight } = getInnerSize(0, height);
  const ratio = (value - yAxis.min) / (yAxis.max - yAxis.min);
  return height - GRAPH_PADDING.bottom - ratio * innerHeight;
}

function yToValue(y, yAxis, height) {
  const { innerHeight } = getInnerSize(0, height);
  const plotBottom = height - GRAPH_PADDING.bottom;
  const ratio = (plotBottom - y) / innerHeight;
  return yAxis.min + ratio * (yAxis.max - yAxis.min);
}

function drawHistogramOverlay(ctx, width, height, histogramVisual, bins, selectedIndex) {
  ctx.clearRect(0, 0, width, height);
  const { innerWidth } = getInnerSize(width, height);
  const barWidth = innerWidth / bins.length;

  bins.forEach((value, index) => {
    const x = GRAPH_PADDING.left + barWidth * index + 2;
    const y = valueToY(value, histogramVisual.yAxis, height);
    const barHeight = height - GRAPH_PADDING.bottom - y;
    const selected = index === selectedIndex;

    ctx.fillStyle = selected ? drawingTheme.answerFill : "rgba(37, 99, 235, 0.18)";
    ctx.strokeStyle = selected ? drawingTheme.answer : drawingTheme.accent;
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.fillRect(x, y, barWidth - 4, barHeight);
    ctx.strokeRect(x, y, barWidth - 4, barHeight);

    ctx.fillStyle = selected ? drawingTheme.answer : drawingTheme.accent;
    ctx.textAlign = "center";
    ctx.fillText(String(value), x + (barWidth - 4) / 2, Math.max(y - 8, GRAPH_PADDING.top + 10));
  });

  ctx.lineWidth = drawingTheme.lineWidth;
}

function getPointerPosition(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function findBinIndex(pointerX, width, binCount) {
  const { innerWidth } = getInnerSize(width, 0);
  if (pointerX < GRAPH_PADDING.left || pointerX > width - GRAPH_PADDING.right) {
    return null;
  }
  const relativeX = pointerX - GRAPH_PADDING.left;
  return clamp(Math.floor((relativeX / innerWidth) * binCount), 0, binCount - 1);
}

function snapHistogramValue(pointerY, histogramVisual, height) {
  const raw = yToValue(pointerY, histogramVisual.yAxis, height);
  const step = histogramVisual.yAxis.tick > 0 ? histogramVisual.yAxis.tick : 1;
  const snapped = Math.round((raw - histogramVisual.yAxis.min) / step) * step + histogramVisual.yAxis.min;
  return clamp(snapped, histogramVisual.yAxis.min, histogramVisual.yAxis.max);
}

export function renderGraphGrid(visual, container, options = {}) {
  const width = visual.width ?? 360;
  const height = visual.height ?? 260;
  const histogramVisual =
    options.response?.type === "draw_graph" && options.onChange
      ? findHistogramVisual(options.answerVisuals)
      : null;

  if (!histogramVisual) {
    const { ctx } = createCanvas(container, width, height);
    drawGraphGridBase(ctx, visual, width, height);
    return;
  }

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
  status.textContent = "各棒の上端をドラッグして高さを入力します。";
  toolbar.appendChild(status);

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "visual-mini-button";
  resetButton.textContent = "選択を0にする";
  toolbar.appendChild(resetButton);

  wrapper.appendChild(toolbar);
  container.appendChild(wrapper);

  const binCount = histogramVisual.values.length;
  let bins = normalizeBins(options.value, binCount);
  let selectedIndex = null;
  let dragging = null;

  function commit(nextBins) {
    bins = [...nextBins];
    options.onChange?.(cloneSerializable({ bins }));
    redraw();
  }

  function redraw() {
    drawGraphGridBase(baseCtx, visual, width, height);
    drawHistogramOverlay(overlayCtx, width, height, histogramVisual, bins, selectedIndex);
    resetButton.disabled = selectedIndex === null;
  }

  function applyPointer(pointerX, pointerY, shouldCommit = false) {
    const index = findBinIndex(pointerX, width, binCount);
    if (index === null) {
      return;
    }
    selectedIndex = index;
    const nextBins = [...bins];
    nextBins[index] = snapHistogramValue(pointerY, histogramVisual, height);
    if (shouldCommit) {
      commit(nextBins);
      return;
    }
    bins = nextBins;
    redraw();
  }

  resetButton.addEventListener("click", () => {
    if (selectedIndex === null) {
      return;
    }
    const nextBins = [...bins];
    nextBins[selectedIndex] = 0;
    commit(nextBins);
  });

  overlayCanvas.addEventListener("keydown", (event) => {
    if ((event.key === "Delete" || event.key === "Backspace") && selectedIndex !== null) {
      event.preventDefault();
      const nextBins = [...bins];
      nextBins[selectedIndex] = 0;
      commit(nextBins);
    }
  });

  overlayCanvas.addEventListener("pointerdown", (event) => {
    overlayCanvas.focus();
    const pointer = getPointerPosition(event, overlayCanvas);
    dragging = { pointerId: event.pointerId };
    overlayCanvas.setPointerCapture(event.pointerId);
    applyPointer(pointer.x, pointer.y, false);
  });

  overlayCanvas.addEventListener("pointermove", (event) => {
    if (!dragging || dragging.pointerId !== event.pointerId) {
      return;
    }
    const pointer = getPointerPosition(event, overlayCanvas);
    applyPointer(pointer.x, pointer.y, false);
  });

  function finishDrag(event) {
    if (!dragging || dragging.pointerId !== event.pointerId) {
      return;
    }
    overlayCanvas.releasePointerCapture(event.pointerId);
    dragging = null;
    options.onChange?.(cloneSerializable({ bins }));
    redraw();
  }

  overlayCanvas.addEventListener("pointerup", finishDrag);
  overlayCanvas.addEventListener("pointercancel", finishDrag);

  redraw();
}
