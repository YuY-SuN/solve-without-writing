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

function createSolvedValue(response, answer) {
  if (!response || response.type === "none") {
    return undefined;
  }

  if (response.type === "mode_switch") {
    const modes = response.modes ?? {};
    const preferredMode = Object.hasOwn(modes, response.defaultMode)
      ? response.defaultMode
      : Object.keys(modes)[0];
    const mode = [preferredMode, ...Object.keys(modes).filter((key) => key !== preferredMode)]
      .find((key) => answer?.modes?.[key]?.value !== undefined);
    if (!mode) {
      return undefined;
    }
    return {
      mode,
      values: { [mode]: createSolvedValue(modes[mode], answer.modes[mode]) },
    };
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
