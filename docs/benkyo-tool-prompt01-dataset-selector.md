# benkyo-tool-prompt01 Dataset Selector and Index Sync

## Summary

`tools/benkyo-tool-prompt01` に、`data/` 配下の複数問題セットを切り替えて表示する機能を追加した。

あわせて、`src/data/index.json` を手作業で保守しなくてよいように、`data/` 配下のJSONを走査して `index.json` を再生成する独立ツール `sync_index.py` を追加した。

## Goal

従来は `src/data/problems.json` 固定で1つの問題セットしか読めなかった。
この状態だと、問題セットを追加するたびにアプリ本体と `index.json` の両方を手で更新する必要がある。

今回の変更の目的は次の2点。

1. UI上で問題セットを選択できること
2. `data/` 配下のJSON追加を `index.json` 再生成ツールで追従できること

## Design

### 1. Dataset manifest

静的Webではブラウザからディレクトリ一覧を安定して列挙できないため、読み込み対象は `src/data/index.json` に集約する。

`index.json` の役割:
- デフォルト問題セットの指定
- UIに表示するラベルの定義
- 実ファイル名のマッピング

形式:

```json
{
  "defaultDatasetId": "core-math",
  "datasets": [
    {
      "id": "core-math",
      "label": "標準セット",
      "path": "problems.json"
    }
  ]
}
```

### 2. UI behavior

画面上部ツールバーに「問題セット」コンボボックスを置く。

処理の流れ:
1. `main.js` が `src/data/index.json` を読む
2. `datasets` 配列でコンボボックスを構築する
3. 選択された `path` のJSONを読み込む
4. 読み込んだデータからページフィルタを再構築する
5. 問題カードを再描画する

### 3. Index sync tool

`src/data/sync_index.py` は `data/` 配下の `.json` を走査し、`index.json` を再生成する。

設計方針:
- `index.json` 自身は走査対象から除外する
- 既存 `index.json` にある `label` は、同じ `path` が残っていれば保持する
- 既存 `defaultDatasetId` も、有効な `id` が残っていれば保持する
- 新規JSONはファイル名から `id` を生成する
- `meta.title` があれば新規ラベル候補に使う

## Implementation

### Added or updated files

- `AGENT.md`
- `docs/benkyo-tool-prompt01-dataset-selector.md`
- `tools/benkyo-tool-prompt01/app/index.html`
- `tools/benkyo-tool-prompt01/app/src/main.js`
- `tools/benkyo-tool-prompt01/app/src/styles/page.css`
- `tools/benkyo-tool-prompt01/app/src/data/index.json`
- `tools/benkyo-tool-prompt01/app/src/data/geometry-focus.json`
- `tools/benkyo-tool-prompt01/app/src/data/sync_index.py`
- `tools/benkyo-tool-prompt01/README.md`

### Main.js responsibilities

`main.js` は次を担当する。

- データセット一覧の読み込み
- 問題セット選択コンボボックスの構築
- 選択された問題セットJSONの読み込み
- ページフィルタの再構築
- 既存の答え表示・解説表示・問題描画の再利用

### sync_index.py responsibilities

`sync_index.py` は次を担当する。

- `data/` 配下の `*.json` 走査
- `index.json` の再生成
- `path` 単位での既存 `label` 維持
- `defaultDatasetId` の維持または自動補正

## Operation

### Add a new dataset

1. `tools/benkyo-tool-prompt01/app/src/data/` に新しい問題JSONを置く
2. 次を実行する

```bash
cd tools/benkyo-tool-prompt01/app/src/data
python3 sync_index.py
```

3. 必要なら `index.json` 上で `label` や `defaultDatasetId` を調整する
4. 静的サーバー上でコンボボックスに追加されたことを確認する

### Notes

- `sync_index.py` は `data/` 配下のすべてのJSONを候補として扱うため、問題セットではないJSONを置く場合は配置ルールを別途決める必要がある。
- 現状は `meta.title` を表示名候補にしているため、問題JSONには `meta.title` を入れておく方がよい。

## Future maintenance rule

今後もこのリポジトリでは、機能追加ごとに `docs/` 配下の該当Markdownを同じ変更セットで更新する。
特に、データ形式・UI操作・運用ツールを増やしたときは、利用方法と保守方法の両方を記録する。
