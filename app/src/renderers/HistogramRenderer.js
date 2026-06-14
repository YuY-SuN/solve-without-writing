import { renderGraphGrid } from "./GraphRenderer.js";
import { createCanvas, drawingTheme } from "./canvas.js";

export function renderHistogram(visual, container) {
  renderGraphGrid(
    {
      width: visual.width,
      height: visual.height,
      xAxis: {
        label: visual.xAxis.label,
        min: 0,
        max: visual.values.length,
        tick: 1,
      },
      yAxis: visual.yAxis,
    },
    container,
  );

  const canvas = container.querySelector("canvas:last-of-type");
  const ctx = canvas.getContext("2d");
  const width = visual.width ?? 360;
  const height = visual.height ?? 260;
  const padding = { top: 20, right: 20, bottom: 40, left: 44 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const barWidth = innerWidth / visual.values.length;
  const max = visual.yAxis.max - visual.yAxis.min;

  ctx.fillStyle = drawingTheme.strongFill;
  ctx.strokeStyle = drawingTheme.stroke;

  visual.values.forEach((value, index) => {
    const barHeight = (value / max) * innerHeight;
    const x = padding.left + barWidth * index + 2;
    const y = height - padding.bottom - barHeight;
    ctx.fillRect(x, y, barWidth - 4, barHeight);
    ctx.strokeRect(x, y, barWidth - 4, barHeight);

    const bin = visual.xAxis.bins[index];
    const label = `${bin.from}-${bin.to}`;
    ctx.save();
    ctx.translate(x + barWidth * 0.35, height - 24);
    ctx.rotate(-0.24);
    ctx.fillStyle = drawingTheme.stroke;
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });
}
