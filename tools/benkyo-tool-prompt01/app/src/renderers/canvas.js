export const drawingTheme = {
  font: "14px sans-serif",
  smallFont: "12px sans-serif",
  stroke: "#1f2937",
  lightStroke: "#94a3b8",
  gridStroke: "#dbe4f0",
  fill: "#dceeff",
  strongFill: "#8ec5ff",
  lineWidth: 1.5,
};

export function createCanvas(container, width, height) {
  const canvas = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.font = drawingTheme.font;
  ctx.lineWidth = drawingTheme.lineWidth;
  ctx.strokeStyle = drawingTheme.stroke;
  ctx.fillStyle = drawingTheme.stroke;

  container.appendChild(canvas);
  return { canvas, ctx };
}

export function valueToX(value, min, max, width, padding) {
  const ratio = (value - min) / (max - min);
  return padding + ratio * (width - padding * 2);
}

export function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
