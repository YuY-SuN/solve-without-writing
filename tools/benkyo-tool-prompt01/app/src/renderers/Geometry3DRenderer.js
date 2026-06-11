import { createCanvas, line } from "./canvas.js";

export function renderGeometry3D(visual, container) {
  const width = visual.width ?? 240;
  const height = visual.height ?? 180;
  const { ctx } = createCanvas(container, width, height);

  switch (visual.shape) {
    case "cube":
    case "cuboid":
      drawCuboid(ctx, width, height, visual);
      break;
    case "cylinder":
      drawCylinder(ctx, width, height, visual);
      break;
    default:
      ctx.fillText(`Unsupported shape: ${visual.shape}`, 12, 24);
  }
}

function drawCuboid(ctx, width, height, visual) {
  const x = width * 0.2;
  const y = height * 0.18;
  const w = width * 0.42;
  const h = height * 0.5;
  const d = width * 0.15;

  ctx.strokeRect(x, y + d, w, h);
  ctx.strokeRect(x + d, y, w, h);

  line(ctx, x, y + d, x + d, y);
  line(ctx, x + w, y + d, x + w + d, y);
  line(ctx, x, y + h + d, x + d, y + h);
  line(ctx, x + w, y + h + d, x + w + d, y + h);

  for (const label of visual.labels ?? []) {
    const pos =
      label.edge === "width"
        ? [x + w * 0.5, y + h + d + 18]
        : label.edge === "depth"
          ? [x + w + d * 0.65, y + h * 0.5]
          : [x - 14, y + h * 0.55];
    ctx.fillText(label.text, pos[0], pos[1]);
  }
}

function drawCylinder(ctx, width, height, visual) {
  const cx = width * 0.5;
  const topY = height * 0.26;
  const bottomY = height * 0.78;
  const rx = width * 0.22;
  const ry = height * 0.08;

  drawEllipse(ctx, cx, topY, rx, ry);
  drawEllipse(ctx, cx, bottomY, rx, ry);
  line(ctx, cx - rx, topY, cx - rx, bottomY);
  line(ctx, cx + rx, topY, cx + rx, bottomY);

  for (const label of visual.labels ?? []) {
    const pos =
      label.edge === "radius" ? [cx, bottomY + 24] : [cx + rx + 22, height * 0.52];
    ctx.fillText(label.text, pos[0], pos[1]);
  }
}

function drawEllipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
}
