# 小問単位の答え合わせ

## 目的

問題を解いた場所からスクロールせずに、回答・正答・解説を見られるようにする。自動判定できる形式は結果を示し、文字入力や自由作文は正誤を断定せず、回答例と見比べる。

## 利用者の操作

回答UIを持つproblem/itemの直下にボタンを表示する。`items` が何段ネストしていても、それぞれresponseを持つ最小ノードごとにボタンを置く。responseを持たない見出しproblemにはボタンを置かない。

| response | ボタン | 動作 |
|---|---|---|
| `choice` | `答え合わせ` | 選択keyを `answer.value` と比較 |
| `word_order` | `答え合わせ` | token key配列を順序込みで `answer.value` と比較 |
| `mode_switch` のchoice mode | `答え合わせ` | 現在選択中choiceのkeyをmode別の正答と比較 |
| `mode_switch` のinput mode | `見比べてみる` | 入力を採点せず、入力・解答例・解説を表示 |
| `blank`, `multi_blank`, `free_text` など | `見比べてみる` | 文字列一致判定をせず、入力・解答例・解説を表示 |

未回答ならボタンを無効にする。choiceの不正解は「△ 確認してみよう」、正解は「✓ 正解」と表示し、response unitだけを淡い色で囲む。見比べ表示には正誤色を付けない。選んだ誤答choiceに個別 `explanation` があれば、問題全体のexplanationより前に表示する。

問題カード下部の完了チェックは残し、答え合わせ時に自動では付けない。旧「答えを表示」「解説を表示」の一括トグルは重複を避けるため撤去した。回答操作のない `response.type: "none"` 等で答えだけがあるノードは、「答え・解説を見る」で従来どおり参照できる。

既存数学JSONには、解説が親problemにあり回答UIが子itemにある形式がある。その場合、親の解説を各回答itemへ引き継ぎ、小問単位の答え合わせ結果内に表示する。親problem自体には答え合わせボタンを追加しない。

## 判定状態

判定結果は `main.js` の `checkedResponses` にresponse keyごとに保持する。localStorageや記憶データexportには含めず、再読み込みで解除される。一方、通常の再描画や別の小問への入力では保持する。回答値が変わると該当keyだけ解除し、回答変更を伴うclear / undo / redoでも古い判定を残さない。mode_switchでmodeを切り替えた場合も回答値の変更として扱う。

自動判定規則はresponse typeから決める。

- `choice`: 単一選択はkeyの一致、複数選択は選択key集合の一致
- `word_order`: key配列の各位置が一致
- `mode_switch`: 現在のmodeのresponseへ委譲する。choiceだけ自動判定し、inputは見比べる
- その他のresponse: 機械的な正誤判定をせず、回答を解答例と並べる

文字入力では `answer.accepted` を使った一致判定もしない。表現差を正誤として断定しないためである。

## 実装と保守

- `app/src/renderers/ProblemRenderer.js`: response unitごとのボタン、回答表示、正答・解説の展開、状態classを描画
- `app/src/response-checking.js`: 回答完了後のchoice / word_order / mode_switch判定
- `app/src/main.js`: 完了条件の共有、checked stateの保持と回答変更時の解除
- `app/src/styles/page.css`: 正解・確認対象・見比べ表示の色とレイアウト
- `app/index.html`: 旧一括トグルを削除し、module cache versionを更新
- `README.md`, `docs/engineering-notes.md`, `docs/english-learning-support.md`: 利用方法と横断仕様

問題JSONには新しい `grading` フィールドを要求しない。既存 `answer.value`, `answer.display`, `answer.modes`, `explanation`, choice個別 `explanation` を使用する。新しい回答形式を追加する場合は、既定で自動判定してよいかを `response-checking.js` に明示し、見比べ形式なら `ProblemRenderer` の表示フォーマットも確認する。

## 検証項目

- choice正解・不正解で、response unitだけが薄緑・薄アンバーになり、文字ラベルも出る
- word_orderは重複tokenを含めkey配列の順序で判定する
- mode_switchはchoice / input切替に応じて判定方式とボタン文言を変更する
- blank / free_textは緑・アンバー判定をせず、回答・解答例・explanationを表示する
- 入力後に答え合わせをしてから値を変えると、結果表示と色が解除される
- 親problemの複数itemに異なる結果を出しても、親カードや兄弟itemへ色が波及しない
- 完了チェック、転記モード、既存数学responseを引き続き使える
