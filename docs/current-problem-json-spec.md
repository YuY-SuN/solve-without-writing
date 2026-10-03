# 現在の問題JSON仕様（実装調査結果）

このアプリは問題JSONを表示し、回答を保存し、入力がそろった問題に利用者が「完了」を付ける構成です。回答と `answer` を比較する正誤判定や点数計算は実装されていません。`answer.accepted` などがデータにあっても、採点には使われません。

以下は新仕様の提案ではなく、現在のコードと収録データの事実です。主な問題JSONの実例は `app/src/data/problems.json`、各形式の実例は `app/src/data/problems003-2.json`、`app/src/data/problems002.json`、`app/src/data/math_workbook_pages_30_31.json` にあります。

## 1. ファイルの構造と読み込み

問題セットは `app/src/data/` のJSONファイルです。アプリはまず `app/src/data/index.json` を読み、列挙された**全問題セット**を起動時に読み込みます。問題JSONを置くだけでは画面の選択肢に現れず、`index.json` への登録が必要です。読み込み処理は `app/src/main.js` にあります。

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

| 場所 | フィールド | 現在の意味 |
|---|---|---|
| `index.json` | `defaultDatasetId` | 初期表示する `datasets[].id`。省略時は先頭セットへフォールバック |
| `index.json` | `datasets` | 問題セット一覧。空配列だと起動エラー |
| `datasets[]` | `id`, `label`, `path` | 保存用ID、選択肢の表示名、`app/src/data/` からのファイル名 |
| 問題JSONのルート | `meta.title`, `meta.source`, `meta.version` | 画面ヘッダーで使用。`meta.language` の実例はあるが表示処理では参照しない |
| 問題JSONのルート | `pages` | ページ配列 |
| `pages[]` | `page`, `problems` | ページ番号と問題配列。ページ選択・進捗集計に使用 |

`pages[].page` は数値として扱うのが安全です。ページ選択肢は番号順に並びます。問題オブジェクトに別途 `page` が書かれた実例もありますが、表示・集計時には**外側の `pages[].page` で上書き**されます。`meta` と `pages`、各ページの `problems` は正常な画面表示に実質必須です。

JSON Schema、TypeScriptの型・interface、dataclassはありません。英語教材対応後は `app/src/response-validation.js` が新形式を含むresponse構造を起動時に検証します。仕様はこの検証処理とJavaScriptの分岐で決まります。`index.json` の更新ツールは `app/src/data/sync_index.py` です。英語responseの詳細は [english-learning-support.md](english-learning-support.md) を参照してください。

## 2. 問題・小問の共通構造

```json
{
  "id": "p006_q08",
  "section": {
    "no": 8,
    "title": "比例と反比例",
    "category": "変化と対応"
  },
  "prompt": { "text": "問題文" },
  "context": { "text": "補足文" },
  "items": [],
  "visuals": [],
  "work": { "type": "expression_steps" },
  "response": { "type": "blank" },
  "answer": { "value": "答え" },
  "answerVisuals": [],
  "explanation": "解説",
  "notes": "",
  "uncertain": false
}
```

| フィールド | 必須性と意味 |
|---|---|
| `id` | **問題には実質必須**。回答保存キー、画面表示に使用 |
| `section.no`, `.title`, `.category` | **問題には実質必須**。カード見出しで直接参照。`category` は空文字でも可 |
| `prompt.text` | 任意。問題文として表示 |
| `context.text` | 任意。補足文として問題文の下に表示 |
| `items` | 任意。小問の配列。小問の中にも `items` を置ける再帰構造 |
| `visuals` | 任意。問題・小問に表示する図表の配列 |
| `work` | 任意。最終回答と別の途中式欄 |
| `response` | 任意。回答UIの形式。ない場合は回答欄なし |
| `answer` | 任意。答え表示と一部の図入力・完了判定に使用。親問題の `{}` も実例あり |
| `answerVisuals` | 任意。答えとして表示する図の配列。一部の図入力にも必要 |
| `explanation` | 任意。文字列の解説 |
| `notes`, `uncertain` | 生成データにある補足メモ・不確実性フラグ。現在の問題UIや判定では参照しない |

小問では `id`, `no`, `label`, `text`, `context`, `visuals`, `work`, `response`, `answer`, `answerVisuals`, `explanation`, `items` を使えます。`no` と `label` は小問見出し、`text` は小問本文です。`section` と `prompt.text` は親問題側の構造です。問題UIの組み立ては `app/src/renderers/ProblemRenderer.js`、文章・回答欄・答えの表示は `app/src/renderers/TextRenderer.js` にあります。

`answer` は固定の型ではありません。既存データには `value`（数値・文字列・配列・キー付きオブジェクト）、`display`、`formula`、`unit`、`accepted`、`relation` があります。通常画面の「答え」は**`answer` オブジェクト全体をJSONとして表示**します。転記モードでは `display` が文字列または配列ならそれを優先し、なければ `value` を形式別に整形します。`formula`・`unit`・`accepted` は通常画面には表示されますが、採点規則ではありません。

## 3. 現在の回答形式

従来の数学教材にあるresponse typeは9種類で、英語対応で `word_order` と `mode_switch` が追加されました。これはJSON Schemaのenumではなく、rendererと検証処理が対応している値です。未知の値は読み込み時に問題セット単位でスキップされます。

| `response.type` | 必要な構造・入力UI | 保存される回答値 | 「入力済み」の条件 |
|---|---|---|---|
| `blank` | 1行の文字入力。任意の `unit` を欄の横に表示 | 文字列 | 空白を除き空でない |
| `multi_blank` | `fields: [{key,label}, ...]`。順番どおり欄を表示 | `{key: 入力文字列}` | 全 `fields[].key` が非空 |
| `free_text` | `lines` が1以下なら1行、通常はテキストエリア。既定は2行 | 文字列 | 非空 |
| `choice` | `choices: [{key,text}, ...]`。`multiple: true` でチェックボックス、それ以外はラジオ | 単一ならキー文字列、複数ならキー文字列の配列 | 単一は非空、複数は1件以上 |
| `table_fill` | `targets: [{row,col,key}, ...]` と、表セルの `{blank:true,key}`。行・列は**0始まり** | `{key: 入力文字列}` | 全 `targets[].key` が非空 |
| `ladder_fill` | `targets: [{key,...}, ...]` と、階段図内の `{blank:true,key}` | `{key: 入力文字列}` | 全 `targets[].key` が非空 |
| `draw_graph` | 数直線への点入力、またはヒストグラムの棒入力 | 数直線は数値配列、棒は `{bins: 数値配列}` | `answer.value` が配列なら同じ件数、`answer.value.bins` が配列なら同じ棒数 |
| `draw_point` | 数直線へラベル付きの点を配置 | `{ラベル: 数値}` | `answer.value` の全キーに値がある |
| `none` | 回答欄なし | なし | 常に入力済み扱い |
| `word_order` | `tokens:[{key,text}]`。任意の `shuffle`。tokenをクリックして順序を作る | token keyの配列 | 全tokenを選択 |
| `mode_switch` | `defaultMode` と `modes` にresponse形式を指定 | `{"mode":"...","values":{"mode名": mode別回答}}` | 現在のmodeのresponse形式に委譲 |

`choice` の保存値は `choice.key ?? choice.text ?? ""` で決まります。`showKeys:false` を指定するとkeyを隠し、省略時は従来どおり表示します。`shuffle:true` は表示順をresponseオブジェクト単位で固定し、DOM再描画で順序が変わらないようにします。選択肢配列の順序が通常の表示順です。`multiple` を省略すると単一選択です。`answer.value` が選択肢のキーと対応する実例がありますが、アプリはその一致を判定しません。

`draw_graph` は**図の種類で `answer.value` の形が変わります**。数直線の実例には数値・`{type:"fraction",numerator,denominator}` を含む配列と、`{points:[...]}` の両方があります。ただし現在の完了判定が対応するのは配列、または `{bins:[...]}` です。`{points:[...]}` は転記表示では扱われますが、**完了判定では未対応**です。数直線UIは点を目盛り幅へ丸め、値を昇順で保存し、同じ座標への点の重複追加はできません。`draw_point` では `answer.value` のキーの列挙順が、画面上で追加する点ラベルの順序になります。

`multi_blank` は既存回答に後から欄が増えた場合、保存済みオブジェクトで空のキーを `answer.value` から補完する処理があります。つまり `answer.value` は答え表示以外に、**既存回答の移行にも使われます**。

## 4. 図表形式と暗黙の依存関係

`visuals[]` と `answerVisuals[]` の `type` で対応する値は次の8種類です。図表の振り分けは `app/src/renderers/VisualRenderer.js` にあります。

| `visual.type` | 主なフィールド・制約 |
|---|---|
| `table` | `columns` が見出し、`rows` が行配列。`style.header` は省略時も有効、`false` なら見出し行なし。左端に行見出しがある表は `columns` の先頭に空セルを置くと列がそろう。入力セルは `{blank:true,key}` |
| `number_line` | `range:{min,max}`、`ticks:{minor,major,labels}`、任意の `points:[{label,value}]`。`range` と `ticks.minor/major` は描画上必要。`draw_graph`・`draw_point` の入力場所にもなる |
| `geometry_2d` | `shape` は `triangle`, `parallelogram`, `rhombus`, `trapezoid`, `set_inclusion`。通常の図形ラベルは `[{text,target}]`、`set_inclusion` のラベルは `{all,integer,natural}` |
| `geometry_3d` | `shape` は `cube`, `cuboid`, `cylinder`。`labels:[{text,edge}]` を描画。`dimensions` の実例はあるが描画には使われない |
| `graph_grid` | `xAxis`・`yAxis` に `{label,min,max,tick}`。ヒストグラム入力では、同じ問題・小問の `answerVisuals` に `histogram` が必要 |
| `histogram` | `xAxis:{label,bins:[{from,to}]}`、`yAxis:{label,min,max,tick}`、`values`。配列の添字で階級と棒の高さが対応 |
| `net` | `faces:[{x,y,label}, ...]` は実質必須。`cellSize` は任意。収録データの `solid`, `question`, `answer` は描画側では参照されない |
| `factorization_ladder` | `steps:[{divisor,dividend,quotient,note?}]`、任意の `finalExpression:{left,right}`。各値に `{blank:true,key}` を置ける。収録データの `method`, `target`, `layout`, `step` 番号は現在の描画では参照されない |

図表の `width`・`height` には種類ごとの既定値があります。表と階段図の空欄は、`response.targets` に対応するキーがあって初めて入力できます。**単に `targets` だけを書いても欄は生まれません。** `table_fill` の `row`・`col` は表の `rows` 配列内の位置です。階段図の `targets[].role`・`.step` は収録データにありますが、現在の入力欄との結合は `key` で行います。

ヒストグラム入力では、`visuals` の `graph_grid` に加え、`answerVisuals` の `histogram.values.length` から棒の本数を決めます。`answer.value.bins` も同じ順・本数に合わせる必要があります。図の `histogram` だけを配置しても、入力UIにはなりません。

## 5. 途中式、ID、回答保持、完了

`work.type` は `expression_steps`, `distribution_guide`, `fraction_common_denominator_guide` の3種類です。共通で `label`, `optional`, `defaultOpen`, `description`, `starter.expression` を使い、自由記録型には `suggestedNotes`、導き型には `prompts`, `hints`, `placeholders` などがあります。`distribution_guide` は `operationOptions`、通分型は `leftLabel`・`rightLabel` も使います。`work` は**完了条件に含まれません**。詳細な既存データ形は `docs/expression-work-input-plan.md`、分岐は `app/src/renderers/WorkRenderer.js` にあります。`optional:false` は見出しの「任意」を消しますが、完了判定を必須にする機能ではありません。

IDに厳密な命名検証はありません。収録データには `p006_q08`、`p006_q08_01` などの慣例があります。問題の回答・途中式の保存キーは `problem.id`、小問は `item.id`、省略時は `${problem.id}-item-${item.no ?? "response"}` です。小問IDを省略するなら、**同じ親問題内で `no` を重複させないこと**が必要です。回答保存キーには問題セットIDやページ番号が入らないため、異なる問題セットでも回答を分離したいIDは重複させない必要があります。一方、完了フラグのキーは `datasetId::page::problemId` です。

回答はブラウザの `localStorage` の `benkyo-tool-prompt01:response-values:v1`、途中式は `benkyo-tool-prompt01:work-values:v1` に保存します。回答のUndo/Redoは全回答状態のスナップショットを最大10件保持します。完了フラグは `benkyo-tool-prompt01:completed-problems:v1` です。問題の全 `response` が「入力済み」になった後で、利用者が完了チェックを付けます。`response` がない問題や `none` だけの問題は、未入力でも完了を付けられます。入力を消して条件を満たさなくなると完了フラグは外れます。

## 6. 現仕様で表現しにくいこと

- **自動採点・点数・部分点・許容誤差・別解判定**を指定する仕組みはありません。`answer.accepted` の実例はあっても判定処理はありません。
- 自由記述や数式について、数式としての同値性を評価しません。回答は基本的に文字列として保存します。
- `draw_graph` の `{points:[...]}` は実データにありますが、現在の完了判定に合いません。
- 幾何図形や展開図は用意された形のCanvas描画です。任意の画像・任意の図形構成・図上での幾何操作をJSONだけで指定する一般的な仕組みはありません。
- 図中の `question` や `answer`、`notes`、`uncertain` など、収録データにあっても現在のUIが解釈しないフィールドがあります。
- 問題JSONの構造検証がないため、必要フィールドの欠落やキーの不一致を読み込み時に一括検出しません。

## 最小JSON例

これは**問題セットファイルの内容**です。表示するには、このファイル名を前述の `index.json` の `datasets` に登録します。

```json
{
  "meta": {
    "title": "最小の問題セット",
    "source": "作成例",
    "version": "1"
  },
  "pages": [
    {
      "page": 1,
      "problems": [
        {
          "id": "sample_001",
          "section": {
            "no": 1,
            "title": "たし算",
            "category": "計算"
          },
          "prompt": {
            "text": "1＋1はいくつですか。"
          },
          "response": {
            "type": "blank"
          },
          "answer": {
            "value": 2
          }
        }
      ]
    }
  ]
}
```

## 主要な問題形式をすべて含むJSON例

次の**1ファイル**で、従来の9種類の `response.type`、8種類の図表、入れ子の小問、途中式欄を示します。英語対応で追加した2形式を含む読み込み可能な完成例は `docs/english-learning-support.md` にあります。図表入力に必要なキーの対応も含めています。これは現行アプリで読み込める構造の例であり、採点データではありません。

```json
{
  "meta": {
    "title": "現行形式の総合例",
    "source": "仕様説明用",
    "version": "1",
    "language": "ja"
  },
  "pages": [
    {
      "page": 1,
      "problems": [
        {
          "id": "example_all",
          "section": {
            "no": 1,
            "title": "回答形式の例",
            "category": "総合"
          },
          "prompt": {
            "text": "各小問に答えなさい。"
          },
          "context": {
            "text": "図がある小問では図も使ってください。"
          },
          "response": {
            "type": "none"
          },
          "items": [
            {
              "id": "example_blank",
              "no": 1,
              "text": "底辺4cm、高さ3cmの三角形の面積は？",
              "visuals": [
                {
                  "type": "geometry_2d",
                  "shape": "triangle",
                  "labels": [
                    {"text": "4 cm", "target": "base"},
                    {"text": "3 cm", "target": "height"}
                  ]
                }
              ],
              "work": {
                "type": "expression_steps",
                "optional": true,
                "label": "途中式",
                "starter": {"expression": "4×3÷2"},
                "suggestedNotes": ["面積"]
              },
              "response": {"type": "blank", "unit": "cm²"},
              "answer": {"formula": "4×3÷2", "value": 6, "unit": "cm²"},
              "explanation": "底辺×高さ÷2で求めます。"
            },
            {
              "id": "example_multi",
              "no": 2,
              "text": "二つの数を書きなさい。",
              "response": {
                "type": "multi_blank",
                "fields": [
                  {"key": "first", "label": "一つ目"},
                  {"key": "second", "label": "二つ目"}
                ]
              },
              "answer": {"value": {"first": 2, "second": 3}}
            },
            {
              "id": "example_text",
              "no": 3,
              "text": "立方体と展開図について説明しなさい。",
              "visuals": [
                {
                  "type": "geometry_3d",
                  "shape": "cube",
                  "labels": [{"text": "3 cm", "edge": "width"}]
                },
                {
                  "type": "net",
                  "cellSize": 40,
                  "faces": [
                    {"x": 1, "y": 0, "label": "あ"},
                    {"x": 0, "y": 1, "label": "い"},
                    {"x": 1, "y": 1, "label": "う"},
                    {"x": 2, "y": 1, "label": "え"},
                    {"x": 1, "y": 2, "label": "お"},
                    {"x": 1, "y": 3, "label": "か"}
                  ]
                }
              ],
              "response": {"type": "free_text", "lines": 3},
              "answer": {"value": "六つの正方形からなる。"}
            },
            {
              "id": "example_choice",
              "no": 4,
              "text": "整数をすべて選びなさい。",
              "response": {
                "type": "choice",
                "multiple": true,
                "choices": [
                  {"key": "a", "text": "2"},
                  {"key": "b", "text": "1/2"},
                  {"key": "c", "text": "-3"}
                ]
              },
              "answer": {"value": ["a", "c"]}
            },
            {
              "id": "example_table",
              "no": 5,
              "text": "表を埋めなさい。",
              "visuals": [
                {
                  "type": "table",
                  "columns": ["", "月", "火"],
                  "rows": [
                    [
                      "人数",
                      {"blank": true, "key": "mon"},
                      {"blank": true, "key": "tue"}
                    ]
                  ],
                  "style": {"header": true, "compact": true}
                }
              ],
              "response": {
                "type": "table_fill",
                "targets": [
                  {"row": 0, "col": 1, "key": "mon"},
                  {"row": 0, "col": 2, "key": "tue"}
                ]
              },
              "answer": {"value": {"mon": 2, "tue": 3}}
            },
            {
              "id": "example_ladder",
              "no": 6,
              "text": "階段図の空欄を埋めなさい。",
              "visuals": [
                {
                  "type": "factorization_ladder",
                  "steps": [
                    {
                      "divisor": 2,
                      "dividend": 12,
                      "quotient": {"blank": true, "key": "quotient"}
                    }
                  ],
                  "finalExpression": {
                    "left": 12,
                    "right": {"blank": true, "key": "factors"}
                  }
                }
              ],
              "response": {
                "type": "ladder_fill",
                "targets": [
                  {"key": "quotient", "role": "quotient"},
                  {"key": "factors", "role": "final_expression"}
                ]
              },
              "answer": {"value": {"quotient": 6, "factors": "2×2×3"}}
            },
            {
              "id": "example_graph_points",
              "no": 7,
              "text": "数直線に2点を置きなさい。",
              "visuals": [
                {
                  "type": "number_line",
                  "range": {"min": -2, "max": 2},
                  "ticks": {"minor": 1, "major": 1, "labels": [-2, -1, 0, 1, 2]},
                  "points": []
                }
              ],
              "response": {"type": "draw_graph"},
              "answer": {"value": [-1, 1]},
              "answerVisuals": [
                {
                  "type": "number_line",
                  "range": {"min": -2, "max": 2},
                  "ticks": {"minor": 1, "major": 1, "labels": [-2, -1, 0, 1, 2]},
                  "points": [
                    {"label": "", "value": -1},
                    {"label": "", "value": 1}
                  ]
                }
              ]
            },
            {
              "id": "example_graph_bars",
              "no": 8,
              "text": "2階級の棒の高さを入力しなさい。",
              "visuals": [
                {
                  "type": "graph_grid",
                  "xAxis": {"label": "階級", "min": 0, "max": 2, "tick": 1},
                  "yAxis": {"label": "人数", "min": 0, "max": 5, "tick": 1}
                }
              ],
              "response": {"type": "draw_graph"},
              "answer": {"value": {"bins": [2, 3]}},
              "answerVisuals": [
                {
                  "type": "histogram",
                  "xAxis": {
                    "label": "階級",
                    "bins": [
                      {"from": 0, "to": 1},
                      {"from": 1, "to": 2}
                    ]
                  },
                  "yAxis": {"label": "人数", "min": 0, "max": 5, "tick": 1},
                  "values": [2, 3]
                }
              ]
            },
            {
              "id": "example_draw_point",
              "no": 9,
              "text": "AとBを数直線に置きなさい。",
              "visuals": [
                {
                  "type": "number_line",
                  "range": {"min": -2, "max": 2},
                  "ticks": {"minor": 1, "major": 1, "labels": [-2, -1, 0, 1, 2]},
                  "points": []
                }
              ],
              "response": {"type": "draw_point"},
              "answer": {"value": {"A": -1, "B": 1}}
            },
            {
              "id": "example_none",
              "no": 10,
              "text": "この小問は資料を読むだけです。",
              "response": {"type": "none"},
              "answer": {}
            }
          ]
        }
      ]
    }
  ]
}
```
