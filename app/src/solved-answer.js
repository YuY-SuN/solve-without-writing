function cloneSerializable(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function toTextInputValue(value, display = undefined) {
  if (typeof display === "string") return display;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value && typeof value === "object" && value.type === "fraction"
    && Number.isFinite(value.numerator) && Number.isFinite(value.denominator)) {
    return `${value.numerator}/${value.denominator}`;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => toTextInputValue(entry)).join("、");
  }
  return value === undefined ? undefined : JSON.stringify(value);
}

function toGraphPointValue(value) {
  if (typeof value === "number") return value;
  if (value && value.type === "fraction" && Number.isFinite(value.numerator) && Number.isFinite(value.denominator)) {
    return value.numerator / value.denominator;
  }
  return value;
}

function createGuidedSolvedValue(response) {
  const steps = response.steps ?? {};
  const findPath = (stepId, path = [], selections = {}, outcomes = {}) => {
    if (stepId === "finish") {
      return { path: [...path, "finish"], selections, outcomes };
    }
    if (!steps[stepId] || path.includes(stepId)) return null;
    const choices = steps[stepId].interaction?.choices ?? [];
    const correctChoices = choices.filter((choice) => choice.correct === true);
    if (!correctChoices.length) return null;
    const correctKeys = correctChoices.map((choice) => choice.key);
    for (const choice of correctChoices) {
      const result = findPath(choice.next, [...path, stepId], {
        ...selections,
        [stepId]: steps[stepId].interaction.type === "multi_select" ? correctKeys : choice.key,
      }, { ...outcomes, [stepId]: "correct" });
      if (result) return result;
    }
    return null;
  };
  const result = findPath(response.start);
  if (!result) return undefined;
  return {
    currentStep: "finish",
    history: result.path,
    selections: result.selections,
    outcomes: result.outcomes,
    orders: {},
    notice: { kind: "success", text: "完了しました。" },
    completed: true,
  };
}

function createSolvedValue(response, answer) {
  if (!response || response.type === "none") {
    return undefined;
  }

  if (response.type === "mode_switch") {
    const modes = response.modes ?? {};
    const preferredMode = Object.hasOwn(modes, response.defaultMode)
      ? response.defaultMode
      : Object.keys(modes)[0];
    const orderedModes = [preferredMode, ...Object.keys(modes).filter((key) => key !== preferredMode)];
    const mode = orderedModes.find((key) => modes[key]?.type === "guided_steps"
      ? createGuidedSolvedValue(modes[key]) !== undefined
      : answer?.modes?.[key]?.value !== undefined);
    if (!mode) {
      return undefined;
    }
    return {
      mode,
      values: {
        [mode]: modes[mode]?.type === "guided_steps"
          ? createGuidedSolvedValue(modes[mode])
          : createSolvedValue(modes[mode], answer?.modes?.[mode]),
      },
    };
  }

  if (response.type === "guided_steps") {
    return createGuidedSolvedValue(response);
  }

  if (answer && Object.hasOwn(answer, "value")) {
    if (response.type === "draw_graph") {
      if (Array.isArray(answer.value)) return answer.value.map(toGraphPointValue);
      if (Array.isArray(answer.value?.points)) return answer.value.points.map(toGraphPointValue);
      return cloneSerializable(answer.value);
    }
    if (response.type === "blank" || response.type === "free_text") {
      return toTextInputValue(answer.value, answer.display);
    }
    if (response.type === "multi_blank" || response.type === "table_fill" || response.type === "ladder_fill") {
      if (answer.value && typeof answer.value === "object" && !Array.isArray(answer.value)) {
        return Object.fromEntries(Object.entries(answer.value).map(([key, value]) => [key, toTextInputValue(value)]));
      }
    }
    return cloneSerializable(answer.value);
  }

  if ((response.type === "blank" || response.type === "free_text") && typeof answer?.display === "string") {
    return answer.display;
  }

  return undefined;
}

/** Return the answer value in the same shape produced by the normal response UI. */
export function createAnswerFromSolution(response, answer) {
  return createSolvedValue(response, answer);
}
