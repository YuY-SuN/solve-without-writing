import { createCanvas, drawingTheme, line } from "./canvas.js";

export function renderGraphGrid(visual, container) {
  const width = visual.width ?? 360;
  const height = visual.height ?? 260;
  const padding = { top: 20, right: 20, bottom: 40, left: 44 };
  const { ctx } = createCanvas(container, width, height);

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const xTickCount = (visual.xAxis.max - visual.xAxis.min) / visual.xAxis.tick;
  const yTickCount = (visual.yAxis.max - visual.yAxis.min) / visual.yAxis.tick;

  ctx.strokeStyle = drawingTheme.gridStroke;
  for (let index = 0; index <= xTickCount; index += 1) {
    const x = padding.left + (innerWidth / xTickCount) * index;
    line(ctx, x, padding.top, x, height - padding.bottom);
  }
  for (let index = 0; index <= yTickCount; index += 1) {
    const y = height - padding.bottom - (innerHeight / yTickCount) * index;
    line(ctx, padding.left, y, width - padding.right, y);
  }

  ctx.strokeStyle = drawingTheme.stroke;
  line(ctx, padding.left, padding.top, padding.left, height - padding.bottom);
  line(ctx, padding.left, height - padding.bottom, width - padding.right, height - padding.bottom);

  ctx.textAlign = "center";
  for (let index = 0; index <= xTickCount; index += 1) {
    const value = visual.xAxis.min + visual.xAxis.tick * index;
    const x = padding.left + (innerWidth / xTickCount) * index;
    ctx.fillText(String(value), x, height - 12);
  }

  ctx.textAlign = "right";
  for (let index = 0; index <= yTickCount; index += 1) {
    const value = visual.yAxis.min + visual.yAxis.tick * index;
    const y = height - padding.bottom - (innerHeight / yTickCount) * index;
    ctx.fillText(String(value), padding.left - 8, y + 4);
  }

  ctx.textAlign = "left";
  ctx.fillText(visual.xAxis.label, width - padding.right - 10, height - 12);
  ctx.fillText(visual.yAxis.label, 8, padding.top + 6);
}
