# benkyo-tool-prompt01 Dataset Selector and Index Sync

## Summary

単一アプリ構成の `app/` に、`data/` 配下の複数問題セットを切り替えて表示する機能を追加した。

あわせて、`src/data/index.json` を手作業で保守しなくてよいように、`data/` 配下のJSONを走査して `index.json` を再生成する独立ツール `sync_index.py` を追加した。

## Goal

従来は `src/data/problems.json` 固定で1つの問題セットしか読めなかった。
この状態だと、問題セットを追加するたびにアプリ本体と `index.json` の両方を手で更新する必要がある。

今回の変更の目的は次の2点。

1. UI上で問題セットを選択できること
2. `data/` 配下のJSON追加を `index.json` 再生成ツールで追従できること

## Design

### 1. Dataset manifest

静的Webではブラウザからディレクトリ一覧を安定して列挙できないため、読み込み対象は `src/data/index.json` に集約する。

`index.json` の役割:
- デフォルト問題セットの指定
- UIに表示するラベルの定義
- 実ファイル名のマッピング

形式:

```json
{
  "defaultDatasetId": "core-math",
  "datasets": [
    {
      "id": "core-math",
      "label": "標準セット",
      "path": "problems.json"
    }
  ]
}
```

### 2. UI behavior

画面上部ツールバーに「問題セット」コンボボックスを置き、あわせて全 dataset を横断する「ページ」コンボボックスを置く。

処理の流れ:
1. `main.js` が `src/data/index.json` を読む
2. `datasets` 配列でコンボボックスを構築する
3. 起動時に `datasets` 配列の全JSONを読み込む
4. 全 dataset のページ一覧から横断ページコンボボックスを構築する
5. 問題セット選択時はその dataset 全体を表示し、ページ選択時は対応する dataset と page に直接切り替える
6. 最後に開いていた dataset / page の組を `localStorage` に保存し、次回起動時は有効な範囲で復元する
7. 問題カードを再描画する

### 3. Index sync tool

`src/data/sync_index.py` は `data/` 配下の `.json` を走査し、`index.json` を再生成する。

設計方針:
- `index.json` 自身は走査対象から除外する
- 既存 `index.json` にある `label` は、同じ `path` が残っていれば保持する
- 既存 `defaultDatasetId` も、有効な `id` が残っていれば保持する
- 新規JSONはファイル名から `id` を生成する
- `meta.title` があれば新規ラベル候補に使う

## Implementation

### Added or updated files

- `AGENTS.md`
- `docs/benkyo-tool-prompt01-dataset-selector.md`
- `app/index.html`
- `app/src/main.js`
- `app/src/styles/page.css`
- `app/src/data/index.json`
- `app/src/data/geometry-focus.json`
- `app/src/data/sync_index.py`
- `README.md`

### Main.js responsibilities

`main.js` は次を担当する。

- データセット一覧の読み込み
- 問題セット選択コンボボックスの構築
- 全問題セットJSONの先読み
- 横断ページフィルタの構築
- ページ選択時の dataset 自動切り替え
- 最後に開いていた dataset / page 選択の永続化と復元
- 解答欄の入力UIと選択肢の操作UI
- 問題単位の答え・解説トグルと、全体トグルとの同期
- `localStorage` 記憶データの JSON export / import
- 問題単位・表示中単位の回答クリアと10件のUndo/Redo履歴
- 既存の答え表示・解説表示・問題描画の再利用

### sync_index.py responsibilities

`sync_index.py` は次を担当する。

- `data/` 配下の `*.json` 走査
- `index.json` の再生成
- `path` 単位での既存 `label` 維持
- `defaultDatasetId` の維持または自動補正

## Operation

### Add a new dataset

1. `app/src/data/` に新しい問題JSONを置く
2. 次を実行する

```bash
cd app/src/data
python3 sync_index.py
```

3. 必要なら `index.json` 上で `label` や `defaultDatasetId` を調整する
4. 静的サーバー上で問題セットコンボボックスと横断ページコンボボックスの両方に反映されたことを確認する
5. 必要なら一度ページを選んで再読み込みし、同じページ選択が復元されることを確認する

### Notes

- `sync_index.py` は `data/` 配下のすべてのJSONを候補として扱うため、問題セットではないJSONを置く場合は配置ルールを別途決める必要がある。
- 現状は `meta.title` を表示名候補にしているため、問題JSONには `meta.title` を入れておく方がよい。

## Future maintenance rule

今後もこのリポジトリでは、機能追加ごとに `docs/` 配下の該当Markdownを同じ変更セットで更新する。
特に、データ形式・UI操作・運用ツールを増やしたときは、利用方法と保守方法の両方を記録する。


## Context rendering fix

`problems003.json` で使い始めた `context.text` が、従来の `renderPrompt()` では描画されていなかった。

対応内容:

- `response.type: "choice"` を描画し、会話文問題や選択問題が画面上で成立するようにした
- `response.type: "none"` では不要な「解答欄」を出さないようにした
- `response.type: "draw_graph"` には数直線やグラフ上で直接入力できるUIを追加した
- `response.type: "draw_point"` には点ラベルを直接配置できるUIを追加した
- `item.context.text` も描画できるようにして、今後のデータ拡張に備えた
- `renderPrompt()` を `problem-prompt-block` 化し、`prompt.text` の下に `context.text` を表示
- `context` は補足文・会話文・与えられた数列を載せる用途として、枠付きのテキストブロックで描画
- `context` 未設定の既存問題は従来どおり `prompt` のみを表示

更新ファイル:
- `app/src/renderers/TextRenderer.js`
- `app/src/styles/page.css`


## Interactive response inputs

解答欄は表示専用ではなく、次のように操作できるようにした。

- `blank` は単一テキスト入力
- `multi_blank` は項目ごとの短いテキスト入力
- `free_text` は 1 行なら単一入力、複数行なら textarea
- `choice` は `multiple` に応じて checkbox または radio
- `draw_graph` は数直線やグラフ上の直接操作で入力する
- `draw_point` は点ラベルの配置で入力する
- 入力値は再描画時も消えないように `main.js` 側の状態で保持する
- 入力イベントのたびに `localStorage` を更新し、再読み込み後も復元する


## Response persistence experiment

この試作用ブランチでは、回答入力を `localStorage` に保存する。

- 保存タイミングは各入力イベント発生時
- 保存対象は `main.js` の `responseValues`
- 起動時に `localStorage` から復元して初期表示へ反映する
- 保存キーは `benkyo-tool-prompt01:response-values:v1`

## Page view persistence

最後に見ていたページ選択も `localStorage` に保存する。

- 保存タイミングは dataset または page の選択が変わったとき
- 保存対象は `main.js` の `selectedDatasetId` と `selectedPageKey`
- 起動時は保存済み `pageKey` が `pageCatalog` に存在すればそのページを開く
- 保存済み `pageKey` が無効でも `datasetId` が有効なら、その dataset の `all` 表示へ戻す
- dataset も無効なら `index.json` の `defaultDatasetId` か先頭 dataset を使う
- 保存キーは `benkyo-tool-prompt01:view-selection:v1`


## Clear and undo

回答の操作として、次を追加した。

- 各問題カードの `この問題をクリア` で、その問題に属する入力だけ消す
- 上部の `表示中をクリア` で、現在表示している問題群の入力をまとめて消す
- `ひとつもどる` / `ひとつすすむ` で、入力・削除・クリアの履歴を前後できる
- 履歴は回答状態全体のスナップショットとして最大 10 件保持する
- Undo/Redo 履歴も `localStorage` と整合するように更新する


## Interactive table response inputs

`table_fill` は、表の空欄セルへ直接入力できるようにしている。

要点:
- `TableRenderer.js` が `visual.rows` 内の `blank.key` を見て入力セルを出す
- `response.targets` がある場合は、対象セルを明示的に制限する
- 入力値は `main.js` の `responseValues` と `localStorage` に保存される
- 完了判定では `response.targets` に列挙された全 key が埋まっている必要がある

更新ファイル:
- `app/src/renderers/TableRenderer.js`
- `app/src/renderers/VisualRenderer.js`
- `app/src/renderers/ProblemRenderer.js`
- `app/src/renderers/TextRenderer.js`

## Completion progress

問題ごとの手動完了フラグと、ページごとの進捗表示を追加した。

要点:
- 完了は手動で付ける
- `完了` チェックは各問題カード下部の操作ラインに置き、`この問題の答えを表示` `この問題の解説を表示` と並べて操作できるようにする
- ただし、必要な `response` がすべて入力済みのときだけ完了を付けられる
- `response` が 0 件の問題は最初から完了可能とみなす
- 答えと解説は問題ごとに表示でき、ページ上部の全体トグルを押したときは問題ごとの表示状態も同じ値にそろえる
- 完了状態は `benkyo-tool-prompt01:completed-problems:v1` に保存する
- ページごとに `完了 x/y` と `残り z問` を表示する

関連doc:
- `docs/benkyo-tool-prompt01-completion-progress-plan.md`

更新ファイル:
- `app/index.html`
- `app/src/main.js`
- `app/src/renderers/ProblemRenderer.js`
- `app/src/styles/page.css`


## Storage export and import

`localStorage` に溜まる学習状態を、ファイル経由で持ち出し・復元できるようにした。

対象:
- `responseValues`
- `completedProblems`
- `history.undoStack` / `history.redoStack`
- `viewSelection`

設計方針:
- 形式は JSON とする
- ルートに `schema` `version` `exportedAt` を持たせ、将来の拡張や互換判定をしやすくする
- import 時は型をざっくり検証し、壊れた値は空データへフォールバックする
- 保存済みページが現行 dataset に存在しなければ、既存のフォールバック規則に従って dataset 全体表示へ戻す

運用:
1. 画面上部の `記憶を書き出す` で JSON ファイルを保存する
2. 別ブラウザや別端末では `記憶を読み込む` からその JSON を選ぶ
3. 読み込み後は、回答・完了・履歴・最後に見ていたページが復元される
4. 読み込み対象はこのツールが出力した JSON だけを想定する


## Factorization ladder support

`724772cb0bfb4c37cb990841f4e7c26c1c3e873c` で定義された `factorization_ladder` / `ladder_fill` を、アプリ側でも表示・入力できるようにした。

要点:
- `visual.type: "factorization_ladder"` を専用レイアウトで再描画する
- `response.type: "ladder_fill"` の `targets` を使って、階段図内の空欄 key と入力欄を結び付ける
- `items` の再帰ネストを描画できるようにし、`math_workbook_pages_30_31.json` の `p030_q02` のような入れ子小問をそのまま扱えるようにする
- 再帰 `items` に対して、答え表示、解説表示、完了判定、回答クリアも同じ規則で動くようにする

更新ファイル:
- `app/src/renderers/FactorizationLadderRenderer.js`
- `app/src/renderers/VisualRenderer.js`
- `app/src/renderers/TextRenderer.js`
- `app/src/renderers/ProblemRenderer.js`
- `app/src/main.js`
- `app/src/styles/page.css`
