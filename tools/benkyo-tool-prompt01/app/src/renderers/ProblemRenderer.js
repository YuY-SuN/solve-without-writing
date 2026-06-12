import { renderPrompt, renderResponse, renderAnswer, renderExplanation } from "./TextRenderer.js";
import { renderVisualList } from "./VisualRenderer.js";

export function renderProblems(container, problems, options) {
  container.innerHTML = "";

  for (const problem of problems) {
    container.appendChild(renderProblem(problem, options));
  }
}

function renderProblem(problem, options) {
  const article = document.createElement("article");
  article.className = "problem-card";

  const header = document.createElement("header");
  header.className = "problem-card-header";

  const heading = document.createElement("div");
  heading.className = "problem-heading";
  heading.innerHTML = `
    <p class="section-line">${problem.section.no}. ${problem.section.category}</p>
    <h2>${problem.section.title}</h2>
  `;

  const meta = document.createElement("div");
  meta.className = "problem-meta";
  meta.innerHTML = `
    <span>問題ID: ${problem.id}</span>
    <span>${problem.page}ページ</span>
  `;

  header.append(heading, meta);

  const prompt = renderPrompt(problem);
  const visuals = document.createElement("div");
  visuals.className = "problem-visuals";
  renderVisualList(problem.visuals ?? [], visuals);

  const items = document.createElement("div");
  items.className = "problem-items";
  for (const item of problem.items ?? []) {
    const itemNode = document.createElement("section");
    itemNode.className = "problem-item";
    if (item.label || item.no) {
      const itemTitle = document.createElement("h3");
      itemTitle.textContent = [item.no, item.label].filter(Boolean).join(" ");
      itemNode.appendChild(itemTitle);
    }
    if (item.text) {
      const itemText = document.createElement("p");
      itemText.textContent = item.text;
      itemNode.appendChild(itemText);
    }
    if (item.context?.text) {
      itemNode.appendChild(renderPrompt({ prompt: null, context: item.context }));
    }
    if (item.visuals?.length) {
      const itemVisuals = document.createElement("div");
      itemVisuals.className = "problem-visuals";
      renderVisualList(item.visuals, itemVisuals);
      itemNode.appendChild(itemVisuals);
    }
    if (item.response) {
      const responseKey = item.id ?? `${problem.id}-item-${item.no ?? "response"}`;
      const responseNode = renderResponse(item.response, {
        responseKey,
        value: options.responseValues?.[responseKey] ?? null,
        onChange: (nextValue) => options.onResponseChange?.(responseKey, nextValue),
      });
      if (responseNode) {
        itemNode.appendChild(responseNode);
      }
    }
    if (options.showAnswers && item.answer) {
      itemNode.appendChild(renderAnswer(item.answer));
    }
    items.appendChild(itemNode);
  }

  const footer = document.createElement("footer");
  footer.className = "problem-footer";
  if (problem.response) {
    const responseNode = renderResponse(problem.response, {
      responseKey: problem.id,
      value: options.responseValues?.[problem.id] ?? null,
      onChange: (nextValue) => options.onResponseChange?.(problem.id, nextValue),
    });
    if (responseNode) {
      footer.appendChild(responseNode);
    }
  }
  if (options.showAnswers && problem.answer) {
    footer.appendChild(renderAnswer(problem.answer));
  }
  if (options.showExplanations && problem.explanation) {
    footer.appendChild(renderExplanation(problem.explanation));
  }

  article.append(header, prompt, visuals);
  if (items.childElementCount > 0) {
    article.appendChild(items);
  }
  if (footer.childElementCount > 0) {
    article.appendChild(footer);
  }

  return article;
}
