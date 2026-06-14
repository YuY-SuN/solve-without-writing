function createTableFillInput(cellValue, cellKey, responseKey, onChange) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "response-input response-input-short table-fill-input";
  input.value = cellValue ?? "";
  input.addEventListener("input", (event) => {
    onChange?.((currentValue) => {
      const next = currentValue && typeof currentValue === "object" ? { ...currentValue } : {};
      next[cellKey] = event.target.value;
      return next;
    });
  });
  return input;
}

function findTableFillCellKey(response, rowIndex, colIndex) {
  const target = response?.targets?.find((entry) => entry.row === rowIndex && entry.col === colIndex);
  return target?.key ?? null;
}

function canBindBlankCell(response, blankCellKey, rowIndex, colIndex) {
  if (!response || !blankCellKey) {
    return false;
  }

  if (response.type === "table_fill") {
    const targetKey = findTableFillCellKey(response, rowIndex, colIndex);
    return targetKey === null || targetKey === blankCellKey;
  }

  if (response.type === "multi_blank") {
    return (response.fields ?? []).some((field) => field.key === blankCellKey);
  }

  return false;
}

export function renderTable(visual, container, options = {}) {
  const table = document.createElement("table");
  table.className = `problem-table ${visual.style?.compact ? "compact" : ""}`;

  if (visual.style?.header !== false) {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    for (const column of visual.columns ?? []) {
      const th = document.createElement("th");
      th.textContent = column;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);
  }

  const tbody = document.createElement("tbody");
  for (const [rowIndex, rowData] of (visual.rows ?? []).entries()) {
    const row = document.createElement("tr");
    rowData.forEach((value, colIndex) => {
      const cell = document.createElement(visual.style?.header === false ? "td" : indexToCellTag(colIndex));

      const blankCellKey = value && typeof value === "object" && value.blank === true && value.key
        ? value.key
        : null;
      const inputKey = canBindBlankCell(options.response, blankCellKey, rowIndex, colIndex)
        ? blankCellKey
        : null;

      if (inputKey) {
        const cellValue = options.value && typeof options.value === "object" ? options.value[inputKey] : "";
        cell.appendChild(createTableFillInput(cellValue, inputKey, options.responseKey, options.onChange));
      } else if (blankCellKey) {
        cell.textContent = "";
      } else {
        cell.textContent = value;
      }

      row.appendChild(cell);
    });
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}

function indexToCellTag(index) {
  return index === 0 ? "th" : "td";
}
