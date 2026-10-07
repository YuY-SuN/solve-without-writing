# 管理モード

## 目的

スマートフォンで行った学習状況をPC側で再現し、既存の転記・印刷を使うときに、通常の回答操作を問題ごとにやり直さずに正答と完了状態を反映します。新しい学習モードや保存形式は追加しません。

## 利用者の操作

1. PCの通常画面で、入力欄にフォーカスしていない状態から `manage` とキー入力します。細いポインター・hover対応・幅900px以上を満たさない環境では起動しません。
2. パスワード `hogepiyo123` を入力して開始します。文字入力欄がフォーカス中、別モーダル表示中、転記モード中は隠しコマンドを受け付けません。
3. 問題の `完了` を押すと、教材の正答を通常回答と同じ形式で一時反映して完了にします。既存の途中回答・誤答も一時状態では正答に置き換えます。
4. `管理モード終了` を押すと、管理モード開始前の回答・完了・履歴へ戻ります。ページ再読み込みでも開始前の永続データを読み直し、管理中の変更を破棄します。

管理モード中は入力がそろっていない問題も完了できます。`戻る` と `進む` は無効になり、管理中の回答変更はUndo/Redo履歴へ追加されません。完了を解除しても回答は管理モード中は残り、終了時にまとめて破棄されます。

## 設計と保存

モード状態は `main.js` のメモリ変数だけに置きます。開始時に回答値・答え合わせ状態・完了状態・Undo/Redo履歴・画面選択等をdeep copyし、既存stateを使うRendererや転記処理をそのまま利用します。管理中は共通の `persistJson` をno-opにし、エクスポート/インポートも無効化します。終了時には退避したstateを戻してから通常モードへ戻るため、その後の通常保存へ管理中の値が混入しません。ページ更新時もメモリ上の変更は消え、開始前にlocalStorageへ保存されていた値を読み直します。

完了時に各problem/itemのresponse descriptorを再帰走査し、`solved-answer.js` が教材解答を通常の回答入力値へ変換して一時stateへ反映します。転記・印刷・dataset/page切替は既存処理を利用します。管理モードの回答、完了、履歴をlocalStorageやエクスポートファイルへ保存しません。

`mode_switch` は教材の `defaultMode` を優先し、そのmodeの解答を `{ mode, values }` に格納します。blank/free_textは入力欄の文字列形式にし、分数等は教材の `answer.display` を優先します。複数欄、選択肢、語順、表・階段、点・グラフ操作は通常Rendererが使うanswer valueを流用します。数直線の `draw_graph` で教材が `{ points: [...] }` を使う場合は、Rendererが通常保存する数値配列へ変換します。`isResponseComplete` もこの教材形式を認識し、通常回答でも完了できるようにしています。

## 対応形式と制約

現行データのresponse typeを確認し、次を扱います。

- `choice`, `word_order`, `blank`, `multi_blank`, `free_text`, `mode_switch`
- `table_fill`, `ladder_fill`, `draw_point`, `draw_graph`
- `none` は回答を作らず、元の入力不要仕様を維持
- これらの回答は、表、数直線、グラフ、histogram等の既存visualと同じanswer valueを共有します。

データ監査ではresponseが `free_text` でanswer.valueもanswer.displayもないitemが10件ありました。教材に解答例が定義されていないため、そのitemには回答値を投入できませんが、管理モードの完了操作は可能です。該当問題で回答も必要な場合は、運用者が教材JSONにanswer.valueまたはanswer.displayを追加してください。

## 保守者の更新手順と実装対象

- `app/src/main.js`: PC判定、隠しコマンド、パスワードUI、メモリstate退避・復元、永続化停止、完了時の一時回答反映、Undo/Redo停止
- `app/src/solved-answer.js`: 教材解答から通常回答stateへの変換
- `app/index.html`, `app/src/styles/page.css`: パスワードモーダル
- `README.md`, `docs/engineering-notes.md`: 利用・保守情報

## 回帰テスト

`tests/management-mode.html` は、ブラウザ上で既存回答をseedし、管理完了中のlocalStorage不変、転記・印刷対象、終了時のstate/履歴復元、終了後の通常保存への混入防止、F5時の一時状態破棄を確認します。Node等の追加依存はありません。

リポジトリルートで静的サーバーを起動し、専用の一時Chrome profileからテストページを開きます。

```bash
python3 -m http.server 4174
google-chrome --headless --no-sandbox --disable-gpu --user-data-dir=/tmp/benkyo-management-test-profile --virtual-time-budget=12000 --dump-dom http://127.0.0.1:4174/tests/management-mode.html
```

テストページはアプリと同じoriginのlocalStorageへ既存回答・履歴をseedし、結果を `PASS` / `FAIL` で表示します。専用profileを使い、普段のブラウザデータをテストに使わないでください。副作用はそのprofile内のアプリlocalStorageだけです。

新しいresponse.typeを追加するときは、まず通常Rendererが保存する値の形と `isResponseComplete` の判定を確認し、`solved-answer.js` に同じ値を生成する処理を追加してください。管理用の回答キーや形式を追加しないでください。

この機能は `/app` の静的アプリ内で実行します。入力は現在のproblem/itemのresponseとanswer、出力は既存回答値・完了フラグと同じ形のメモリ内一時stateです。外部通信や永続ストレージへの書き込みは行いません。終了ボタンまたはページ更新で一時stateを破棄し、localStorageは開始前の内容のまま保ちます。
