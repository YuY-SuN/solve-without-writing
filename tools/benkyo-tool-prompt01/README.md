# benkyo-tool-prompt01

`benkyo-tool-promopt01.txt` の設計メモを、`problems.json` 駆動の静的Webツールとして実装したものです。

## 構成

```txt
tools/benkyo-tool-prompt01/
  app/
    index.html
    src/
      main.js
      data/
        index.json
        problems.json
        geometry-focus.json
        sync_index.py
      renderers/
        ProblemRenderer.js
        TextRenderer.js
        VisualRenderer.js
        TableRenderer.js
        NumberLineRenderer.js
        Geometry2DRenderer.js
        Geometry3DRenderer.js
        GraphRenderer.js
        HistogramRenderer.js
        NetRenderer.js
      styles/
        page.css
```

## 起動

`fetch()` を使うため、`file://` 直開きではなく静的サーバーで開いてください。

```bash
cd tools/benkyo-tool-prompt01/app
python3 -m http.server 4173
```

ブラウザで `http://127.0.0.1:4173` を開きます。

## データ追加

上部の「問題セット」コンボボックスと「ページ」コンボボックスは `src/data/index.json` を起点に全 dataset を読み、ページを横断して選べるようにしています。解答欄はテキスト入力でき、選択問題はその場でチェックやラジオ選択ができます。入力内容は `localStorage` に保存されるため、再読み込みやページの再訪問後も復元されます。新しい問題JSONを追加したら、`src/data/` で次を実行してください。

```bash
cd tools/benkyo-tool-prompt01/app/src/data
python3 sync_index.py
```

このツールは `data/` 配下の `index.json` 以外の `.json` を走査し、`index.json` を再生成します。既存の `label` と `defaultDatasetId` は、対応するファイルが残っている限り保持します。
