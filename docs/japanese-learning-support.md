# 国語教材の表示と運用

## 目的と設計

中学校国語の読解・漢字教材を、数学・英語と同じ教材ビューアで扱う。教科別rendererや国語専用response typeは追加せず、問題文は共通の `problem` / `items` 構造、回答操作は `response.type` で表現する。

国語の選択式は既存の `choice`、選択式と記入式の切替は `mode_switch` を使用する。選択式は「答え合わせ」で自動判定し、記入式は正誤判定せずに「見比べてみる」で入力・解答例・解説を表示する。回答値の保存、完了管理、結果表示は共通処理を利用する。

## データの配置とindex更新

国語教材は `app/src/data/japanese/` に置く。例:

```text
app/src/data/japanese/japanese_jhs1_jun_nov_reading_kanji.json
```

subject IDはフォルダ名 `japanese` から決まり、JSON内へ `meta.subject` を追加する必要はない。`sync_index.py` は既にフォルダ名を汎用subjectとして出力するため、教科を追加するための個別同期処理は不要。

教材JSONを追加・移動・削除したら、次を実行する。

```bash
cd app/src/data
python3 sync_index.py
```

トップレベルに `meta` と `pages` を持つJSONがindexに登録される。`index.json` や管理用JSONは対象外。今回のdatasetは表示名「中学1年 国語 6〜11月想定 読解50問＋漢字」、subject「国語」として登録した。

## 本文・資料の表示

長い `context.text`（180文字以上、または改行が2個以上）は「本文・資料」パネルとして区別して表示する。本文は `pre-wrap` 相当の折り返しで改行と空行を維持し、行間を広めにして最大幅を制限する。短いcontextは従来どおりの補足ブロック表示とする。

`prompt.text` と `item.text` も改行を維持する。詩、古文と現代語の手がかり、引用、会話文、複数資料は既存の `context.text` のまま表現できる。

長文contextがあるproblemでは、各小問の近くに `本文を見る` リンクを置く。リンク先の本文パネルへスクロールできるため、設問を解きながら本文へ戻れる。画面幅に応じた2カラム表示やsticky本文は今回追加せず、縦並びのまま利用する。

## 日本語入力とIME

blank / free_text等の入力欄はUnicodeの値をそのままresponse stateとlocalStorageに保存する。IME変換中の中間入力値は保存せず、`compositionend` で確定した値を保存する。通常の `input` イベントも変換中 (`event.isComposing`) は処理を待つ。

テキスト入力欄にEnterキーで答え合わせ等を起動する機能はないため、変換確定のEnterが教材操作と競合しない。図のcanvasでDelete / Backspaceを扱うkeydown処理も `event.isComposing` またはIMEのkeyCode 229では何もしない。

日本語回答の保存・復元は既存のresponse値保存を使う。日本語文字列をASCIIへ変換したり、文字列一致による記述答案の自動採点を行ったりしない。

## 更新対象と保守

- `app/src/data/japanese/japanese_jhs1_jun_nov_reading_kanji.json`: 国語テスト教材
- `app/src/data/index.json`: `sync_index.py` が生成する教科・教材一覧
- `app/src/main.js`: `SUBJECT_LABELS` 表示名対応表。未知subjectはIDをそのまま表示
- `app/src/renderers/TextRenderer.js`: context長文表示、改行保持、日本語IMEのcomposition対応
- `app/src/renderers/ProblemRenderer.js`: 小問から本文へ戻るリンク
- `app/src/renderers/NumberLineRenderer.js`, `GraphRenderer.js`: IME composition中のキー操作抑制
- `app/src/styles/page.css`: 本文の幅・行間・段落と設問から戻るリンクの表示
- `README.md`, `docs/engineering-notes.md`: 利用手順と横断仕様

JSON内容を変更した場合は既存response validationを実行し、選択式・記入式双方の解答値と解説を確認する。新しい教科を追加する場合、教科フォルダを作りJSONを置いてindexを再生成する。表示ラベルがsubject IDと異なる場合のみ `SUBJECT_LABELS` に一項目追加する。回答UIは既存response typeを再利用する。

## 検証項目と現状

- `japanese/` 配下の教材が `sync_index.py` で `subject: "japanese"` として登録される
- 国語datasetの全responseが既存response validationを通る
- 長文contextに「本文・資料」ラベルが付き、prompt / context / item textの改行が保持される
- 各読解小問に本文へ戻るリンクがあり、親problem本文は答え合わせの正誤色で塗られない
- choiceとmode_switch.choiceは自動判定し、mode_switch.inputは見比べ表示になる
- IME composition中の中間値とkeydown操作を抑止し、compositionend後の日本語を保存する
- 既存の数学・英語datasetがindexとresponse validationで引き続き読み込める

この環境ではブラウザを使ったIME実機操作までは行っていない。静的サーバーでの画面確認と、日本語IMEの変換確定・保存復元は利用者側の受入確認項目として残す。
