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

## 現行教材と再生成版の更新

現行の `app/src/data/social/social_jhs1_ancient_europe_africa.json` は `_inputs/social2610_regenerated_bundle.zip` 内のJSONをそのまま配置する。清書版PDFを基準に再生成された教材をsource of truthとし、Codex側で問題文・正答・解説を補正しない。更新時はZIP内JSONとのバイト一致を確認する。

この版は14ページ、14個の親problem、208個の小問を含む。JSONの `visuals[].src` から42枚の異なるPNGを参照し、ZIPの `assets/` は合計46枚で構成される。JSONの `uncertain: true` は監査上の注意として保持し、教材内容や回答表示へ影響させない。`answer_audit.csv`、`manifest.json`、`contact_sheet.png`、生成物READMEは監査・確認用であり、本番アプリの読込対象に含めない。ZIP自体は `_inputs/` に保持する。

再生成版へ更新する際は、既存の `app/src/data/social/assets/` が今回ZIP以外の利用者作成ファイルを含まないことを確認したうえで、フォルダ内容をZIP内 `assets/` と完全一致させる。JSONから未参照の次の4画像も、指定されたZIP assets一式の一部として配置する。

- `p48_brexit_photo.png`
- `p4_great_wall.png`
- `p4_pyramid_sphinx.png`
- `p6_st_peter_basilica.png`

更新後はJSON内の全画像参照が存在すること、`assets/` のファイル集合がZIP内と一致すること、ID重複やresponse形式エラーがないことを確認する。`python3 app/src/data/sync_index.py` を実行し、`index.json` に同じdataset pathが1件だけ登録されていることも確認する。画像表示はHTTP経由で全42参照が成功し、複数資料を含むproblemで全画像がJSON順に通常・2カラム・モーダルへ表示されることを確認する。幅390pxではsplit設定を保持したまま1カラムへフォールバックし、モーダルを閉じた後もfocusとscroll位置を保つ。

## 実装対象ファイル

- `app/src/main.js`: subject表示名「社会」
- `app/index.html`: main.jsのキャッシュバージョン
- `app/src/data/social/social_jhs1_ancient_europe_africa.json`: 清書版再生成の社会教材データ（14ページ・208小問）
- `app/src/data/index.json`: 同期で生成されるsubjectとpath
- `app/src/data/social/assets/`: ZIPと一致する46枚の画像（JSON参照は42枚）
- `README.md` と本書: 利用・更新手順と教材版の記録

画像表示と参照資料レイアウトの実装は、理科対応で追加した共通 `VisualRenderer` / `ProblemRenderer` を再利用する。
