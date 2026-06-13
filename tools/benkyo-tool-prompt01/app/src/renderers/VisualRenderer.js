import { renderTable } from "./TableRenderer.js";
import { renderNumberLine } from "./NumberLineRenderer.js";
import { renderGeometry2D } from "./Geometry2DRenderer.js";
import { renderGeometry3D } from "./Geometry3DRenderer.js";
import { renderGraphGrid } from "./GraphRenderer.js";
import { renderHistogram } from "./HistogramRenderer.js";
import { renderNet } from "./NetRenderer.js";

export function renderVisualList(visuals, container, options = {}) {
  for (const visual of visuals) {
    const panel = document.createElement("div");
    panel.className = "visual-panel";
    renderVisual(visual, panel, options);
    container.appendChild(panel);
  }
}

export function renderVisual(visual, container, options = {}) {
  switch (visual.type) {
    case "table":
      return renderTable(visual, container, options);
    case "number_line":
      return renderNumberLine(visual, container, options);
    case "geometry_2d":
      return renderGeometry2D(visual, container);
    case "geometry_3d":
      return renderGeometry3D(visual, container);
    case "graph_grid":
      return renderGraphGrid(visual, container, options);
    case "histogram":
      return renderHistogram(visual, container);
    case "net":
      return renderNet(visual, container);
    default:
      container.textContent = `Unsupported visual: ${visual.type}`;
  }
}
