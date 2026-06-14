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

上部の「問題セット」コンボボックスと「ページ」コンボボックスは `src/data/index.json` を起点に全 dataset を読み、ページを横断して選べるようにしています。最後に開いていた問題セットとページ選択は `localStorage` に保存されるため、再読み込みや次回起動後も同じページを開き直せます。保存済みのページが `index.json` や dataset 更新で消えていた場合は、その dataset 全体表示、さらに dataset 自体も無効なら `defaultDatasetId` へ自動で戻します。解答欄はテキスト入力、選択、表セル入力、素因数分解の階段図入力、作図入力に対応します。入力内容は `localStorage` に保存されるため、再読み込みやページの再訪問後も復元されます。さらに、表示中の回答や個別問題の回答をクリアでき、入力・削除・クリアの履歴は `ひとつもどる` / `ひとつすすむ` で 10 件まで前後できます。問題ごとには手動の `完了` フラグを持てますが、必要な入力がすべてそろっている場合だけ付けられます。各問題カードには「この問題の答えを表示」「この問題の解説を表示」ボタンもあり、必要な問題だけ個別に確認できます。ページ上部の「答えを表示」「解説を表示」を押した場合は、問題ごとの表示状態もその内容にそろいます。`完了` のチェック欄は各問題カードの下端にあり、答えや解説の確認後にそのまま操作できます。ページごとの `完了 x/y` と `残り z問` も画面上で確認できます。さらに、`記憶を書き出す` / `記憶を読み込む` で `localStorage` 上の回答、完了状態、Undo/Redo 履歴、最後に見ていたページを JSON ファイルとして退避・復元できます。新しい問題JSONを追加したら、`src/data/` で次を実行してください。

```bash
cd tools/benkyo-tool-prompt01/app/src/data
python3 sync_index.py
```

このツールは `data/` 配下の `index.json` 以外の `.json` を走査し、`index.json` を再生成します。既存の `label` と `defaultDatasetId` は、対応するファイルが残っている限り保持します。

問題データを修正するときは、問題文と `answer` だけでなく `explanation` も同じ規則で見直してください。特に `「aよりb大きい数」= a+b` と `「aよりb小さい数」= a-b` のように符号付きの量を文で扱う設問では、`b` が負数でも記号を読み飛ばさずに整合確認する運用にしています。


## 記憶データの入出力

画面上部の `記憶を書き出す` は、このツールが `localStorage` に保持している次の状態を 1 つの JSON ファイルへ保存します。

- 回答入力
- 問題ごとの完了フラグ
- Undo / Redo 履歴
- 最後に開いていた問題セットとページ

`記憶を読み込む` では、この JSON ファイルを選ぶと現在の記憶を置き換えて復元します。

形式を JSON にしている理由は、ブラウザ単体で追加ライブラリなしに安全に読めて、version やメタ情報も同じファイルに持たせやすいためです。


## 素因数分解の階段図

`math_workbook_pages_30_31.json` のように、素因数分解の階段図は `visual.type: "factorization_ladder"` と `response.type: "ladder_fill"` で扱います。あわせて、小問の中にさらに小問を持つ `items` の再帰構造も描画できるため、`p030_q02` のような 2 段以上の設問もそのまま表示できます。
