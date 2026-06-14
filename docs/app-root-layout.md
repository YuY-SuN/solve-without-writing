# App Root Layout

## Summary

単一アプリを継続拡張する前提に合わせて、アプリ本体を `tools/benkyo-tool-prompt01/app/` からリポジトリ直下の `app/` へ移した。

## What This Solves

- 実行物の入口を `app/` に一本化し、単一アプリ運用の前提をディレクトリ構成へ反映する
- `tools/benkyo-tool-prompt01/` という複数ツール前提の中間階層をなくし、起動・保守・ドキュメント上のパスを短くする
- ルート `README.md` を唯一の利用者向け入口として扱いやすくする

## Design

- 実行物は root 直下の `app/` に集約する
- 設計と運用メモは従来どおり `docs/` に残す
- 補助資料や生成用プロンプトは `misc/` に残す
- アプリ内部の相対 import と `fetch('./src/data/...')` はそのまま使い、`app/` 配下の内部構造は維持する

最終構成の意図:

```txt
<project_root>/
  app/
    index.html
    src/
      data/
      renderers/
      styles/
  docs/
  misc/
  README.md
  AGENTS.md
```

## Implementation Notes

更新対象:
- `app/`
- `README.md`
- `AGENTS.md`
- `docs/engineering-notes.md`
- `docs/benkyo-tool-prompt01-dataset-selector.md`

実装上の要点:
- `git mv` で `app/` を root へ移し、履歴上は rename として追える状態を保つ
- 旧 `tools/benkyo-tool-prompt01/README.md` は削除し、案内内容をルート `README.md` へ統合する
- `docs/` と `AGENTS.md` の旧パス参照を `app/...` 基準へ更新する
- ブランチ運用メモに残っていた `master` 前提の記述は、現状に合わせて `main` 前提へ更新する

## Operation

### Run the app

```bash
cd app
python3 -m http.server 4173
```

### Update dataset index

```bash
cd app/src/data
python3 sync_index.py
```

### When updating docs after future changes

- `app/` 配下の変更では、ルート `README.md` と関連する `docs/` を同じ変更セットで更新する
- パスを文書へ書くときは `app/...` 基準で記載する
- 単一アプリ前提を崩す変更を入れる場合は、この文書と `docs/engineering-notes.md` の両方を見直す
