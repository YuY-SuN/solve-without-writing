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
  "guided_steps",
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

function validateGuidedSteps(response, issues, problemId, path) {
  const steps = response.steps;
  if (!steps || typeof steps !== "object" || Array.isArray(steps) || Object.keys(steps).length === 0) {
    addIssue(issues, problemId, `${path}.steps must be a non-empty object`);
    return;
  }
  if (!response.finish || typeof response.finish !== "object" || Array.isArray(response.finish)) {
    addIssue(issues, problemId, `${path}.finish must be an object`);
  } else {
    if (typeof response.finish.display !== "string") {
      addIssue(issues, problemId, `${path}.finish.display must be a string`);
    }
    if (response.finish.summary !== undefined && typeof response.finish.summary !== "string") {
      addIssue(issues, problemId, `${path}.finish.summary must be a string`);
    }
  }
  if (typeof response.start !== "string" || !Object.hasOwn(steps, response.start)) {
    addIssue(issues, problemId, `${path}.start must name a step`);
  }

  const targets = new Map();
  for (const [stepId, step] of Object.entries(steps)) {
    const stepPath = `${path}.steps.${stepId}`;
    if (!step || typeof step !== "object" || Array.isArray(step)) {
      addIssue(issues, problemId, `${stepPath} must be an object`);
      continue;
    }
    if (typeof step.display !== "string") {
      addIssue(issues, problemId, `${stepPath}.display must be a string`);
    }
    if (typeof step.prompt !== "string") {
      addIssue(issues, problemId, `${stepPath}.prompt must be a string`);
    }
    if (step.progress !== undefined && (!step.progress
      || !Number.isInteger(step.progress.current)
      || !Number.isInteger(step.progress.total)
      || step.progress.current < 1
      || step.progress.total < step.progress.current)) {
      addIssue(issues, problemId, `${stepPath}.progress must have integer current/total with 1 <= current <= total`);
    }
    const interaction = step.interaction;
    if (!interaction || !["choice", "multi_select"].includes(interaction.type)) {
      addIssue(issues, problemId, `${stepPath}.interaction.type must be choice or multi_select`);
      continue;
    }
    if (interaction.shuffle !== undefined && typeof interaction.shuffle !== "boolean") {
      addIssue(issues, problemId, `${stepPath}.interaction.shuffle must be a boolean`);
    }
    if (!Array.isArray(interaction.choices) || interaction.choices.length === 0) {
      addIssue(issues, problemId, `${stepPath}.interaction.choices must be a non-empty array`);
      continue;
    }
    const keys = new Set();
    let correctCount = 0;
    const stepTargets = [];
    for (const [index, choice] of interaction.choices.entries()) {
      const choicePath = `${stepPath}.interaction.choices[${index}]`;
      if (!choice || typeof choice !== "object") {
        addIssue(issues, problemId, `${choicePath} must be an object`);
        continue;
      }
      if (typeof choice.key !== "string" || !choice.key) {
        addIssue(issues, problemId, `${choicePath}.key must be a non-empty string`);
      } else if (keys.has(choice.key)) {
        addIssue(issues, problemId, `${stepPath}.interaction.choices has duplicate key "${choice.key}"`);
      } else {
        keys.add(choice.key);
      }
      if (typeof choice.text !== "string") {
        addIssue(issues, problemId, `${choicePath}.text must be a string`);
      }
      if (typeof choice.correct !== "boolean") {
        addIssue(issues, problemId, `${choicePath}.correct must be a boolean`);
      }
      if (choice.feedback !== undefined && typeof choice.feedback !== "string") {
        addIssue(issues, problemId, `${choicePath}.feedback must be a string`);
      }
      if (choice.correct === true) {
        correctCount += 1;
        if (typeof choice.next !== "string" || !choice.next) {
          addIssue(issues, problemId, `${choicePath}.next is required for a correct choice`);
        }
        if (typeof choice.next === "string") stepTargets.push(choice.next);
      } else if (choice.next !== undefined) {
        if (typeof choice.next !== "string" || !choice.next) {
          addIssue(issues, problemId, `${choicePath}.next must be a non-empty string`);
        } else {
          stepTargets.push(choice.next);
        }
      }
    }
    if (correctCount === 0) {
      addIssue(issues, problemId, `${stepPath} must have at least one correct choice`);
    }
    if (interaction.type === "multi_select") {
      const correctTargets = new Set(interaction.choices
        .filter((choice) => choice.correct === true)
        .map((choice) => choice.next));
      if (correctTargets.size > 1) {
        addIssue(issues, problemId, `${stepPath}.interaction multi_select correct choices must share one next target`);
      }
    }
    targets.set(stepId, stepTargets);
  }

  for (const [stepId, stepTargets] of targets) {
    for (const target of stepTargets) {
      if (target !== "finish" && !Object.hasOwn(steps, target)) {
        addIssue(issues, problemId, `${path}.steps.${stepId} references unknown next step "${target}"`);
      } else if (target === "finish" && (!response.finish || typeof response.finish !== "object")) {
        addIssue(issues, problemId, `${path}.steps.${stepId} points to finish but ${path}.finish is missing`);
      }
    }
  }

  if (typeof response.start === "string" && Object.hasOwn(steps, response.start)) {
    const visited = new Set();
    const queue = [response.start];
    let reachesFinish = false;
    while (queue.length) {
      const stepId = queue.shift();
      if (visited.has(stepId)) continue;
      visited.add(stepId);
      for (const choice of steps[stepId]?.interaction?.choices ?? []) {
        if (choice.correct !== true) continue;
        if (choice.next === "finish") reachesFinish = true;
        else if (typeof choice.next === "string" && Object.hasOwn(steps, choice.next)) queue.push(choice.next);
      }
    }
    if (!reachesFinish) addIssue(issues, problemId, `${path} has no correct-choice route from start to finish`);
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

  if (response.type === "guided_steps") {
    validateGuidedSteps(response, issues, problemId, path);
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

function collectResponseNodes(node, visit, fallbackId) {
  if (!node || typeof node !== "object") return;
  const problemId = node.id ?? fallbackId;
  if (node.response) visit(node.response, problemId, "response");
  for (const [modeName, response] of Object.entries(node.response?.modes ?? {})) {
    visit(response, problemId, `response.modes.${modeName}`);
  }
  for (const [index, item] of (node.items ?? []).entries()) {
    collectResponseNodes(item, visit, `${problemId}/item-${index + 1}`);
  }
}

function collectGuidedWarnings(response, problemId, path) {
  if (response?.type !== "guided_steps" || !response.steps || typeof response.steps !== "object") return [];
  const warnings = [];
  const steps = response.steps;
  const reachable = new Set();
  const queue = typeof response.start === "string" ? [response.start] : [];
  while (queue.length) {
    const stepId = queue.shift();
    if (reachable.has(stepId) || !Object.hasOwn(steps, stepId)) continue;
    reachable.add(stepId);
    for (const choice of steps[stepId]?.interaction?.choices ?? []) {
      if (choice.correct !== true || typeof choice.next !== "string" || choice.next === "finish") continue;
      queue.push(choice.next);
    }
  }
  const unreachable = Object.keys(steps).filter((stepId) => !reachable.has(stepId));
  if (unreachable.length) {
    warnings.push(`${problemId}: ${path} has unreachable steps: ${unreachable.join(", ")}`);
  }

  const visiting = new Set();
  const visited = new Set();
  let hasCycle = false;
  const inspect = (stepId) => {
    if (visiting.has(stepId)) {
      hasCycle = true;
      return;
    }
    if (visited.has(stepId) || !Object.hasOwn(steps, stepId)) return;
    visiting.add(stepId);
    for (const choice of steps[stepId]?.interaction?.choices ?? []) {
      if (choice.correct !== true || typeof choice.next !== "string" || choice.next === "finish") continue;
      inspect(choice.next);
    }
    visiting.delete(stepId);
    visited.add(stepId);
  };
  inspect(response.start);
  if (hasCycle) warnings.push(`${problemId}: ${path} has a cycle in its correct-choice graph; check that learners can still reach finish.`);
  return warnings;
}

export function validateDatasetResponseWarnings(dataset, datasetId = "dataset") {
  const warnings = [];
  for (const [pageIndex, page] of (dataset?.pages ?? []).entries()) {
    for (const [problemIndex, problem] of (page?.problems ?? []).entries()) {
      collectResponseNodes(problem, (response, problemId, path) => {
        warnings.push(...collectGuidedWarnings(response, problemId, path));
      }, `${datasetId}/page-${pageIndex + 1}/problem-${problemIndex + 1}`);
    }
  }
  return warnings;
}
