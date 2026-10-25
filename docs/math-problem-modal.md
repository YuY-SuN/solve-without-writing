# 数学2610 p.43以降と問題モーダル

## 目的

長い文章題や図表を使う小問で、回答欄から問題文まで戻らずに条件・図・現在の小問を確認できるようにする。数学にも専用の回答UIは追加せず、既存 `mode_switch` のchoice/input、答え合わせ、見比べ表示、回答保存を使う。

## 利用者の操作

問題に参照情報がある場合、小問の `問題を見る` を押すとモーダルを開く。モーダルは問題のsection title、`prompt.text`、`context.text`、problemの `visuals`、現在のitemの番号・文・context・visualsを表示する。正答、解説、choiceの正解情報は含めない。画像・表・数直線・図形等のvisualは通常表示と同じ `VisualRenderer` を使う。

閉じるボタンまたはEscで閉じる。開いたときのページスクロール位置を保存し、閉じた後に同じスクロール位置と起動ボタンのフォーカスを戻す。回答値・choice選択・採点/見比べ状態・現在のmodeには触れない。

数学の `mode_switch` は `選択式` と `入力式` を切り替える。choiceは既存のkeyによる自動採点、inputは文字列採点せず `見比べてみる` で入力・正答・JSONのexplanationを表示する。mode別の入力値は共通response保存形式に保持され、既存 `localStorage` 機構を使う。

数学問題では共通の表示モードを利用できる。`通常` は従来の縦並び、`2カラム` は問題文・条件・図表を左側、小問ごとの式と回答UIを左右に対応させて表示し、`モーダル` は小問単位の「問題を見る」を維持する。数学では `isReferenceProblem()` の対象外でも表示切替を出す。2カラムの左側は広い画面でsticky表示し、内容が画面高を超えた場合は左ペイン内でスクロールする。幅900px以下では縦並びへ切り替わる。

小問の式と文章は左の参照欄に一度表示し、回答操作は右欄に既存Rendererで一度だけ生成する。回答UIを複製しないため、mode_switch、guided_steps、選択状態、途中式、採点結果は通常モードと共通の回答stateを使う。参照欄は問題文・条件・図表・小問文だけから構成し、答えや解説を含めない。

## 実装

- `app/src/renderers/ProblemRenderer.js`: 数学2カラムと小問対応レイアウト、モーダル対象の判定、小問ごとのボタン、問題専用contentの生成、共通dialogの開閉とスクロール/フォーカス復帰
- `app/src/renderers/VisualRenderer.js`: モーダル内のvisual描画に既存rendererを再利用
- `app/src/renderers/TextRenderer.js`: mode switchの共通表示名を「入力式」に統一
- `app/src/styles/page.css`: 小さな起動ボタン、広いdialog、画像の幅制限、狭い画面の内部スクロール
- `app/src/styles/page.css`: 2カラムのsticky参照欄、小問式と回答UIの左右配置、900px以下の縦並び
- `app/src/main.js`: 既存のdataset URLとresponse/localStorage配線を利用
- `app/index.html`: module cache version
- `app/src/data/math/math_jhs1_p43_p79.json`: 数学2610教材の原本p.43〜79
- `app/src/data/math/assets/`: 教材JSONから相対参照する7画像
- `app/src/data/index.json`: 同期スクリプトが登録する教材index
- `README.md`, `docs/engineering-notes.md`: 利用案内と継続設計メモ

モーダル内容は問題・小問の読み取り専用データから組み立てる。response UIの再描画や状態更新は呼ばない。参照資料表示のモーダルも同じdialog helperを使い、タイトルとcontentを差し替える。

## 教材の更新手順

ZIPは `_inputs/math2610_p43_p79_bundle.zip` に保持する。教材更新時は原本JSONを内容補正せず `app/src/data/math/` へ配置し、ZIP内の `assets/` を `app/src/data/math/assets/` へ配置する。画像 `src` は `assets/name.png` のまま保つ。監査用CSV、manifest、contact sheetは教材JSONとして配置しない。

配置後、リポジトリ直下から次を実行する。

```bash
python3 app/src/data/sync_index.py
```

indexへ登録されたdatasetの `subject` は配置先フォルダ名 `math` から決まる。追加JSONと `app/src/data/index.json` は同じ変更セットで管理する。画像URLはJSONのURLを基準に解決するため、root相対パスへ書き換えない。

## 検証

- JSON parse、page/problem/item IDの一意性、mode_switchのdefaultMode、choice answer key、uncertain保持を確認する
- JSON内visualの相対参照がすべて `math/assets/` に存在することを確認する
- p.45、p.57、p.68、p.70、p.75で問題文とvisualを開閉し、回答位置が維持されることを確認する
- choice採点、input見比べ、mode切替、localStorageの回答保持が共通機能として動くことを確認する
- 英語・国語・理科・社会の既存回答UIと参照資料モーダルも確認する
- 数学p.43など式を持つ複数小問とp.45、p.57、p.68、p.70、p.75の文章題・図表を2カラムで確認する
- 表示モードを切り替えてguided_stepsの途中状態、回答、採点・完了状態が維持されることを確認する
- 900px以下では縦並びになり、モーダル表示が従来どおり利用できることを確認する
