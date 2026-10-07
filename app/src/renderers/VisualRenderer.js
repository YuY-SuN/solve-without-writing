import { renderTable } from "./TableRenderer.js?v20260617-1";
import { renderNumberLine } from "./NumberLineRenderer.js?v20260617-1";
import { renderGeometry2D } from "./Geometry2DRenderer.js?v20260617-1";
import { renderGeometry3D } from "./Geometry3DRenderer.js?v20260617-1";
import { renderGraphGrid } from "./GraphRenderer.js?v20260617-1";
import { renderHistogram } from "./HistogramRenderer.js?v20260617-1";
import { renderNet } from "./NetRenderer.js?v20260617-1";
import { renderFactorizationLadder } from "./FactorizationLadderRenderer.js?v20260617-1";

function renderImage(visual, container, options) {
  const imageUrl = (() => {
    if (typeof visual.src !== "string" || !visual.src.trim() || visual.src.startsWith("/")) {
      return null;
    }
    try {
      return new URL(visual.src, options.datasetUrl).href;
    } catch {
      return null;
    }
  })();

  if (!imageUrl) {
    const message = document.createElement("p");
    message.className = "visual-image-error";
    message.textContent = visual.alt || "画像を読み込めませんでした";
    container.appendChild(message);
    return;
  }

  const figure = document.createElement("figure");
  figure.className = "visual-image-figure";
  const image = document.createElement("img");
  image.className = "visual-image";
  image.src = imageUrl;
  image.alt = typeof visual.alt === "string" ? visual.alt : "";
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    console.warn(`Failed to load visual image: ${imageUrl}`);
    const message = document.createElement("p");
    message.className = "visual-image-error";
    message.textContent = visual.alt || "画像を読み込めませんでした";
    image.replaceWith(message);
  }, { once: true });
  figure.appendChild(image);

  if (typeof visual.caption === "string" && visual.caption.trim()) {
    const caption = document.createElement("figcaption");
    caption.textContent = visual.caption;
    figure.appendChild(caption);
  }
  container.appendChild(figure);
}

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
    case "image":
      return renderImage(visual, container, options);
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
