function createInitialState(response, orders = {}) {
  return {
    currentStep: response.start,
    history: [response.start],
    selections: {},
    outcomes: {},
    orders,
    notice: null,
    completed: false,
  };
}

function normalizeState(response, value) {
  const steps = response.steps ?? {};
  if (!value || typeof value !== "object" || !steps[value.currentStep] && value.currentStep !== "finish") {
    return createInitialState(response);
  }
  const history = Array.isArray(value.history)
    ? value.history.filter((stepId) => steps[stepId] || stepId === "finish")
    : [];
  const currentStep = steps[value.currentStep] || value.currentStep === "finish"
    ? value.currentStep
    : response.start;
  const validHistory = history.length && history.at(-1) === currentStep
    ? history
    : [...history.filter((stepId) => stepId !== currentStep), currentStep];
  return {
    currentStep,
    history: validHistory.length ? validHistory : [response.start],
    selections: value.selections && typeof value.selections === "object" ? value.selections : {},
    outcomes: value.outcomes && typeof value.outcomes === "object" ? value.outcomes : {},
    orders: value.orders && typeof value.orders === "object" ? value.orders : {},
    notice: value.notice && typeof value.notice === "object" ? value.notice : null,
    completed: currentStep === "finish" && value.completed === true,
  };
}

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function isSameKeySet(left, right) {
  return left.length === right.length && left.every((key) => right.includes(key));
}

export function renderGuidedSteps(response, options = {}) {
  let state = normalizeState(response, options.value);
  const root = document.createElement("section");
  root.className = "guided-steps";
  root.setAttribute("aria-label", "操作式");

  function publish(nextState) {
    state = nextState;
    options.onChange?.(state);
    render();
  }

  function getChoices(stepId, interaction) {
    const choices = interaction.choices ?? [];
    if (interaction.shuffle !== true) return choices;
    const keys = choices.map((choice) => choice.key);
    const storedOrder = state.orders[stepId];
    const isValidOrder = Array.isArray(storedOrder)
      && storedOrder.length === keys.length
      && new Set(storedOrder).size === keys.length
      && storedOrder.every((key) => keys.includes(key));
    if (isValidOrder) {
      const choicesByKey = new Map(choices.map((choice) => [choice.key, choice]));
      return storedOrder.map((key) => choicesByKey.get(key));
    }

    const order = shuffle(keys);
    state = { ...state, orders: { ...state.orders, [stepId]: order } };
    options.onChange?.(state);
    const choicesByKey = new Map(choices.map((choice) => [choice.key, choice]));
    return order.map((key) => choicesByKey.get(key));
  }

  function updateSelection(stepId, choiceKey, multiple) {
    const previous = state.selections[stepId];
    const nextSelection = multiple
      ? (() => {
          const selected = new Set(Array.isArray(previous) ? previous : []);
          selected.has(choiceKey) ? selected.delete(choiceKey) : selected.add(choiceKey);
          return [...selected];
        })()
      : choiceKey;
    const nextState = {
      ...state,
      selections: { ...state.selections, [stepId]: nextSelection },
      outcomes: { ...state.outcomes, [stepId]: null },
      notice: null,
    };
    if (multiple) {
      publish(nextState);
      root.querySelector(`[data-choice-key="${CSS.escape(choiceKey)}"]`)?.focus();
      return;
    }
    submitSelection(stepId, nextSelection, nextState);
  }

  function submitSelection(stepId, selection, baseState = state) {
    const step = response.steps[stepId];
    const choices = step?.interaction?.choices ?? [];
    const selectedKeys = Array.isArray(selection) ? selection : [selection];
    const correctKeys = choices.filter((choice) => choice.correct === true).map((choice) => choice.key);
    const selectedChoice = choices.find((choice) => choice.key === selection);
    const isMultiple = step?.interaction?.type === "multi_select";
    const isCorrect = isMultiple
      ? isSameKeySet(selectedKeys, correctKeys)
      : selectedChoice?.correct === true;
    const nextSelections = { ...baseState.selections, [stepId]: selection };
    const nextOutcomes = { ...baseState.outcomes, [stepId]: isCorrect ? "correct" : "incorrect" };

    if (!isCorrect) {
      const feedback = Array.isArray(selection)
        ? (choices.find((choice) => choice.correct !== true && selectedKeys.includes(choice.key))?.feedback
          ?? "選んだ内容を見直して、もう一度考えてみましょう。")
        : (selectedChoice?.feedback ?? "別の操作を考えてみましょう。");
      publish({
        ...baseState,
        selections: nextSelections,
        outcomes: nextOutcomes,
        notice: { kind: "hint", text: feedback },
      });
      const focusKey = Array.isArray(selection) ? "guided-submit" : selection;
      root.querySelector(`[data-choice-key="${CSS.escape(focusKey)}"], [data-guided-action="${focusKey}"]`)?.focus();
      return;
    }

    const nextStep = Array.isArray(selection)
      ? choices.find((choice) => choice.correct === true)?.next
      : selectedChoice?.next;
    const history = [...baseState.history, nextStep];
    const isFinish = nextStep === "finish";
    publish({
      ...baseState,
      currentStep: nextStep,
      history,
      selections: nextSelections,
      outcomes: nextOutcomes,
      notice: {
        kind: "success",
      text: selectedChoice?.successFeedback ?? "いいですね。次へ進みましょう。",
      },
      completed: isFinish,
    });
    root.querySelector(".guided-current-state")?.focus();
  }

  function render(focusTarget = null) {
    root.replaceChildren();
    const status = document.createElement("p");
    status.className = "guided-progress";
    status.textContent = state.completed
      ? "完了"
      : (response.steps[state.currentStep]?.progress
        ? `${response.steps[state.currentStep].progress.current} / ${response.steps[state.currentStep].progress.total}`
        : `${Math.max(1, state.history.length)}手目`);

    if (state.notice?.text) {
      const notice = document.createElement("p");
      notice.className = "guided-feedback";
      notice.dataset.kind = state.notice.kind === "success" ? "success" : "hint";
      notice.setAttribute("aria-live", "polite");
      notice.textContent = state.notice.kind === "success" ? `✓ ${state.notice.text}` : state.notice.text;
      root.append(status, notice);
    } else {
      root.appendChild(status);
    }

    if (state.currentStep === "finish") {
      const finish = document.createElement("div");
      finish.className = "guided-finish";
      const display = document.createElement("p");
      display.className = "guided-current-state";
      display.tabIndex = -1;
      display.textContent = response.finish?.display ?? "完了しました。";
      finish.appendChild(display);
      if (response.finish?.summary) {
        const summary = document.createElement("p");
        summary.className = "guided-finish-summary";
        summary.textContent = response.finish.summary;
        finish.appendChild(summary);
      }
      if (options.answerContent || options.explanationContent) {
        const details = document.createElement("details");
        details.className = "guided-finish-details";
        const summary = document.createElement("summary");
        summary.textContent = "解説を見る";
        details.appendChild(summary);
        if (options.answerContent) details.appendChild(options.answerContent);
        if (options.explanationContent) details.appendChild(options.explanationContent);
        finish.appendChild(details);
      }
      root.appendChild(finish);
    } else {
      const step = response.steps[state.currentStep];
      if (!step) {
        const issue = document.createElement("p");
        issue.className = "guided-feedback";
        issue.dataset.kind = "hint";
        issue.textContent = "この操作式の状態を読み込めませんでした。最初からやり直してください。";
        root.appendChild(issue);
      } else {
        const display = document.createElement("p");
        display.className = "guided-current-state";
        display.tabIndex = -1;
        display.textContent = step.display ?? "";
        const prompt = document.createElement("p");
        prompt.className = "guided-step-prompt";
        prompt.textContent = step.prompt ?? "次にどうするか考えましょう。";
        root.append(display, prompt);

        const interaction = step.interaction;
        if (interaction?.type === "choice") {
          const choices = document.createElement("div");
          choices.className = "guided-choice-list";
          choices.setAttribute("role", "group");
          choices.setAttribute("aria-label", step.prompt ?? "選択肢");
          for (const choice of getChoices(state.currentStep, interaction)) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "guided-choice";
            button.textContent = choice.text;
            button.dataset.choiceKey = choice.key;
            button.setAttribute("aria-pressed", String(state.selections[state.currentStep] === choice.key));
            button.addEventListener("click", () => updateSelection(state.currentStep, choice.key, false));
            choices.appendChild(button);
          }
          root.appendChild(choices);
        } else if (interaction?.type === "multi_select") {
          const choices = document.createElement("div");
          choices.className = "guided-choice-list";
          choices.setAttribute("role", "group");
          choices.setAttribute("aria-label", step.prompt ?? "複数選択肢");
          for (const choice of getChoices(state.currentStep, interaction)) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "guided-choice guided-choice-multiple";
            button.textContent = choice.text;
            button.dataset.choiceKey = choice.key;
            button.setAttribute("aria-pressed", String((state.selections[state.currentStep] ?? []).includes(choice.key)));
            button.addEventListener("click", () => updateSelection(state.currentStep, choice.key, true));
            choices.appendChild(button);
          }
          const submit = document.createElement("button");
          submit.type = "button";
          submit.className = "guided-submit";
          submit.dataset.guidedAction = "guided-submit";
          submit.textContent = "選んだ項を確認";
          submit.disabled = !(state.selections[state.currentStep]?.length > 0);
          submit.addEventListener("click", () => submitSelection(state.currentStep, state.selections[state.currentStep] ?? []));
          root.append(choices, submit);
        }
      }
    }

    const footer = document.createElement("footer");
    footer.className = "guided-footer";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "guided-back";
    back.textContent = "← ひとつ戻る";
    back.disabled = state.history.length <= 1;
    back.addEventListener("click", () => {
      if (state.history.length <= 1) return;
      const history = state.history.slice(0, -1);
      const currentStep = history.at(-1);
      publish({ ...state, currentStep, history, completed: currentStep === "finish", notice: null });
      root.querySelector(".guided-current-state")?.focus();
    });
    const restart = document.createElement("button");
    restart.type = "button";
    restart.className = "guided-restart";
    restart.textContent = "最初から";
    restart.addEventListener("click", () => {
      publish(createInitialState(response, state.orders));
      root.querySelector(".guided-current-state")?.focus();
    });
    footer.append(back, restart);
    root.appendChild(footer);

    if (focusTarget) {
      const target = root.querySelector(`[data-choice-key="${CSS.escape(focusTarget)}"]`)
        ?? root.querySelector(`[data-guided-action="${focusTarget}"]`);
      target?.focus();
    }
  }

  render();
  return root;
}
