# mintao-benkyo-tool-memo.d

中学生向けの算数・数学教材を、静的Webツールとして再現していくための作業リポジトリです。現在の主対象は `tools/benkyo-tool-prompt01/` で、問題JSONを読み込んで、回答入力、答え・解説表示、進捗管理、記憶データの入出力を行う教材ビューアを育てています。

## 主な場所

- `tools/benkyo-tool-prompt01/`: 実際のWebツール本体
- `tools/benkyo-tool-prompt01/app/`: ブラウザで配信する静的アプリ
- `tools/benkyo-tool-prompt01/app/src/data/`: 問題データと `index.json`
- `docs/`: 機能追加ごとの設計・運用メモ
- `misc/GPTs-prompts/`: データ生成や変換に使うプロンプト置き場

## まず読むもの

- `AGENTS.md`: このリポジトリでのドキュメント運用ルール
- `docs/engineering-notes.md`: 横断的な設計方針、運用ルール、検証上の注意
- `tools/benkyo-tool-prompt01/README.md`: ツールの起動方法、操作概要、データ運用

## 起動

```bash
cd tools/benkyo-tool-prompt01/app
python3 -m http.server 4173
```

ブラウザで `http://127.0.0.1:4173` を開きます。Windows では `python3` の代わりに `py` や `python` を使って構いません。

## 補足

- `file://` 直開きでは `fetch()` が使えないため、静的サーバー経由で開く前提です。
- 仕様変更や機能追加をしたら、同じ変更セットで `docs/` と関連 `README.md` を更新する運用です。
- ルート以外の詳しい説明は、各ツール配下の `README.md` に寄せています。
