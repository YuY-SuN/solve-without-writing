import { renderTable } from "./TableRenderer.js?v20260617-1";
import { renderNumberLine } from "./NumberLineRenderer.js?v20260617-1";
import { renderGeometry2D } from "./Geometry2DRenderer.js?v20260617-1";
import { renderGeometry3D } from "./Geometry3DRenderer.js?v20260617-1";
import { renderGraphGrid } from "./GraphRenderer.js?v20260617-1";
import { renderHistogram } from "./HistogramRenderer.js?v20260617-1";
import { renderNet } from "./NetRenderer.js?v20260617-1";
import { renderFactorizationLadder } from "./FactorizationLadderRenderer.js?v20260617-1";

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
    case "factorization_ladder":
      return renderFactorizationLadder(visual, container, options);
    default:
      container.textContent = `Unsupported visual: ${visual.type}`;
  }
}
