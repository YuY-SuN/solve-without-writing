#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceFiles = [
  "app/src/data/english/english_lesson3_3_chatgpt.json",
  "app/src/data/english/english_workbook_p32_p69.json",
];
const catalogPath = "app/src/interactions/english.js";
const outputJson = "docs/english-interaction-coverage.json";
const outputMarkdown = "docs/english-interaction-coverage.md";
const failures = [];

function loadCatalog() {
  const source = fs.readFileSync(path.join(root, catalogPath), "utf8");
  const declaredIds = [...source.matchAll(/^\s*(eng_[\w]+):\s*\{/gm)].map((match) => match[1]);
  const seen = new Set();
  for (const id of declaredIds) {
    if (seen.has(id)) failures.push(`catalog duplicate item id: ${id}`);
    seen.add(id);
  }
  const executable = source.replace(
    "export const englishInteractionOverrides =",
    "globalThis.englishInteractionOverrides =",
  );
  const sandbox = {};
  try {
    vm.runInNewContext(executable, sandbox, { filename: catalogPath, timeout: 1000 });
  } catch (error) {
    failures.push(`catalog parse failed: ${error.message}`);
    return {};
  }
  return sandbox.englishInteractionOverrides ?? {};
}

const catalog = loadCatalog();
const items = [];
const itemById = new Map();
const sourceItemById = new Map();

for (const relativeFile of sourceFiles) {
  const dataset = JSON.parse(fs.readFileSync(path.join(root, relativeFile), "utf8"));
  for (const page of dataset.pages ?? []) {
    for (const problem of page.problems ?? []) {
      for (const item of problem.items ?? []) {
        if (!item.id || !item.response || item.response.type === "none") continue;
        if (itemById.has(item.id)) failures.push(`duplicate source item id: ${item.id}`);
        const entry = {
          itemId: item.id,
          page: page.page ?? null,
          section: item.section?.title ?? problem.section?.title ?? "",
          category: item.section?.category ?? problem.section?.category ?? "",
          summary: item.text ?? item.prompt?.text ?? "",
          originalResponseType: item.response.type,
          prompt: item.prompt?.text ?? problem.prompt?.text ?? "",
          context: item.context?.text ?? problem.context?.text ?? "",
          answer: item.answer ?? null,
          explanation: item.explanation ?? "",
          distractorPresent: Boolean(
            item.distractor
            || item.response.distractors
            || item.response.choices?.some((choice) => choice.errorType),
          ),
          hasAlternativeChoices: (item.response.choices?.length ?? 0) > 1,
          dataset: path.basename(relativeFile),
          _item: item,
        };
        items.push(entry);
        itemById.set(item.id, entry);
        sourceItemById.set(item.id, item);
      }
    }
  }
}
const prefixSource = fs.readFileSync(path.join(root, "app/src/interactions/word-order-feedback.js"), "utf8")
  .replace("export function inspectWordOrderPrefix", "globalThis.inspectWordOrderPrefix = function inspectWordOrderPrefix");
const prefixSandbox = {};
vm.runInNewContext(prefixSource, prefixSandbox, { filename: "word-order-feedback.js" });
const correctPrefix = prefixSandbox.inspectWordOrderPrefix(["who", "is"], ["who", "is", "that", "?"]);
const firstMismatch = prefixSandbox.inspectWordOrderPrefix(["who", "that"], ["who", "is", "that", "?"]);
if (!correctPrefix.isCorrectPrefix || correctPrefix.mismatchIndex !== -1) {
  failures.push("word_order prefix smoke check: correct prefix was marked as a mismatch");
}
if (firstMismatch.isCorrectPrefix || firstMismatch.mismatchIndex !== 1 || firstMismatch.matchedPrefixLength !== 1) {
  failures.push("word_order prefix smoke check: first divergent token was not identified");
}

const interactionTypes = new Set(["transform", "repair", "conversation", "role_change", "expand"]);
const keptReasons = {
  vocabulary: "語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。",
  reading_comprehension: "本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。",
  free_composition: "複数の自然な表現があり、固定goalへ操作で誘導しない。",
  fixed_expression: "定型表現・連語の想起が中心で、変形操作を足す利点が小さい。",
  short_form_check: "選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。",
  interaction_adds_no_value: "短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。",
  ambiguous_multiple_answers: "正答が資料から確定できない、または解答の幅があり固定goalを置きにくい。",
  other: "現在のinteractionでは元問題の思考をより直接扱えないため、通常形式を維持。",
};

function classifyKept(entry) {
  const item = entry._item;
  const text = `${entry.section} ${entry.category} ${entry.summary} ${entry.prompt} ${entry.explanation}`;
  if (/本文読解|英文を読む|本文を読|読解|内容を答え|下線部.*指す/.test(text)) {
    return "reading_comprehension";
  }
  if (/単語チェック|語句を確認|必ず覚えたい語句|vocab/i.test(text)) return "vocabulary";
  if (item.answer == null || item.response.type === "free_text") {
    if (/自由|好きな|自分で|2つ以上|できるだけ多く|作文|紹介しよう|作ろう/.test(text)) {
      return "free_composition";
    }
    if (/重要表現|連語|表現を確認/.test(text)) return "fixed_expression";
    if (/本文読解|英文を読む|本文を読|読解/.test(text)) return "reading_comprehension";
    return "ambiguous_multiple_answers";
  }
  if (/重要表現|連語|表現を確認/.test(text)) return "fixed_expression";
  if (item.response.type === "choice") return "short_form_check";
  if (/単語|語句|語形|適する語|語を選/.test(text) && !/主語を|疑問文に|否定文に|過去形に|書きかえ|直そう/.test(text)) {
    return "short_form_check";
  }
  if (/自由|好きな|自分で|2つ以上|できるだけ多く|何文以上/.test(text)) return "free_composition";
  if (/本文読解|英文を読む|本文を読|読解/.test(text)) return "reading_comprehension";
  return "interaction_adds_no_value";
}

function interactionReason(type) {
  return {
    transform: "元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。",
    repair: "教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。",
    conversation: "相手の発話・場面から意図を決め、会話が成立する発話へ進める。",
    role_change: "文中の役割を決めてから、代名詞・所有形の語形を変える。",
    expand: "意味のまとまりを追加し、固定された文型へ段階的に進める。",
    word_order: "元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。",
  }[type];
}

const rows = items.map((entry) => {
  const explicit = catalog[entry.itemId];
  entry.wordOrderFeedback = entry.originalResponseType === "word_order";
  if (explicit) {
    if (!interactionTypes.has(explicit.type) && explicit.type !== "word_order") {
      failures.push(`${entry.itemId}: unsupported interaction type ${explicit.type}`);
    }
    entry.interactionType = explicit.type;
    entry.status = explicit.type === "word_order" ? "enhanced_word_order" : "interactive";
    entry.reasonKey = explicit.type;
    entry.reason = interactionReason(explicit.type);
  } else if (entry.originalResponseType === "word_order") {
    entry.interactionType = "word_order";
    entry.status = "enhanced_word_order";
    entry.reasonKey = "word_order";
    entry.reason = interactionReason("word_order");
  } else {
    entry.interactionType = null;
    entry.status = "kept_original";
    entry.reasonKey = classifyKept(entry);
    entry.reason = keptReasons[entry.reasonKey];
  }
  delete entry._item;
  return entry;
});

for (const id of Object.keys(catalog)) {
  const entry = itemById.get(id);
  const sourceItem = sourceItemById.get(id);
  if (!entry) {
    failures.push(`${id}: catalog references no source item`);
    continue;
  }
  const definition = catalog[id];
  if (definition.type === "word_order") {
    if (sourceItem.response.type !== "word_order") failures.push(`${id}: word_order interaction on non-word_order item`);
    continue;
  }
  if (typeof definition.goalState !== "string" || !definition.goalState.trim()) {
    failures.push(`${id}: goalState is required`);
    continue;
  }
  const normalize = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
  const answerTexts = [];
  const collect = (value) => {
    if (typeof value === "string" && value.trim().length > 1) answerTexts.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") {
      if (typeof value.display === "string") collect(value.display);
      if (typeof value.value === "string") collect(value.value);
      if (value.modes && typeof value.modes === "object") Object.values(value.modes).forEach(collect);
    }
  };
  collect(sourceItem.answer);
  const normalizedGoal = normalize(definition.goalState);
  if (answerTexts.length && !answerTexts.some((text) => normalizedGoal.includes(normalize(text)))) {
    failures.push(`${id}: goalState does not contain any textual answer representation (${answerTexts.join(" / ")})`);
  }

  if (Array.isArray(definition.steps)) {
    const steps = definition.steps;
    const byId = new Map();
    for (const step of steps) {
      if (!step.id || byId.has(step.id)) failures.push(`${id}: missing or duplicate step id ${step.id ?? ""}`);
      byId.set(step.id, step);
    }
    for (const step of steps) for (const option of step.options ?? []) {
      if (option.nextStep && !byId.has(option.nextStep)) failures.push(`${id}: nextStep ${option.nextStep} is missing`);
    }
    const reached = new Set();
    const visit = (stepId, active = new Set()) => {
      if (!stepId || !byId.has(stepId)) return;
      if (active.has(stepId)) {
        failures.push(`${id}: nextStep cycle includes ${stepId}`);
        return;
      }
      if (reached.has(stepId)) return;
      reached.add(stepId);
      const nextActive = new Set(active).add(stepId);
      for (const option of byId.get(stepId).options ?? []) visit(option.nextStep, nextActive);
    };
    visit(steps[0]?.id);
    for (const step of steps) if (!reached.has(step.id)) failures.push(`${id}: unreachable step ${step.id}`);
    const hasTerminal = steps.some((step) => (step.options ?? []).some((option) => option.complete || normalize(option.result ?? "") === normalizedGoal));
    if (!hasTerminal) failures.push(`${id}: no step operation reaches or completes at goalState`);
    for (const step of steps) for (const option of step.options ?? []) {
      if (option.complete && option.result && normalize(option.result) !== normalizedGoal) {
        failures.push(`${id}: complete option ${option.id} result differs from goalState`);
      }
    }
  }

  const repairTargets = definition.repairTargets ?? [];
  for (const target of repairTargets) {
    const token = sourceItem.response.type === "mode_switch"
      ? sourceItem.response.modes?.[sourceItem.response.defaultMode]?.tokens?.[target.tokenIndex]
      : null;
    const initialWords = definition.initialState?.trim().split(/\s+/) ?? [];
    const normalizeToken = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (target.tokenIndex !== undefined && normalizeToken(initialWords[target.tokenIndex]) !== normalizeToken(target.token)) {
      failures.push(`${id}: repair target ${target.id} tokenIndex does not point to ${target.token}`);
    }
    if (target.tokenIndex !== undefined && token && token.text !== target.token) {
      failures.push(`${id}: repair target ${target.id} is not present in source response tokens`);
    }
  }
  if (repairTargets.length) {
    if (typeof definition.initialState !== "string" || !definition.initialState.trim()) {
      failures.push(`${id}: repair initialState is required`);
    } else {
      const canReachGoal = (state, remaining) => {
        if (normalize(state) === normalizedGoal) return true;
        if (!remaining.length) return false;
        return remaining.some((target, index) => {
          const nextStates = (target.operations ?? [])
            .filter((operation) => operation.outcome !== "invalid")
            .map((operation) => {
              if (operation.result) return operation.result;
              if (operation.replacement === undefined) return null;
              const parts = state.split(/(\s+)/);
              let currentIndex = 0;
              const replaceAt = parts.findIndex((part) => {
                if (!part || /^\s+$/.test(part)) return false;
                return currentIndex++ === target.tokenIndex;
              });
              if (replaceAt < 0) return null;
              const punctuation = parts[replaceAt].match(/[.,!?;:]+$/)?.[0] ?? "";
              parts[replaceAt] = `${operation.replacement}${punctuation}`;
              return parts.join("");
            })
            .filter(Boolean);
          return nextStates.some((nextState) => canReachGoal(nextState, remaining.filter((_, otherIndex) => otherIndex !== index)));
        });
      };
      if (!canReachGoal(definition.initialState, repairTargets)) failures.push(`${id}: repair target operations cannot reach goalState`);
    }
  }
  if (definition.type === "repair" && !repairTargets.length && !Array.isArray(definition.steps)) {
    failures.push(`${id}: repair needs repairTargets or steps`);
  }
}

for (const entry of items) {
  const sourceItem = sourceItemById.get(entry.itemId);
  const response = sourceItem.response;
  if (response.type === "word_order") {
    const tokenKeys = new Set((response.tokens ?? []).map((token) => token.key));
    const answerKeys = sourceItem.answer?.value;
    if (!Array.isArray(answerKeys) || answerKeys.some((key) => !tokenKeys.has(key))) {
      failures.push(`${entry.itemId}: word_order answer.value contains a missing token key`);
    }
  }
}

const responseValidationSource = fs.readFileSync(path.join(root, "app/src/response-validation.js"), "utf8")
  .replace("export function validateDatasetResponses", "globalThis.validateDatasetResponses = function validateDatasetResponses");
const responseValidationSandbox = {};
vm.runInNewContext(responseValidationSource, responseValidationSandbox, { filename: "response-validation.js" });
for (const relativeFile of sourceFiles) {
  const dataset = JSON.parse(fs.readFileSync(path.join(root, relativeFile), "utf8"));
  for (const issue of responseValidationSandbox.validateDatasetResponses(dataset, path.basename(relativeFile))) {
    failures.push(`dataset response validation: ${issue}`);
  }
}

const statusCounts = rows.reduce((counts, row) => {
  counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}, {});
const typeCounts = rows.reduce((counts, row) => {
  const label = row.interactionType ?? row.reasonKey;
  counts[label] = (counts[label] ?? 0) + 1;
  return counts;
}, {});
typeCounts.word_order = rows.filter((row) => row.wordOrderFeedback).length;
const report = {
  generatedFrom: sourceFiles,
  totalItems: rows.length,
  statusCounts,
  classificationCounts: typeCounts,
  validation: {
    sourceItemsUnique: itemById.size === items.length,
    explicitDefinitions: Object.keys(catalog).length,
    wordOrderItemsWithFeedback: rows.filter((row) => row.wordOrderFeedback).length,
    wordOrderPrefixSmokeChecks: 2,
    errors: failures,
  },
  items: rows,
};

const markdown = [
  "# 英語interaction coverage",
  "",
  `対象ファイル: ${sourceFiles.map((file) => `\`${path.basename(file)}\``).join("、")}。response.type が none のsection/problem行を除く全 ${rows.length} item を1行ずつ記録。`,
  "",
  "## 集計",
  "",
  `- interaction定義あり: ${rows.filter((row) => row.status === "interactive").length}`,
  `- word_order途中フィードバック: ${rows.filter((row) => row.wordOrderFeedback).length}`,
  `- 従来形式を維持: ${rows.filter((row) => row.status === "kept_original").length}`,
  `- 静的catalog定義数: ${Object.keys(catalog).length}`,
  "",
  "| 分類 | 件数 |",
  "|---|---:|",
  ...Object.entries(typeCounts).sort(([a], [b]) => a.localeCompare(b)).map(([key, count]) => `| ${key} | ${count} |`),
  "",
  "## item別判定",
  "",
  "`answer`・`explanation`・`context`・選択肢/distractor情報を含む全項目は同名JSON reportに保存しています。以下はレビュー用の要約です。",
  "",
  "| itemId | page | section | 元response | 問題要約 | status / interaction | 理由 |",
  "|---|---:|---|---|---|---|---|",
  ...rows.map((row) => {
    const summary = row.summary.replaceAll("|", "\\|").replaceAll("\n", " ").slice(0, 100);
    const reason = row.reason.replaceAll("|", "\\|");
    return `| ${row.itemId} | ${row.page ?? ""} | ${row.section.replaceAll("|", "\\|")} | ${row.originalResponseType} | ${summary} | ${row.status}${row.interactionType ? ` / ${row.interactionType}` : ""} | ${reason} |`;
  }),
  "",
  "`kept_original` は未判定を表さず、各itemに理由キーを付けて通常形式を維持した記録です。`eng_p65_b2_3` は既存transformを維持したまま、word_order回答欄にも途中prefix feedbackを追加したため、interaction type別件数には重複があります。候補抽出と最終分類はこの静的一覧をレビュー対象とし、実行時にJSONからinteractionを自動生成しません。",
  "",
].join("\n");

if (process.argv.includes("--write")) {
  fs.writeFileSync(path.join(root, outputJson), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(root, outputMarkdown), markdown);
}

console.log(JSON.stringify({ totalItems: rows.length, statusCounts, classificationCounts: typeCounts, explicitDefinitions: Object.keys(catalog).length, errors: failures }, null, 2));
if (failures.length) process.exitCode = 1;
