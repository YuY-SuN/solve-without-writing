# 理科教材の追加

## 目的と設計

理科教材を既存の共通教材ビューアで扱う。教科IDはJSON内の `meta.subject` ではなく、`app/src/data/science/` のような親フォルダ名で決まる。画面にはsubject IDに対応する「理科」を表示し、問題の表示・回答・答え合わせは教科専用処理を追加せず `response.type` に対応する既存UIで行う。

今回の教材は中学1年「光の反射・屈折」で、8ページ・20 problemを含む。response typeは `none` と `mode_switch`、mode_switch内は既存の `choice` と `blank` を使用する。選択式は既存の自動答え合わせ、入力式は既存の見比べ表示を使う。3つの実験・資料contextは改行を含むため、既存の本文表示と本文参照モードを利用できる。

## 利用者向け

上部の教科選択で「理科」を選び、教材選択で「中学1年 理科 光の反射・屈折（原本 p.92〜99）」を選ぶ。選択式／入力式の切替、答え合わせ、解説の確認は他教科と同じ操作。複数の小問を支える実験結果などのcontextがあるproblemでは、通常・2カラム・モーダルの本文表示を切り替えられる。

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

## 実装ファイル

- `app/src/main.js`: subject ID `science` の表示名「理科」
- `app/src/data/science/science_jhs1_light_reflection_refraction.json`: 教材データ
- `app/src/data/index.json`: 同期処理で作られるdataset一覧entry
- `README.md` と `docs/engineering-notes.md`: 教材追加・保守手順
