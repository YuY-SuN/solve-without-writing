import { createCanvas, drawingTheme, line } from "./canvas.js";

export function renderGeometry2D(visual, container) {
  const width = visual.width ?? 240;
  const height = visual.height ?? 180;
  const { ctx } = createCanvas(container, width, height);

  ctx.strokeStyle = drawingTheme.stroke;
  ctx.fillStyle = drawingTheme.stroke;

  switch (visual.shape) {
    case "triangle":
      drawTriangle(ctx, width, height, visual);
      break;
    case "parallelogram":
      drawParallelogram(ctx, width, height, visual);
      break;
    case "rhombus":
      drawRhombus(ctx, width, height, visual);
      break;
    case "trapezoid":
      drawTrapezoid(ctx, width, height, visual);
      break;
    default:
      ctx.fillText(`Unsupported shape: ${visual.shape}`, 12, 24);
  }
}

function drawTriangle(ctx, width, height, visual) {
  const points = [
    [width * 0.2, height * 0.82],
    [width * 0.82, height * 0.82],
    [width * 0.54, height * 0.18],
  ];
  drawPolygon(ctx, points);
  line(ctx, width * 0.54, height * 0.18, width * 0.54, height * 0.82);
  renderLabels(ctx, visual.labels, {
    base: [width * 0.51, height * 0.95],
    height: [width * 0.61, height * 0.48],
  });
}

function drawParallelogram(ctx, width, height, visual) {
  const points = [
    [width * 0.2, height * 0.78],
    [width * 0.72, height * 0.78],
    [width * 0.86, height * 0.32],
    [width * 0.34, height * 0.32],
  ];
  drawPolygon(ctx, points);
  line(ctx, width * 0.34, height * 0.32, width * 0.34, height * 0.78);
  renderLabels(ctx, visual.labels, {
    base: [width * 0.46, height * 0.92],
    height: [width * 0.22, height * 0.54],
  });
}

function drawRhombus(ctx, width, height, visual) {
  const points = [
    [width * 0.5, height * 0.12],
    [width * 0.84, height * 0.5],
    [width * 0.5, height * 0.88],
    [width * 0.16, height * 0.5],
  ];
  drawPolygon(ctx, points);
  line(ctx, width * 0.16, height * 0.5, width * 0.84, height * 0.5);
  line(ctx, width * 0.5, height * 0.12, width * 0.5, height * 0.88);
  renderLabels(ctx, visual.labels, {
    diagonal_h: [width * 0.5, height * 0.45],
    diagonal_v: [width * 0.58, height * 0.52],
  });
}

function drawTrapezoid(ctx, width, height, visual) {
  const points = [
    [width * 0.18, height * 0.82],
    [width * 0.82, height * 0.82],
    [width * 0.68, height * 0.3],
    [width * 0.34, height * 0.3],
  ];
  drawPolygon(ctx, points);
  line(ctx, width * 0.34, height * 0.3, width * 0.34, height * 0.82);
  renderLabels(ctx, visual.labels, {
    top: [width * 0.51, height * 0.24],
    bottom: [width * 0.5, height * 0.95],
    height: [width * 0.22, height * 0.56],
  });
}

function drawPolygon(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) {
    ctx.lineTo(...point);
  }
  ctx.closePath();
  ctx.stroke();
}

function renderLabels(ctx, labels = [], anchors) {
  ctx.textAlign = "center";
  for (const label of labels) {
    const anchor = anchors[label.target];
    if (!anchor) {
      continue;
    }
    ctx.fillText(label.text, anchor[0], anchor[1]);
  }
}
