import { createCanvas } from "./canvas.js";

export function renderNet(visual, container) {
  const cellSize = visual.cellSize ?? 48;
  const maxX = Math.max(...visual.faces.map((face) => face.x));
  const maxY = Math.max(...visual.faces.map((face) => face.y));
  const width = (maxX + 2) * cellSize;
  const height = (maxY + 2) * cellSize;
  const { ctx } = createCanvas(container, width, height);

  for (const face of visual.faces) {
    const x = (face.x + 0.5) * cellSize;
    const y = (face.y + 0.5) * cellSize;
    ctx.strokeRect(x, y, cellSize, cellSize);
    ctx.textAlign = "center";
    ctx.fillText(face.label, x + cellSize / 2, y + cellSize / 2 + 4);
  }
}
