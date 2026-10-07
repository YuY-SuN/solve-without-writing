# 社会教材サポート

## 目的と設計

社会教材では、地図・写真・グラフ・統計表などの資料自体を読み取る学習を保つ。教材JSONは既存の共通 `problem` / `items` / `response` / `visuals` 構造を使い、社会専用rendererやresponse typeは追加しない。教科IDは `app/src/data/social/` の親フォルダ名から同期され、画面表示名は `main.js` の `SUBJECT_LABELS` で「社会」とする。

参照資料を持つproblemでは、既存の通常・2カラム・モーダル表示を使用する。資料画像は問題単位の `visuals` に置き、dataset JSONのURLを基準に相対パスを解決する。複数の資料画像は既存VisualRendererが縦に並べ、各画像は幅に合わせて縮小し元の縦横比を維持する。

## 利用者の操作

教科選択で「社会」を選び、教材、ページの順に選ぶ。複数小問が同じ資料を参照する場合、参照資料の表示モードから通常・2カラム・モーダルを選択できる。choiceは既存の答え合わせを利用し、記述入力は正誤判定せず「見比べてみる」で自分の回答・解答例・解説を確認する。

## 教材の配置と更新

1. 教材JSONを `app/src/data/social/` へ置く。
2. JSONの `visuals[].src` を `assets/<画像ファイル名>` とし、各PNGを `app/src/data/social/assets/` へ配置する。
3. `visuals[].alt` は資料の内容を中立的に説明し、問題の正答を書かない。必要なときは `caption` を使って「資料1」等のラベルを表示する。
4. リポジトリルートから `python3 app/src/data/sync_index.py` を実行する。
5. `app/src/data/index.json` に `subject: "social"` と `path: "social/<filename>.json"` のentryができたことを確認する。
6. JSONをparseし、すべての画像参照が実在し、大小文字を含むファイル名が一致することを確認する。

`sync_index.py` は `data/<subject>/` を再帰走査する汎用実装なので、社会専用の同期コードは不要。GitHub Pages workflowは `app/` 全体を公開するため、`app/src/data/social/assets/` も通常の公開artifactへ含まれる。画像パスに `/src/...` のroot相対URLを使わず、dataset相対パスを維持する。

## 今回の教材

基準JSONは `_inputs/social_jhs1_ancient_europe_africa.json` から `app/src/data/social/social_jhs1_ancient_europe_africa.json` へ配置した。14ページ・20 problemがあり、19 problemの `visuals` から34枚の異なるPNGを参照する。`soc_p004_human` の10小問は当初「空欄Nに入る語」とだけ書かれ、空欄を含む文章が欠けていたため、answerとexplanationに整合する穴埋め文を各itemの `text` に補った。提供ZIPからJSONが参照する34枚を `assets/` に展開した。ZIP内の `ancient_mesopotamia_egypt_china.png` と `ancient_writing_and_regions.png` はJSONから参照されていないため、本番assetsには含めていない。`README.md`、`manifest.json`、`contact_sheet.png` も確認用のため含めない。

全34画像URLがHTTP 200で取得できること、複数資料を使うproblemで全画像が通常・2カラム・モーダルに表示されること、画像がブラウザでdecodeできることを確認した。幅390pxではsplit設定を保持したまま1カラムへフォールバックする。モーダルを閉じた後のfocusとscroll位置、choiceの自動答え合わせ、inputの見比べ表示もブラウザで確認した。

## 実装対象ファイル

- `app/src/main.js`: subject表示名「社会」
- `app/index.html`: main.jsのキャッシュバージョン
- `app/src/data/social/social_jhs1_ancient_europe_africa.json`: 社会教材データ
- `app/src/data/index.json`: 同期で生成されるsubjectとpath
- `app/src/data/social/assets/`: JSONから参照する34枚の資料画像
- `README.md` と本書: 利用・運用手順

画像表示と参照資料レイアウトの実装は、理科対応で追加した共通 `VisualRenderer` / `ProblemRenderer` を再利用する。
