import { createCanvas, drawingTheme, line, valueToX } from "./canvas.js";

export function renderNumberLine(visual, container) {
  const width = visual.width ?? 520;
  const height = visual.height ?? 120;
  const padding = 32;
  const axisY = Math.round(height * 0.56);
  const { ctx } = createCanvas(container, width, height);

  ctx.strokeStyle = drawingTheme.stroke;
  ctx.fillStyle = drawingTheme.stroke;
  line(ctx, padding, axisY, width - padding, axisY);

  for (let value = visual.range.min; value <= visual.range.max; value += visual.ticks.minor) {
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
    ctx.fillText(point.label, x, axisY - 16);
  }
}
