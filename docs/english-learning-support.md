# 英語教材対応

## 何を解決する機能か

数学教材用の静的ビューアを、既存の数学問題を保ったまま英語など複数教科の教材も表示・回答できる共通ビューアへ拡張する。教科別の問題rendererは設けず、問題の共通構造と `response.type` によって回答UIを選ぶ。

英語データの問題文、正答、選択肢、誤答理由、語順token、解説は教材JSON側で完成させる。アプリは誤答を生成しない。自動採点、正誤判定、点数、部分点、英文同値判定も行わない。利用者は回答を保存し、答え・解説を確認した後に完了を付ける。

## 設計

- 教科分類はJSON本文ではなく、JSONを置くフォルダ名で決める。英語教材は `app/src/data/english/`、数学教材は `app/src/data/math/` に配置する。
- 問題と小問の `prompt`, `context`, `items`, `visuals`, `work`, `response`, `answer`, `explanation` 構造を維持する。
- `choice`, `blank`, `free_text`, `multi_blank` など教科共通の回答形式は共通rendererで描画する。
- 英語教材では `choice` に選択肢シャッフルとkey表示設定を加え、`mode_switch` と `word_order` を追加する。
- 既存数学用visualとwork機能はそのまま維持する。英語教材は必要に応じて共通回答形式を使い、数学向け機能は使わない。
- 回答の完了条件は入力がそろったかだけで判断し、正答との比較はしない。

## データ仕様

### 教科と配置フォルダ

問題JSON内部に教科分類用フィールドは不要で、`meta.subject` があっても分類には使用しない。index生成時に問題JSONの親ディレクトリ名を `datasets[].subject` として登録する。たとえば `app/src/data/english/lesson3.json` はsubject `english` になる。subject IDは選択UIに表示し、`math` は「数学」、`english` は「英語」と表示する。問題rendererの選択には使わず、共通response UIを使う。

### choice

```json
{
  "type": "choice",
  "multiple": false,
  "shuffle": true,
  "showKeys": false,
  "choices": [
    {"key": "a", "text": "正答"},
    {"key": "b", "text": "誤答", "errorType": "word_order", "explanation": "語順の誤りです。"}
  ]
}
```

| フィールド | 型 | 必須性 | 既定値・制約 |
|---|---|---|---|
| `type` | string | 必須 | `choice` |
| `choices` | array | 必須 | 各要素に一意な空でない文字列 `key` が必要。配列順はshuffle無効時の表示順 |
| `choices[].key` | string | 必須 | 回答値として保存。正答照合のキーにも使えるが、アプリは採点しない |
| `choices[].text` | string | 表示には必要 | 学習者に見せる選択肢 |
| `choices[].errorType` | string | 任意 | 誤答分類用の自由な文字列。現UIでは未使用 |
| `choices[].explanation` | string | 任意 | 選択肢に付ける誤答理由。現UIでは未使用 |
| `multiple` | boolean | 任意 | `true` は複数選択、未指定・`false` は単一選択 |
| `shuffle` | boolean | 任意 | `true` は選択肢を一度シャッフル。未指定・`false` はJSON順 |
| `showKeys` | boolean | 任意 | `false` はkeyを非表示。未指定・`true` は従来どおりkeyを表示 |

選択肢の順序は画面に最初に表示した時点で決まり、同じdataset内の再描画・回答操作・答え表示では維持される。ページを再読み込みすると新しい順序になる場合がある。回答保存値は単一選択ならchoice key文字列、複数選択ならkey文字列の配列。

### mode_switch

```json
{
  "type": "mode_switch",
  "defaultMode": "choice",
  "modes": {
    "choice": {
      "type": "choice",
      "shuffle": true,
      "showKeys": false,
      "choices": [{"key": "a", "text": "He is my friend."}]
    },
    "input": {"type": "blank"}
  }
}
```

| フィールド | 型 | 必須性 | 既定値・制約 |
|---|---|---|---|
| `type` | string | 必須 | `mode_switch` |
| `defaultMode` | string | 必須 | `modes` 内のキーであること |
| `modes` | object | 必須 | 各値は既知のresponse形式。`mode_switch` の入れ子は不可 |

回答値は現在のmodeと各mode別の入力を保存する。切り替え前の値も残す。

```json
{
  "mode": "choice",
  "values": {
    "choice": "a",
    "input": "He is my friend."
  }
}
```

完了判定は `mode` が示す現在のresponse形式へ委譲する。choiceなら1つ選択、blankなら非空入力、multi_blankなら全欄入力が必要。選択式と記入式の値を自動で比較しない。

`answer` は既存フィールドを維持し、mode別の正答を `answer.modes` に置ける。入力modeの `accepted` は将来用データとして保存できるが、採点には使わない。

```json
{
  "answer": {
    "display": "He is my friend.",
    "modes": {
      "choice": {"value": "a"},
      "input": {"value": "He is my friend.", "accepted": ["He is my friend."]}
    }
  }
}
```

### word_order

```json
{
  "type": "word_order",
  "shuffle": true,
  "tokens": [
    {"key": "t1", "text": "I"},
    {"key": "t2", "text": "like"},
    {"key": "t3", "text": "."}
  ]
}
```

| フィールド | 型 | 必須性 | 既定値・制約 |
|---|---|---|---|
| `type` | string | 必須 | `word_order` |
| `tokens` | array | 必須 | 配列順はshuffle無効時の表示順 |
| `tokens[].key` | string | 必須 | tokenごとに一意な空でない文字列。重複語句もkeyで区別 |
| `tokens[].text` | string | 必須 | 画面に表示する語句または句読点 |
| `shuffle` | boolean | 任意 | `true` は表示順を一度シャッフル。既定はJSON順 |
| `answer.value` | string[] | 必須 | 正しい順序で並べたtoken key。各keyはtokensに存在し、重複しない |
| `answer.display` | string | 推奨 | 完成英文。答え表示と転記で優先利用 |

学習者は候補tokenをクリックして回答欄へ移し、回答欄のtokenをクリックして戻せる。「最後の1語を戻す」操作もある。保存値は全文文字列ではなく選択順のkey配列。句読点前の空白を除去して転記する。全tokenを選び終えると入力済みになるが、順序が正しいかは判定しない。

### answer.display / answer.accepted

`answer.display` が文字列なら答えとしてその文字列を表示する。配列なら「、」でつないで表示する。これらがない場合は既存互換のためanswer全体をJSON表示する。転記の解答欄も `display` を優先する。

`answer.accepted` は値を持たせられるが、アプリは利用しない。`answer.value`、`answer.modes`、`answer.accepted` は答え表示や将来の拡張用データであり、現時点では正誤判定に使わない。

### 読み込み時の検証

`app/src/response-validation.js` が新しい形式を含むresponse構造を確認する。choiceでは `choices` が配列であること、keyが存在し重複しないこと、textが文字列であること、`multiple` / `shuffle` / `showKeys` がbooleanであることを確認する。word_orderではtokens、token keyの一意性、text、`answer.value` の型・参照先key・全tokenを一度ずつ使うことを確認する。mode_switchではdefaultMode、modes、対応するresponse type、`answer.modes` のキーを確認する。

検証エラーがあるdatasetは読み込みをスキップし、エラーとdataset名を画面の状態欄に表示する。他の正常なdatasetは引き続き利用できる。未知の choice フィールドである `errorType` と `explanation` は拒否しない。

## 回答値と転記

| response | localStorageのresponse値 | 完了条件 | 転記の入力内容 |
|---|---|---|---|
| `choice` | `"a"` または複数時の `["a","c"]` | 1つ以上選択 | keyではなく選択肢のtext |
| `blank` | 文字列 | 空白以外の文字がある | 入力文字列 |
| `free_text` | 文字列 | 空白以外の文字がある | 入力文字列 |
| `mode_switch` | `{"mode":"choice","values":{"choice":"a","input":"..."}}` | 現在選択中modeの条件 | 現在modeの回答。choiceはtextに変換 |
| `word_order` | `["t4","t3",...]` | 選択token数が全token数に達する | token textを順につないだ英文 |

既存のlocalStorage保存key、Undo/Redo、問題単位クリア、表示中クリアは継続利用する。新response形式でも、回答の更新は既存の状態保存を通る。`mode_switch` 内の `multi_blank` に欄を追加した場合は、既存のmode別回答を残し、不足欄を対応する `answer.modes[mode].value` から補う。

## 完成JSON例

以下は5種類の問題を1つの読み込み可能なdatasetにまとめた例。ファイルを `app/src/data/english/` に置き、`cd app/src/data && python3 sync_index.py` でindexを更新して利用する。

```json
{
  "meta": {
    "title": "English response examples",
    "source": "英語教材",
    "version": "1"
  },
  "pages": [
    {
      "page": 1,
      "problems": [
        {
          "id": "eng_example_two_choice",
          "section": {"no": 1, "title": "2択", "category": "選択"},
          "prompt": {"text": "She is my friend. I like ( her / him )."},
          "response": {
            "type": "choice",
            "shuffle": true,
            "showKeys": false,
            "choices": [
              {"key": "a", "text": "her"},
              {"key": "b", "text": "him", "errorType": "pronoun_gender", "explanation": "Sheを受ける目的格はherです。"}
            ]
          },
          "answer": {"value": "a", "display": "her"},
          "explanation": "「彼女を」は her で表します。"
        },
        {
          "id": "eng_example_four_choice",
          "section": {"no": 2, "title": "4択", "category": "選択"},
          "prompt": {"text": "正しい英文を選びなさい。"},
          "response": {
            "type": "choice",
            "shuffle": true,
            "showKeys": false,
            "choices": [
              {"key": "a", "text": "Him is my friend.", "errorType": "pronoun_case", "explanation": "主語には主格heを使います。"},
              {"key": "b", "text": "He is my friend."},
              {"key": "c", "text": "He are my friend.", "errorType": "be_verb", "explanation": "Heにはisを使います。"},
              {"key": "d", "text": "He is me friend.", "errorType": "possessive", "explanation": "「私の」はmyです。"}
            ]
          },
          "answer": {"value": "b", "display": "He is my friend."}
        },
        {
          "id": "eng_example_mode_switch",
          "section": {"no": 3, "title": "選択式／記入式", "category": "練習"},
          "prompt": {"text": "彼は私の友達です。"},
          "response": {
            "type": "mode_switch",
            "defaultMode": "choice",
            "modes": {
              "choice": {
                "type": "choice",
                "shuffle": true,
                "showKeys": false,
                "choices": [
                  {"key": "a", "text": "He is my friend."},
                  {"key": "b", "text": "Him is my friend."},
                  {"key": "c", "text": "He are my friend."},
                  {"key": "d", "text": "He is me friend."}
                ]
              },
              "input": {"type": "blank"}
            }
          },
          "answer": {
            "display": "He is my friend.",
            "modes": {
              "choice": {"value": "a"},
              "input": {"value": "He is my friend.", "accepted": ["He is my friend."]}
            }
          }
        },
        {
          "id": "eng_example_word_order",
          "section": {"no": 4, "title": "語順", "category": "並べ替え"},
          "prompt": {"text": "私は彼女が大好きです。"},
          "response": {
            "type": "word_order",
            "shuffle": true,
            "tokens": [
              {"key": "t1", "text": "very"},
              {"key": "t2", "text": "her"},
              {"key": "t3", "text": "like"},
              {"key": "t4", "text": "I"},
              {"key": "t5", "text": "much"},
              {"key": "t6", "text": "."}
            ]
          },
          "answer": {
            "value": ["t4", "t3", "t2", "t1", "t5", "t6"],
            "display": "I like her very much."
          }
        },
        {
          "id": "eng_example_free_text",
          "section": {"no": 5, "title": "自己表現", "category": "記述"},
          "prompt": {"text": "好きな歌手について、知っていることを英文で書きなさい。"},
          "response": {"type": "free_text", "lines": 3},
          "answer": {"display": "例: I know about music."},
          "explanation": "自分の考えを英文で書きます。"
        }
      ]
    }
  ]
}
```

## 実装上の要点と更新対象

- `app/index.html`: 「Study Tool」表記と更新後のCSS・module version
- `app/src/main.js`: subject表示、response完了判定、英語形式の転記、dataset単位の検証・読み込み継続
- `app/src/response-validation.js`: choice / mode_switch / word_order の読み込み検証
- `app/src/renderers/TextRenderer.js`: 安定した選択肢順、key表示制御、モード切替、tokenクリック操作、answer.display
- `app/src/renderers/ProblemRenderer.js`: 共通response renderer呼び出し（教科別分岐なし）
- `app/src/styles/page.css`: モード切替と語順tokenの表示
- `app/src/data/sync_index.py`: data以下を再帰走査し、問題JSONの親ディレクトリ名をsubjectとしてindexへ反映
- `app/src/data/english/english_lesson3_3_chatgpt.json`: `_inputs/english_lesson3_3_chatgpt.json` から配置した動作確認用の英語サンプル
- `app/src/data/index.json`: 英語サンプルdatasetを登録
- `app/src/main.js`: dataset間で重複したresponse IDがある場合は状態欄に警告
- `README.md`, `docs/engineering-notes.md`: アプリ説明、横断仕様、データ運用を更新

## 運用・更新手順

1. ChatGPTが教材PDFを読み、問題JSONを生成する。教科分類用のJSONフィールドは作らない。
2. `response.type` を元教材が要求する操作に合わせて選ぶ。元から選択式なら `choice`、語順を組み立てるなら `word_order`、選択／記入を切り替えるなら `mode_switch` を使う。
3. 4択にする場合は、ChatGPT側で誤答と誤答理由をJSONに記載する。アプリは生成しない。
4. JSONを `app/src/data/english/` に配置し、`cd app/src/data && python3 sync_index.py` を実行してindexを再生成する。追加・移動・削除は再帰走査で反映され、親フォルダ名がsubjectとして登録される。
5. 起動時に新datasetのresponse構造が検証される。失敗したdataset名と問題IDは画面に表示され、そのdatasetは一覧から外れる。他の正常なdatasetは使える。
6. 静的サーバー経由で開き、回答保存、モード切替、語順操作、答え表示、転記を確認する。

## 検証結果

- 起動時に問題セットを個別に読み込み、response形式エラーのあるセットだけ除外する構成。
- 既存数学datasetで使っているresponse typeは検証対象として引き続き許容する。教科分類は配置フォルダから得るため、既存問題JSONの本文変更は不要。
- 英語サンプル `english_lesson3_3_chatgpt.json` を含む18個のdatasetでJSON parseとresponse検証を実行し、全件エラーなし。
- 18個のdatasetを通じて回答保存IDに重複がないことを確認。
- JavaScript変更4ファイルのmodule構文確認に成功。
- rendererを簡易DOMで実行し、choiceの再描画時順序保持・key非表示、mode_switchの入力保持、word_orderのtoken移動、`answer.display` の表示を確認。
- 実ブラウザを使った全画面操作はこの環境では実行していない。
- 自動採点と正誤判定は追加していない。
