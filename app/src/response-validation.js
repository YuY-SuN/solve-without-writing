const BASE_RESPONSE_TYPES = new Set([
  "blank",
  "multi_blank",
  "free_text",
  "choice",
  "table_fill",
  "ladder_fill",
  "draw_graph",
  "draw_point",
  "none",
  "word_order",
]);

function addIssue(issues, problemId, message) {
  issues.push(`${problemId}: ${message}`);
}

function validateChoice(response, issues, problemId, path) {
  if (!Array.isArray(response.choices)) {
    addIssue(issues, problemId, `${path}.choices must be an array`);
    return;
  }

  const keys = new Set();
  response.choices.forEach((choice, index) => {
    if (!choice || typeof choice !== "object" || typeof choice.key !== "string" || choice.key.length === 0) {
      addIssue(issues, problemId, `${path}.choices[${index}].key must be a non-empty string`);
      return;
    }
    if (keys.has(choice.key)) {
      addIssue(issues, problemId, `${path}.choices has duplicate key "${choice.key}"`);
    }
    keys.add(choice.key);
    if (typeof choice.text !== "string") {
      addIssue(issues, problemId, `${path}.choices[${index}].text must be a string`);
    }
  });

  if (response.multiple !== undefined && typeof response.multiple !== "boolean") {
    addIssue(issues, problemId, `${path}.multiple must be a boolean`);
  }
  for (const flag of ["shuffle", "showKeys"]) {
    if (response[flag] !== undefined && typeof response[flag] !== "boolean") {
      addIssue(issues, problemId, `${path}.${flag} must be a boolean`);
    }
  }
}

function validateResponse(response, answer, issues, problemId, path = "response") {
  if (!response || typeof response !== "object" || typeof response.type !== "string") {
    addIssue(issues, problemId, `${path}.type is required`);
    return;
  }

  if (response.type === "choice") {
    validateChoice(response, issues, problemId, path);
    return;
  }

  if (response.type === "word_order") {
    if (response.shuffle !== undefined && typeof response.shuffle !== "boolean") {
      addIssue(issues, problemId, `${path}.shuffle must be a boolean`);
    }
    if (!Array.isArray(response.tokens)) {
      addIssue(issues, problemId, `${path}.tokens must be an array`);
      return;
    }

    const tokenKeys = new Set();
    response.tokens.forEach((token, index) => {
      if (!token || typeof token !== "object" || typeof token.key !== "string" || token.key.length === 0) {
        addIssue(issues, problemId, `${path}.tokens[${index}].key must be a non-empty string`);
        return;
      }
      if (tokenKeys.has(token.key)) {
        addIssue(issues, problemId, `${path}.tokens has duplicate key "${token.key}"`);
      }
      tokenKeys.add(token.key);
      if (typeof token.text !== "string") {
        addIssue(issues, problemId, `${path}.tokens[${index}].text must be a string`);
      }
    });

    if (!Array.isArray(answer?.value)) {
      addIssue(issues, problemId, "answer.value must be an array of word_order token keys");
    } else {
      const answerKeys = new Set();
      answer.value.forEach((key) => {
        if (!tokenKeys.has(key)) {
          addIssue(issues, problemId, `answer.value contains unknown token key "${key}"`);
        }
        if (answerKeys.has(key)) {
          addIssue(issues, problemId, `answer.value contains duplicate token key "${key}"`);
        }
        answerKeys.add(key);
      });
      if (answer.value.length !== response.tokens.length) {
        addIssue(issues, problemId, "answer.value must use every word_order token exactly once");
      }
    }
    return;
  }

  if (response.type === "mode_switch") {
    const modes = response.modes;
    if (!modes || typeof modes !== "object" || Array.isArray(modes)) {
      addIssue(issues, problemId, `${path}.modes must be an object`);
      return;
    }
    if (typeof response.defaultMode !== "string" || !Object.hasOwn(modes, response.defaultMode)) {
      addIssue(issues, problemId, `${path}.defaultMode must name an entry in modes`);
    }

    for (const [modeName, modeResponse] of Object.entries(modes)) {
      if (!modeResponse || typeof modeResponse.type !== "string" || !BASE_RESPONSE_TYPES.has(modeResponse.type)) {
        addIssue(issues, problemId, `${path}.modes.${modeName}.type is unsupported`);
        continue;
      }
      validateResponse(modeResponse, answer?.modes?.[modeName], issues, problemId, `${path}.modes.${modeName}`);
    }

    if (answer?.modes !== undefined) {
      if (!answer.modes || typeof answer.modes !== "object" || Array.isArray(answer.modes)) {
        addIssue(issues, problemId, "answer.modes must be an object when provided");
      } else {
        for (const modeName of Object.keys(answer.modes)) {
          if (!Object.hasOwn(modes, modeName)) {
            addIssue(issues, problemId, `answer.modes contains unknown mode "${modeName}"`);
          }
        }
      }
    }
    return;
  }

  if (!BASE_RESPONSE_TYPES.has(response.type)) {
    addIssue(issues, problemId, `${path}.type "${response.type}" is unsupported`);
  }
}

function validateNode(node, issues, fallbackId) {
  if (!node || typeof node !== "object") {
    addIssue(issues, fallbackId, "problem/item must be an object");
    return;
  }
  const problemId = node.id ?? fallbackId;
  if (node.response) {
    validateResponse(node.response, node.answer, issues, problemId);
  }
  for (const [index, item] of (node.items ?? []).entries()) {
    validateNode(item, issues, `${problemId}/item-${index + 1}`);
  }
}

export function validateDatasetResponses(dataset, datasetId = "dataset") {
  const issues = [];
  for (const [pageIndex, page] of (dataset?.pages ?? []).entries()) {
    for (const [problemIndex, problem] of (page?.problems ?? []).entries()) {
      validateNode(problem, issues, `${datasetId}/page-${pageIndex + 1}/problem-${problemIndex + 1}`);
    }
  }
  return issues;
}
