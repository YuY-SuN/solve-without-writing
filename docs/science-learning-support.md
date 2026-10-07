# 理科教材の追加

## 目的と設計

理科教材を既存の共通教材ビューアで扱う。教科IDはJSON内の `meta.subject` ではなく、`app/src/data/science/` のような親フォルダ名で決まる。画面にはsubject IDに対応する「理科」を表示し、問題の表示・回答・答え合わせは教科専用処理を追加せず `response.type` に対応する既存UIで行う。

今回の教材は中学1年「光の反射・屈折」で、8ページ・20 problemを含む。response typeは `none` と `mode_switch`、mode_switch内は既存の `choice` と `blank` を使用する。選択式は既存の自動答え合わせ、入力式は既存の見比べ表示を使う。実験結果のcontextと共有図版は、文章・画像を含む共通の参照資料表示を利用する。

## 利用者向け

上部の教科選択で「理科」を選び、教材選択で「中学1年 理科 光の反射・屈折（原本 p.92〜99）」を選ぶ。選択式／入力式の切替、答え合わせ、解説の確認は他教科と同じ操作。複数の小問が共有する文章や図版があるproblemでは、「通常」「2カラム」「モーダル」の参照資料表示を切り替えられる。2カラムでは資料を左側に置き、モーダルでは各小問の「参照資料を見る」から開く。

## データ追加・更新手順

1. 問題JSONを `app/src/data/science/` へ置く。
2. `app/src/data/` から `python3 sync_index.py` を実行する。
3. `index.json` に追加されたentryの `subject` が `science`、`path` が `science/<filename>.json` であることを確認する。
4. JSONファイルと更新された `index.json` を同じ変更セットに含める。

`sync_index.py` は `data/` 以下を再帰走査し、問題datasetの親ディレクトリ名をsubjectとして登録する。index.jsonや問題datasetの形ではない管理用JSONは対象外。JSON内の `meta.subject` は分類に使わない。同期処理の実行場所は `app/src/data/`、入力は同ディレクトリ以下の教材JSON、出力・副作用は `index.json` の更新である。

## データ上の補足

- `adaptedFrom` は元問題の形式と現行Web UI向けの変換を記録するメタデータ。現時点では表示・処理に使わず、そのまま保持する。
- `notes` も教材生成時の補足メタデータとして保持し、現時点ではUI表示を要求しない。
- 実験結果などの改行は共通の本文表示で保持する。理科用rendererやresponse typeは追加しない。
- `meta.subject: "science"` が教材に存在しても問題ないが、教科分類は配置フォルダで行う。

## 図版と画像visual

PDFから切り出した21枚のPNGを `app/src/data/science/assets/` に格納し、18 problemの `visuals` へ `type: "image"` で登録した。各problemで複数itemが共有する図はproblem直下へ置く。例えば:

```json
{
  "visuals": [
    {
      "type": "image",
      "src": "assets/p93_angles_abcd.png",
      "alt": "鏡、法線、入射光、反射光と角a〜dを示す図"
    }
  ]
}
```

`src` は現在読み込んでいるdataset JSONのURLを基準に解決する相対パス。`/src/...` のroot相対パスは使わない。`alt` は図の要素を説明し、答えは含めない。任意の `caption` には「実験結果」「PART 1」など中立的な説明を置く。画像を読み込めない場合は代替文を表示し、アプリ全体を停止させない。

対応したproblem IDは `sci_p092_exp`, `sci_p092_see`, `sci_p093_angle`, `sci_p093_draw`, `sci_p093_image`, `sci_p094_reflect`, `sci_p094_image`, `sci_p095_visible`, `sci_p095_mirror`, `sci_p096_exp`, `sci_p097_coin`, `sci_p097_lens`, `sci_p097_total`, `sci_p098_normal`, `sci_p098_refract`, `sci_p099_path`, `sci_p099_apparent`, `sci_p099_total`。

`p94_point_summary.png` と `p98_point_summary.png` は答えや原理を示すまとめ図なので、回答前に見える教材visualには使わない。ZIP内の `manifest.json`、`README.md`、`contact_sheet.png` も表示用assetsへコピーしない。作図問題は図を参照できるようにするが、自由描画UIは追加せず、既存の選択・入力形式を維持する。

新しい画像教材を追加するときは、PNGを該当subjectの `assets/` に置き、JSONの `visuals[].src` から参照する。dataset追加時は通常の `python3 sync_index.py` でindexを更新する。GitHub Pages workflowは既存どおり `app/` 全体をartifactにするため、`app/src/data/science/assets/` も公開対象になる。

## 実装ファイル

- `app/src/main.js`: subject ID `science` の表示名「理科」
- `app/src/renderers/VisualRenderer.js`: image visualの描画、dataset相対URL、読み込み失敗時の代替表示
- `app/src/renderers/ProblemRenderer.js`: 画像を含むproblemの参照資料レイアウトとdefault/split/modal表示
- `app/src/styles/page.css`: レスポンシブ画像と参照資料レイアウト
- `app/src/data/science/science_jhs1_light_reflection_refraction.json`: 教材データ
- `app/src/data/science/assets/`: 問題表示に使うPNG図版
- `app/src/data/index.json`: 同期処理で作られるdataset一覧entry
- `README.md` と `docs/engineering-notes.md`: 教材追加・保守手順
