# Non-table Input Plan

## Purpose

このメモは、`table_fill` 以外の入力系UIを今後どう実装するかを整理したものです。
対象は主に `draw_point` と `draw_graph` で、既存のテキスト入力や選択入力を壊さずに段階導入する前提です。

## UX principles

- ユーザーが入力した内容を正答で上書きしない
- `答えを表示` は入力欄の置き換えではなく、別表示として扱う
- 既存の `localStorage` 永続化を流用する
- 既存の `ひとつもどる` `ひとつすすむ` を流用する
- 既存の `この問題をクリア` `表示中をクリア` を流用する
- マウスだけでなく、タッチ操作でも成立するUIにする

## Current data shapes seen in this repo

実データ上、未入力対応の主対象は次です。

- `draw_point` + `number_line`
- `draw_graph` + `number_line`
- `draw_graph` + `graph_grid` + `answerVisuals.histogram`

現時点では、`draw_point` / `draw_graph` が `geometry_2d` や `net` に対して使われている例は見当たりません。
そのため、最初の実装対象は数直線とグラフ系に限定するのが妥当です。

## Recommended rollout

### Phase 1: `draw_point` on `number_line`

最初に着手すべきなのはこれです。
理由は、操作モデルが単純で、既存データにも1件以上あり、UI仕様も決めやすいからです。

想定UI:

- 数直線をクリックまたはタップすると点を置く
- 既存ラベルがある場合は、未配置ラベルを順に消費する
- 置いた点を再クリックすると選択状態にする
- 選択状態の点はドラッグで移動できる
- 削除は `Delete` キーまたは小さな削除ボタンで行う

保存形式の案:

```json
{
  "D": 6
}
```

または複数点前提で次のようにする。

```json
{
  "points": {
    "D": 6
  }
}
```

このリポジトリでは既存の `answer.value` がラベルキーを持つ場合があるため、最初はラベルキーの map 形式が扱いやすい。

### Phase 2: `draw_graph` on `number_line`

これは実質的には「ラベルなし複数点配置」です。
`draw_point` と見た目は似ていますが、点名よりも値集合の入力が主になります。

想定UI:

- 数直線クリックで点を追加
- 追加済み点はドラッグで移動
- 近い点を再クリックで削除候補表示
- 重複値を許すかどうかは dataset ごとに決める

保存形式の案:

```json
[
  4,
  -4,
  -1.5,
  6.5
]
```

実データの `answer.value` も配列なので、ここは answer shape に寄せる方が比較しやすい。
ただし内部状態ではソート済み配列に正規化した方が Undo/Redo と比較が安定する。

### Phase 3: `draw_graph` on `graph_grid` for histogram-style input

ヒストグラム問題は、自由描画よりも「各階級の高さ入力」として扱う方が堅いです。
Canvas 上にフリーハンドで描かせる必要はありません。

想定UI:

- 各 bin の上端ハンドルを上下ドラッグして高さを決める
- クリック位置から最も近い整数 tick に吸着する
- 棒の幅は固定し、高さだけ編集可能にする

保存形式の案:

```json
{
  "bins": [1, 3, 5, 0, 1]
}
```

これは既存の `answer.value.bins` と同形なので、そのまま扱える。

### Phase 4: generic `draw_graph` on `graph_grid`

将来的に、折れ線、点列、直線、座標プロットを扱う可能性があります。
ただし現データにはまだ具体例が薄いので、先に共通仕様を固定しすぎない方がよいです。

必要になった時点で次のいずれかに分ける。

- 点列入力
- 線分入力
- 直線入力
- 棒グラフ入力

`draw_graph` ひとつに全部押し込むのではなく、必要なら将来 `response.mode` のような補助属性を追加する方が保守しやすい。

## Rendering architecture proposal

### Keep answer rendering separate

`showAnswers` 時も、入力用 canvas / SVG / DOM はそのまま残し、答えは別ブロックまたは別オーバーレイに出す。
ユーザー入力モデルと答え表示モデルを共有しないこと。

### Add interactive overlays instead of replacing base visuals

`number_line` や `graph_grid` 本体の描画ロジックは維持し、その上に入力用レイヤーを追加する。

方針:

- ベース図: 既存 renderer が描く
- 入力レイヤー: response に応じて重ねる
- 答えレイヤー: `showAnswers` の時だけ重ねる

この分離にすると、表示と入力の責務が混ざりにくい。

### Reuse `responseValues`

既存の `responseValues[responseKey]` をそのまま使う。
入力形式ごとの値 shape だけ追加で定義する。

想定 shape:

- `draw_point` on `number_line`: `{ "D": 6 }`
- `draw_graph` on `number_line`: `[4, -4, -1.5, 6.5]`
- `draw_graph` histogram mode: `{ "bins": [1, 3, 5, 0, 1] }`

これで `localStorage`、Undo/Redo、クリアは既存実装をほぼ流用できる。

## Required code changes

主な修正先は次です。

- `app/src/renderers/NumberLineRenderer.js`
- `app/src/renderers/GraphRenderer.js`
- `app/src/renderers/ProblemRenderer.js`
- `app/src/renderers/VisualRenderer.js`
- `app/src/renderers/TextRenderer.js`
- 必要なら `app/src/styles/page.css`

大枠:

1. `VisualRenderer` が response 情報を各 visual renderer に渡せるようにする
2. 各 renderer に「表示専用」と「入力付き」の両モードを持たせる
3. `onChange` を通して `responseValues` を更新する
4. 答え表示は `answerVisuals` か `answer.value` をもとに別描画する

## Validation checklist

各 phase ごとに次を確認する。

- 入力できる
- `答えを表示` しても入力が消えない
- `答えを表示` しても入力が答えで上書きされない
- ページ再読み込み後も復元される
- `ひとつもどる` `ひとつすすむ` が効く
- 問題クリア / 表示中クリアが効く
- マウスとタッチで最低限操作できる

## Risks and open questions

- 数直線の分数や小数をどの粒度に吸着させるか
- 同一点への重複配置を許すか
- 点ラベルの割当順を固定するか、ユーザー選択にするか
- histogram 以外の `graph_grid` 問題に共通仕様を先に作るか
- 将来の `geometry_2d` / `net` 入力を同じ仕組みで扱うか、別系統にするか

## Recommendation

実装順は次が妥当です。

1. `draw_point` on `number_line`
2. `draw_graph` on `number_line`
3. histogram-style `draw_graph` on `graph_grid`
4. その後に必要な graph / geometry 系を個別追加

この順なら、今あるデータを早く実用化でき、かつ既存の入力保存基盤も再利用しやすい。
