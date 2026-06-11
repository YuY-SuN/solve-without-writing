# benkyo-tool-prompt01

`benkyo-tool-promopt01.txt` の設計メモを、`problems.json` 駆動の静的Webツールとして実装したものです。

## 構成

```txt
tools/benkyo-tool-prompt01/
  app/
    index.html
    src/
      data/
        problems.json
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
      main.js
```

## 起動

`fetch()` を使うため、`file://` 直開きではなく静的サーバーで開いてください。

```bash
cd tools/benkyo-tool-prompt01/app
python3 -m http.server 4173
```

ブラウザで `http://127.0.0.1:4173` を開きます。
