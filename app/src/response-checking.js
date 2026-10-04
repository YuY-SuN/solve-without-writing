function isSameUnorderedSelection(selected, expected) {
  return Array.isArray(selected)
    && Array.isArray(expected)
    && selected.length === expected.length
    && selected.every((key) => expected.includes(key));
}

export function evaluateResponseCheck(response, answer, value, isResponseComplete) {
  if (!isResponseComplete(response, value, answer)) {
    return "unanswered";
  }

  let activeResponse = response;
  let activeAnswer = answer;
  let activeValue = value;

  if (response?.type === "mode_switch") {
    const mode = value?.mode && Object.hasOwn(response.modes ?? {}, value.mode)
      ? value.mode
      : response.defaultMode;
    activeResponse = response.modes?.[mode];
    activeAnswer = answer?.modes?.[mode];
    activeValue = value?.values?.[mode];
  }

  if (activeResponse?.type === "choice" && activeAnswer?.value !== undefined) {
    if (activeResponse.multiple) {
      return isSameUnorderedSelection(activeValue, activeAnswer.value) ? "correct" : "incorrect";
    }
    return activeValue === activeAnswer.value ? "correct" : "incorrect";
  }

  if (activeResponse?.type === "word_order" && Array.isArray(activeAnswer?.value)) {
    const expected = activeAnswer.value;
    return Array.isArray(activeValue)
      && activeValue.length === expected.length
      && activeValue.every((key, index) => key === expected[index])
      ? "correct"
      : "incorrect";
  }

  return "compare";
}
