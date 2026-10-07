# mintao-benkyo-tool-memo.d

数学・英語・国語・理科・社会など複数教科の教材を、単一の静的Webアプリで表示・回答するリポジトリです。教材JSONを読み込み、回答入力、答え・解説表示、進捗管理、記憶データの入出力を行う共通ビューアを `app/` 配下で育てています。問題の描画は教科ではなく `response.type` に対応する共通UIを使います。

## 主な場所

- `app/`: ブラウザで配信する静的アプリ本体
- `app/src/data/`: 教科フォルダ別の問題データと `index.json`
- `docs/`: 機能追加ごとの設計・運用メモ
- `misc/GPTs-prompts/`: データ生成や変換に使うプロンプト置き場

## まず読むもの

- `AGENTS.md`: このリポジトリでのドキュメント運用ルール
- `docs/engineering-notes.md`: 横断的な設計方針、運用ルール、検証上の注意
- `docs/answer-checking.md`: 小問単位の答え合わせと見比べ表示
- `docs/english-learning-support.md`: 英語教材、回答モード切替、語順問題、操作型学習モードの仕様と運用
- `docs/english-interaction-coverage.md` / `.json`: 英語JSON全itemの適用判定・coverage一覧
- `docs/japanese-learning-support.md`: 国語の長文・改行表示、本文へ戻る操作、日本語入力の扱い
- `docs/science-learning-support.md`: 理科教材の配置、同期、共通responseでの利用方法
- `docs/social-learning-support.md`: 社会教材の配置、資料画像、参照資料表示の利用方法
- `docs/reference-text-layout.md`: 本文参照型problemの通常・2カラム・モーダル表示
- `docs/app-root-layout.md`: 単一アプリ前提のディレクトリ構成と更新手順
- `docs/transfer-mode-poc.md`: 完了済み問題の転記モード POC と印刷フロー
- `docs/benkyo-tool-prompt01-dataset-selector.md`: dataset 切り替え、入力UI、データ更新の補足

## 起動

```bash
cd app
python3 -m http.server 4173
```

ブラウザで `http://127.0.0.1:4173` を開きます。Windows では `python3` の代わりに `py` や `python` を使って構いません。

## GitHub Pages 公開

`main` への push または Actions の `workflow_dispatch` を起点に、`.github/workflows/pages.yml` が `app/` だけを Pages artifact として公開します。Pages の公開ルートでは `app/index.html` が `/index.html` になり、アプリ内の `./src/...` 相対パスをそのまま利用します。リポジトリ直下の `docs/` や `misc/` は公開対象に含まれません。

初回は GitHub repository の **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。workflow の実行後は同じ Pages 画面または Actions の deploy job に公開URLが表示されます。教材JSONの追加・移動・削除時は、従来どおり手元で `app/src/data/sync_index.py` を実行して `index.json` を更新し、その変更を commit してください。Pages workflow は同期スクリプトを実行せず、commit 済みの `app/` をそのまま配信します。

## データ追加と更新

上部の選択欄で「教科 → 問題セット → ページ」の順に選びます。教科と問題セットは `app/src/data/index.json` から作り、ページ欄には選択中の問題セットのページだけを表示します。最後に開いていた問題セットとページ選択は `localStorage` に保存されるため、再読み込み後も同じ場所を開きます。保存済みの選択先がデータ更新で消えていた場合は、選択可能な問題セットへ戻します。

ツールバー下のページ進捗カード一覧は、ページ数の多い教材で画面を圧迫するため現在は一時的に非表示です。ページ選択欄の各ページ名には完了数が引き続き表示されます。

新しい問題JSONは教科IDと同じ名前のフォルダへ置きます。例えば英語なら `app/src/data/english/lesson.json`、数学なら `app/src/data/math/problems.json`、国語なら `app/src/data/japanese/lesson.json`、理科なら `app/src/data/science/lesson.json`、社会なら `app/src/data/social/lesson.json` です。JSON本体に教科分類用フィールドを追加する必要はありません。

問題JSONを追加・移動・削除したら、`app/src/data/` で次を実行してください。

```bash
cd app/src/data
python3 sync_index.py
```

このツールは `data/` 以下を再帰走査し、問題dataset形式（トップレベルに `meta` オブジェクトと `pages` 配列がある）のJSONをindexへ登録します。`index.json` や管理用JSONは問題datasetとして登録しません。教科IDには問題JSONの親フォルダ名を使い、indexの `path` は `data/` からの相対パスになります。既存の `label` と `defaultDatasetId` は、対応するファイルが残っている限り保持します。

問題データを修正するときは、問題文と `answer` だけでなく `explanation` も同じ規則で見直してください。特に `「aよりb大きい数」= a+b` と `「aよりb小さい数」= a-b` のように符号付きの量を文で扱う設問では、`b` が負数でも記号を読み飛ばさずに整合確認する運用にしています。表形式の問題では、左端に行見出しがあるならheader行にも空の先頭セルを置いて列ずれを防ぎます。`choice` のkeyは既存教材では画面ラベルに使われるため、省略時は表示されます。keyを見せない選択肢では `showKeys: false` を指定します。

## 問題カードの操作

回答UIを持つ問題・小問ごとに、その場で `答え合わせ` または `見比べてみる` を押せます。choice / word_order と mode_switch の選択式は自動判定し、文字入力や自由作文は正誤を断定せず、自分の回答・解答例・解説を並べて表示します。通常モードの `完了` は従来どおり問題カード単位で管理します。操作型モードはgoal到達時に回答を自動判定し、カード内の全回答がそろった場合に完了進捗へ反映します。

英語教材では `choice`、選択式／記入式切替、`word_order` を利用できます。2つの英語datasetにある432 itemを判定し、53 itemにtransform / repair / conversation / role_change / expandを、54 itemすべてのword_orderに途中prefixフィードバックを適用しています。1問（`eng_p65_b2_3`）は既存transformを保ったままword_order feedbackも追加しており、対象は重複を除いて106 itemです。残る326 itemは語彙、読解、自由作文、短い確認など理由を記録して従来形式を維持します。操作型はgoal到達時に答え合わせを求めず、既存の回答判定・完了進捗へ自動反映します。途中状態は保存しません。静的な操作定義は `app/src/interactions/english.js`、全件の判断・answer・explanation・context・distractor情報は `docs/english-interaction-coverage.json`、レビュー用一覧は `docs/english-interaction-coverage.md` にあります。catalogとJSONの整合確認・一覧再生成には `node scripts/english-interaction-coverage.mjs --write` を使います。通常モードの答え合わせ動作は `docs/answer-checking.md` を参照してください。

国語などの長文教材では、長い `context.text` を「本文・資料」として読みやすく表示し、各小問の `本文を見る` から本文へ戻れます。prompt・本文・小問文の改行を保持し、日本語IMEの変換中は入力値の確定処理を待ちます。国語も `mode_switch` など既存の共通responseで扱います。詳細は `docs/japanese-learning-support.md` を参照してください。

理科教材も `science/` 配下へ配置し、既存の `mode_switch`・`choice`・入力UIと本文参照モードで扱います。教科表示は「理科」で、問題描画は教科専用rendererを追加せず既存 `response.type` に委譲します。教材例と更新手順は `docs/science-learning-support.md` を参照してください。

社会教材は `social/` 配下へ配置し、既存の `mode_switch`・`choice`・入力UIと参照資料モードで扱います。地図・写真・グラフ等は `visuals[].type: "image"` でdataset JSONから相対参照します。詳しくは `docs/social-learning-support.md` を参照してください。

長い本文・資料または共有画像に複数設問が付く問題では、参照資料を `通常`・`2カラム`・`モーダル`で表示できます。画像はproblemの `visuals` に `type: "image"` とdataset相対の `src` を指定します。設定は教科共通で保存し、画面幅が狭い場合の2カラムは一時的に縦並びになります。詳細は `docs/reference-text-layout.md` を参照してください。

## 転記モード POC

上部ツールバーの `転記モード` は、現在の問題セットの全ページから `完了` 済みの問題だけを抽出し、紙へ転記しやすい一覧に切り替えます。`転記内容` ボタンで `入力内容` と `解答` を切り替えられ、入れ子の小問も再帰的に拾います。数直線、表、ヒストグラムなどの図表は、親問題ではなく対応する小問ごとに再描画した状態で載せます。`転記を印刷` はこの一覧をそのままブラウザ印刷に回すための POC です。`multi_blank` の設問に後から欄を追加した場合でも、既存 `localStorage` に残る回答オブジェクトは保持し、不足欄だけ `answer.value` から補完してずれを防ぎます。

## 記憶データの入出力

`記憶を書き出す` は `localStorage` に保持している回答入力、完了フラグ、Undo / Redo 履歴、最後に開いていた問題セットとページを 1 つの JSON ファイルへ保存します。`記憶を読み込む` では、その JSON を選ぶと現在の記憶を置き換えて復元します。問題データ更新で `multi_blank` の入力欄が増えたときは、保存済み回答の既存キーは壊さず、新設キーだけ問題JSONの `answer.value` を初期値として補います。

## 補足

- `file://` 直開きでは `fetch()` が使えないため、静的サーバー経由で開く前提です。
- 仕様変更や機能追加をしたら、同じ変更セットで `docs/` と関連 `README.md` を更新する運用です。
- このリポジトリは単一アプリを継続拡張する方針なので、実行物は root 直下の `app/` に集約しています。
