# 英語教材対応

## 何を解決する機能か

数学教材用の静的ビューアを、既存の数学問題を保ったまま英語など複数教科の教材も表示・回答できる共通ビューアへ拡張する。教科別の問題rendererは設けず、問題の共通構造と `response.type` によって回答UIを選ぶ。

英語データの問題文、正答、選択肢、誤答理由、語順token、解説は教材JSON側で完成させる。アプリは誤答を生成しない。choice / word_order と mode_switch.choice は答え合わせ操作で自動判定する。blank / free_text など文字入力は英文の表現差があるため正誤を断定せず、回答・解答例・解説を見比べる。点数、部分点、英文同値判定は行わない。

## 設計

- 教科分類はJSON本文ではなく、JSONを置くフォルダ名で決める。英語教材は `app/src/data/english/`、数学教材は `app/src/data/math/` に配置する。
- 問題と小問の `prompt`, `context`, `items`, `visuals`, `work`, `response`, `answer`, `explanation` 構造を維持する。
- `choice`, `blank`, `free_text`, `multi_blank` など教科共通の回答形式は共通rendererで描画する。
- 英語教材では `choice` に選択肢シャッフルとkey表示設定を加え、`mode_switch` と `word_order` を追加する。
- 既存数学用visualとwork機能はそのまま維持する。英語教材は必要に応じて共通回答形式を使い、数学向け機能は使わない。
- 通常回答モードは入力がそろった後に答え合わせ・完了操作を行う。操作型モードだけはgoal到達時に回答を自動判定し、同じカード内の回答がすべてそろっていれば完了進捗も自動付与する。
- 実験的な操作型学習モードは `app/src/interactions/english.js` の item.id 対応表に置き、教材JSONを変更せずに一部の英語問題へ追加する。定義がある問題だけ既存回答と切り替えて使える。

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

学習者は候補tokenをクリックして回答欄へ移し、回答欄のtokenをクリックして戻せる。「最後の1語を戻す」操作もある。保存値は全文文字列ではなく選択順のkey配列。句読点前の空白を除去して転記する。全tokenを選び終えると入力済みになり、「答え合わせ」で正答key配列と順序込みで比較する。

操作型モードを持つ `word_order` では、各token追加後に既存 `answer.value` との最長一致prefixを調べる。prefix内なら途中でもヒントを出さず、prefixから外れた最初のtokenを軽く強調し、「ここまでよさそう」な範囲を伝える。「もう少しヒント」を押すと定義側の補助ヒントを表示する。誤ったtokenも置いたまま続けられ、1手戻すで修正できる。正答prefixが前回より進んだときだけ成長を進め、誤操作・Undoでは成長を減らさない。

## 実験的な操作型学習モード

### 目的と画面

英文の現在状態を見ながら操作を選び、結果を同じ回答カード内ですぐ確認する短いフィードバックループを試す。既存の回答方法を置き換えず、定義を持つ英語問題だけに「操作して解く」を表示する。問題文、ナビゲーション、カード構造は共通UIを使う。

現時点では25問に対応する。主な変形・段階修理問題は `eng_p34_2_1`、`eng_p34_2_2`、`eng_p34_2_3`、`eng_p41_b2_1`、`eng_p43_b2_2`、`eng_p55_1_1`、`eng_p55_2_1`、`eng_p55_2_2`、`eng_p55_2_3`、`eng_p56_2_1`、`eng_p56_2_2`、`eng_p56_2_3`、`eng_p65_b2_3`。主語変更と三単現、eat → ate、be動詞と一般動詞の否定・疑問、he/him・she/herの役割変更、意味単位で文を伸ばす操作を扱う。タップして修理するrepair問題は `eng_p32_a2_1`、`eng_p32_a2_2`、`eng_p33_b2_3`、`eng_p33_b3_1`、`eng_p33_b3_2`、`eng_p41_b2_2`。be動詞一致・疑問文語順・目的格・Do/Does・see → saw、2箇所を順に直す状態を試せる。`eng_p41_b2_1` の既存eat → ate transformは維持し、過去形repairには別の既存distractorを使う。語順の1語ずつ組み立ては `eng_p32_a3_1`、`eng_p33_b1_1`、`eng_p33_b1_2`、`eng_p34_4_1`、`eng_p34_4_2`、`eng_p34_4_3` で試せる。既存の語順モードと逐次操作の両方を利用できる。

操作typeは `transform`、`repair`、`role_change`、`expand`、`word_order`。通常の段階型は (`initialState`、`steps`、`options`) で動く。repairは同じ `type: "repair"` でも、`repairTargets` がある場合に限って語タップ型になる。各targetは `id`、`token`、空白区切りの英文中の0始まり `tokenIndex`、`operations` を持つ。操作には説明用 `label` と、単語置換なら `replacement`、語順移動など文全体を変える場合は `result` を指定する。`outcome: "progress"` の操作は修理ごとに成長し、英文が `goalState` と一致すると自動完了する。`hints` は1回ずつ表示する段階ヒント。修理済みtargetは操作中に記録し、同じ箇所を再度修理対象にはしない。これらはJSON教材へ追加せず `english.js` だけを更新する。既存の段階型repairは従来どおり `steps` を使う。be動詞の否定は `eng_p65_b2_3` の「No, I am not.」で試す。各操作には `progress`、`valid_but_detour`、`invalid` のいずれかを付ける。無効操作は英文を変更せず短い説明を出し、別操作を続けられる。寄り道操作は英文を変えたうえで、今回のゴールとの違いを小さく知らせる。

進捗表現はCSSの小さな芽で、意味のある操作とword_orderの正答prefix進行で少しずつ成長する。invalid、寄り道、誤ったtokenでは進捗を増やさず、Undoでも減らさない。現在のアプリセッション中は表示中カード間で成長段階を共有するが、ページ再読み込みをまたいで保存しない。「1手戻す」はカード内のメモリ上の操作履歴を戻す。goal到達時はその場で既存の回答判定を実行し、該当responseを正答済みとして記録する。複数の小問を含むカードは、カード内の全responseがそろった時点で既存の問題完了進捗へ自動反映する。操作モード中は「答え合わせ」を表示せず、goal到達前後とも追加の採点操作を求めない。通常回答モードへ切り替えると、保存された正答値と判定状態を確認できる。goal到達後のUndoは操作前の回答値・判定を復元し、この操作で新たに付けた完了状態も取り消す。操作前から完了済みだった問題の完了記録は維持する。解説は「どうしてこの形になる？」から任意に表示でき、解説を開かなくても正答・完了扱いは変わらない。ページ再読み込みをまたいで途中の操作状態を保存することはしない。

### 定義の追加・更新手順

1. 英語datasetの実際の `item.id` または `problem.id`、response、answer、explanationを確認する。
2. `app/src/interactions/english.js` の `englishInteractionOverrides` にIDをキーとして定義を追加する。変形問題は `type`、`initialState`、`goalState`、`steps[].options[]` を指定する。repairは `repairTargets` に対象token位置と操作を定義し、ヒントは `hints` に段階順で書く。word_orderは `type: "word_order"` と必要に応じた `moreHint` を定義し、正答token列はJSONの `answer.value` をそのまま参照する。
3. 選択肢には `label` と結果分類を置き、状態が変わる選択肢には `result`、誤操作には短い `message`、完成操作には `complete: true` を指定する。複数段階は `nextStep` で遷移する。
4. 完成時の既存response値は既存answerから作る。choice/inputのmode_switchではdefaultModeのanswer、word_orderでは `answer.value` を利用する。既存JSONのID、prompt、response、answer、explanationは編集しない。
5. READMEとこの説明、必要なら `docs/engineering-notes.md` を同じ変更セットで更新する。静的サーバーは通常どおり `cd app && python3 -m http.server 4173` で起動し、英語datasetの該当問題で既存回答／操作回答を切り替えて試す。

入力は既存英語問題のIDとresponse/answer/explanation、出力はカード内の操作UIと完成時の既存回答値である。教材JSONへの書き込みや外部通信はなく、ページ再読み込みをまたぐ操作履歴もない。interaction仕様は試用後に変更する前提の小さなID別定義で、汎用文法判定は行わない。

### answer.display / answer.accepted

`answer.display` が文字列なら答えとしてその文字列を表示する。配列なら「、」でつないで表示する。小問の見比べ表示では `display` がない場合もresponse形式に合わせてchoice keyやword_order key配列を読める形に変換する。転記の解答欄も `display` を優先する。

`answer.accepted` は将来用データとして保持できるが、文字入力の自動採点には利用しない。choice / word_order の答え合わせでは対応するresponseと `answer.value` を比較し、mode_switchでは現在のmodeに応じてchoiceを判定、inputを見比べ表示にする。

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

答え合わせの状態はlocalStorageへ保存せず、現在の画面状態として保持する。回答値を変更すると、そのresponseの判定・見比べ表示を解除する。

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
- `app/src/main.js`: subject表示、response完了判定、答え合わせ結果の一時保持、英語形式の転記、dataset単位の検証・読み込み継続
- `app/src/response-checking.js`: choice / word_order / mode_switch の判定区分
- `docs/answer-checking.md`: 小問単位の答え合わせ、状態管理と操作
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
- 英語サンプル `english_lesson3_3_chatgpt.json` を含む19個の登録datasetでJSON parseとresponse検証を実行し、全件エラーなし。
- 19個のdatasetを通じて回答保存IDに重複がないことを確認。
- `main.js`、`ProblemRenderer.js`、`response-checking.js` のmodule構文確認に成功。
- rendererを簡易DOMで実行し、choiceの再描画時順序保持・key非表示、mode_switchの入力保持、word_orderのtoken移動、`answer.display` の表示を確認。
- 答え合わせの8ケース（choice、word_order、mode_switchのchoice/input、free_text、未回答）を確認。
- 実ブラウザを使った全画面操作はこの環境では実行していない。
- choice / word_order / mode_switch.choice の自動判定と、文字入力の見比べ表示をresponse単位に追加。
