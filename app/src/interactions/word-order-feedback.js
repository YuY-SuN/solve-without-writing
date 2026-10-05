export function inspectWordOrderPrefix(currentKeys, answerKeys) {
  let matchedPrefixLength = 0;
  while (
    matchedPrefixLength < currentKeys.length
    && matchedPrefixLength < answerKeys.length
    && currentKeys[matchedPrefixLength] === answerKeys[matchedPrefixLength]
  ) {
    matchedPrefixLength += 1;
  }

  return {
    matchedPrefixLength,
    isCorrectPrefix: matchedPrefixLength === currentKeys.length,
    mismatchIndex: matchedPrefixLength < currentKeys.length ? matchedPrefixLength : -1,
  };
}
