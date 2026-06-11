export function renderTable(visual, container) {
  const table = document.createElement("table");
  table.className = `problem-table ${visual.style?.compact ? "compact" : ""}`;

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const column of visual.columns ?? []) {
    const th = document.createElement("th");
    th.textContent = column;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const rowData of visual.rows ?? []) {
    const row = document.createElement("tr");
    rowData.forEach((value, index) => {
      const cell = document.createElement(index === 0 ? "th" : "td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}
