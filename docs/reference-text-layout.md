# 本文参照型problemの表示モード

## 目的

長い本文・資料を参照しながら複数の設問を解くときの画面往復を減らす。国語に限定せず、英語長文、理科・社会の資料、数学の文章題など、共通のproblem構造を使う教材で利用する。

回答UIは従来どおり `response.type` で描画する。本文レイアウトの切替は問題回答・答え合わせのstateと分けて管理し、モード変更で入力値、完了状態、表示中の答え合わせ結果を変更しない。

## 対象problemの条件

次のどちらかを満たし、problemに `context.text` があるものを対象とする。

- `layout.referenceText` が `true`（将来の明示指定用。現時点で教材JSONに追加する必要はない）
- `context.text` が既存の長文判定（180文字以上、または改行を2個以上含む）に合い、problem以下にresponseを持つノードが2個以上ある

response数は入れ子の `items` も再帰的に数える。短い補足context、一問一答、contextやitemsがない問題にはモード切替を表示しない。subject名は判定に使わない。

## 利用者の操作

対象problemの「本文表示」に、次のボタンを表示する。

| モード | 表示 |
|---|---|
| `default` | 本文・資料を設問の前に置く従来型の縦並び |
| `split` | 本文を左、設問を右に配置。広い画面では本文ペインをstickyにし、本文が画面高を超える場合は本文ペイン内でスクロール |
| `modal` | 本文を通常位置に置かず、各設問の「本文を見る」からdialogを開く |

初期値は `default`。選択したモードは全教科共通で保存し、次に表示する対象problemにも適用する。

split設定で画面幅が900px以下になると、CSSだけで縦並びにする。保存値と選択中ボタンは `split` のままなので、画面幅が戻ると2カラムに戻る。

default / splitの「本文を見る」は本文へスクロールする。modalでは同じ操作でモーダルを開く。本文DOMは一つだけ作り、モードに応じて本文ペインかdialogへ移す。どのモードでも段落・空行・詩・引用の改行を保持する。

## モーダルの挙動

- ネイティブ `<dialog>.showModal()` を使い、背景をモーダル中は操作できなくする
- モーダル本文領域は最大高を設け、長文時は本文側だけをスクロールできる
- `aria-modal` とタイトル参照を設定し、開いたら閉じるボタンへfocusする。ネイティブdialogのfocus containmentを利用する
- 閉じるボタンまたはEscapeで閉じ、開いた小問の「本文を見る」へfocusを戻す
- 開いた時のページscroll座標を記録し、閉じた後に復元する。bodyの背景スクロールも一時停止する
- EscapeのkeydownがIME composition中ならモーダルを閉じない

モード切替自体はmainの通常描画を行うが、回答値と `checkedResponses` はmain stateに残したまま描画する。scroll位置も切替前の座標へ戻し、選択したモードボタンへfocusを戻す。

## 印刷と画面幅

印刷時は表示モードにかかわらず本文と設問を縦方向に印刷できる。modal設定時に本文はdialog配下へ移っているため、印刷CSSでdialog本文を通常フローとして表示する。

2カラムとsticky本文は広い画面だけで使う。狭い画面では本文を先に置き、その後に設問を並べる。モード設定は変更しない。

## 実装ファイルと保守

- `app/src/renderers/ProblemRenderer.js`: 対象判定、モード切替UI、split layout、dialog、本文DOMの配置、設問からの本文参照
- `app/src/main.js`: `readingViewMode` の読み書き、layout切替時のscroll・focus復元
- `app/src/styles/page.css`: 2カラム、sticky、狭幅フォールバック、dialog、印刷時の本文表示
- `app/index.html`: CSS/module cache version
- `README.md`, `docs/engineering-notes.md`, `docs/japanese-learning-support.md`: 利用者・保守者向け説明

新しい教科・教材を追加するだけならsubject固有のコードは不要。既存判定に合わない本文参照型problemだけ、必要になった時点で `layout.referenceText: true` を設定する。mode値は `default` / `split` / `modal` のみを保存する。

## 検証項目

- 長文contextと複数response itemを持つproblemでは3モードを表示し、短い/単独問題では表示しない
- splitの本文paneは広い画面でsticky・独立scrollし、900px以下では1カラムに戻る
- modalは一つの本文DOMを利用し、改行を保持して本文領域内でscrollする
- dialogを閉じたら起動元ボタンへfocusし、元のページscroll位置へ戻る
- モード切替前後でresponse値、完了状態、checked stateを保持する
- modal設定でも印刷に本文と設問が含まれる
- 同じ機能を英語・数学などsubjectに依存しないproblem構造で利用できる
