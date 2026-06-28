# 式の過程入力プラン

## 何を解決する機能か

問題の最終解答だけでなく、素因数分解、分配法則、通分、約分などの途中過程を、ただの自由記述ではなく「どこを見るか」を導く UI として入力できるようにする。

この機能は、学習者が知っている式変形を書き写すための箱ではなく、式の見方を反復させるための補助欄である。未入力でも従来どおり完了できるが、使う場合は「何に注目するか」「次に何をするか」を段階的に考えられるようにする。

## 設計方針

- 最終解答の `response` とは分けて、問題または小問に `work` を追加する。
- `work` は自由記録型と導き型に分ける。
- 導き型では、式を全文自由入力させる前に、観察対象や操作の選択を先に促す。
- 途中式は必須ではないため、完了判定には含めない。
- 保存データは `responseValues` と分けて `workValues` に保持する。
- 将来、素因数分解の階段図、約分専用、同類項整理専用などへ拡張できるようにする。

## 現在の work type

### 1. `expression_steps`

汎用の自由記録型。式を1行ずつ並べて書く。

用途:
- まだ導き型 UI を用意していない問題
- 学習者の自由な書き方を残したい問題

### 2. `distribution_guide`

分配法則向けの導き型。先に「どの数が両方にかかるか」「まとまりの中の2つの項は何か」を見つけさせる。

用途:
- `(a+b)×c` を `a×c+b×c` にばらす問題
- `a×c+b×c` を共通因数でまとめる問題への将来拡張の土台

### 3. `fraction_common_denominator_guide`

通分向けの導き型。先に「どの分母にそろえるか」「それぞれ何倍するか」を考えさせる。

用途:
- 分母の異なる分数の加法・減法
- 将来の約分専用 UI への橋渡し

## データ仕様

### `expression_steps`

```json
{
  "work": {
    "type": "expression_steps",
    "optional": true,
    "label": "考え方・途中式",
    "defaultOpen": true,
    "starter": {
      "expression": "1/2 + 1/3"
    },
    "suggestedNotes": ["通分", "分子を計算", "約分"]
  }
}
```

### `distribution_guide`

```json
{
  "work": {
    "type": "distribution_guide",
    "optional": true,
    "label": "分配の見方ガイド",
    "defaultOpen": true,
    "description": "先に『どの数が両方にかかるか』を見つけてから、ばらした式を書きます。",
    "starter": {
      "expression": "(100-1)×(-12)"
    },
    "prompts": {
      "sharedFactor": "両方に同じようにかかる数",
      "firstTerm": "まとまりの1つ目",
      "secondTerm": "まとまりの2つ目",
      "rewrittenExpression": "ばらしたあとの式",
      "result": "計算結果"
    },
    "placeholders": {
      "sharedFactor": "例: (-12)",
      "rewrittenExpression": "例: 100×(-12)-1×(-12)"
    }
  }
}
```

### `fraction_common_denominator_guide`

```json
{
  "work": {
    "type": "fraction_common_denominator_guide",
    "optional": true,
    "label": "通分の見方ガイド",
    "defaultOpen": true,
    "description": "先に分母をそろえる先を決めてから、それぞれ何倍するかを考えます。",
    "starter": {
      "expression": "（-2/9）＋（-5/6）"
    },
    "leftLabel": "-2/9",
    "rightLabel": "-5/6",
    "prompts": {
      "commonDenominator": "分母をいくつにそろえる？",
      "leftMultiplier": "-2/9 は何倍する？",
      "rightMultiplier": "-5/6 は何倍する？",
      "leftConverted": "-2/9 を通分した形",
      "rightConverted": "-5/6 を通分した形",
      "sumExpression": "通分後のたし算",
      "result": "計算結果"
    }
  }
}
```

## 保存仕様

保存値は `workValues` に保持する。型ごとに持つキーは違うが、いずれも `responseValues` とは分離する。

例: `distribution_guide`

```json
{
  "operation": "expand",
  "sharedFactor": "(-12)",
  "firstTerm": "100",
  "secondTerm": "-1",
  "rewrittenExpression": "100×(-12)-1×(-12)",
  "result": "-1188",
  "note": "外側の数に注目した"
}
```

例: `fraction_common_denominator_guide`

```json
{
  "commonDenominator": "18",
  "leftMultiplier": "2",
  "rightMultiplier": "3",
  "leftConverted": "-4/18",
  "rightConverted": "-15/18",
  "sumExpression": "-4/18 + -15/18",
  "result": "-19/18",
  "note": "先に 18 を目標にした"
}
```

## UI仕様

- 問題文・図表の後、最終解答欄の前に `work` を表示する。
- `expression_steps` は従来どおり、式を1行ずつ記録する。
- `distribution_guide` は「見方の選択」「どこを配るか」「ばらした後の形」の順に分ける。
- `fraction_common_denominator_guide` は「共通分母を決める」「何倍するか」「通分後の式と結果」の順に分ける。
- 各ガイド型には短い誘導文、入力ラベル、ヒント文、プレビュー文を置く。
- 完全自動採点ではなく、まずは考える順番を固定することを優先する。

## 実装上の要点と更新対象ファイル

- `app/src/renderers/WorkRenderer.js`
  - `expression_steps` を維持しつつ、`distribution_guide` と `fraction_common_denominator_guide` を追加する。
- `app/src/renderers/ProblemRenderer.js`
  - 問題本体と小問の `work` を検出し、解答欄の前に描画する。
- `app/src/main.js`
  - `workValues` の状態、localStorage保存、記憶データ export / import、クリア処理を継続利用する。
- `app/src/styles/page.css`
  - ガイドカード、誘導文、プレビュー文のスタイルを追加する。
- `app/src/data/math_textbook_page_26_27.json`
  - `p026_q02_01` を `distribution_guide` に切り替える。
- `app/src/data/math_textbook_pages_12_13.json`
  - `p013_q03_03` を `fraction_common_denominator_guide` に切り替える。
- `README.md`
  - 利用者向け操作と `work` type の使い分けを追記する。
- `docs/engineering-notes.md`
  - 横断仕様として、新しい work type の位置付けを追記する。

## 利用者向け操作手順

1. 問題カードに `work` 欄が表示されている場合、必要に応じて開く。
2. 導き型では、いきなり全文を書かず、まず観察や操作の欄から埋める。
3. その後、言いかえた式や通分後の式を書く。
4. 最終解答欄には従来どおり答えを書く。

途中式欄は任意なので、空欄のままでも完了判定には影響しない。

## 保守者向けデータ更新手順

1. 途中式を自由記録させたいなら `expression_steps` を使う。
2. 分配法則の見方を誘導したいなら `distribution_guide` を使う。
3. 通分の見方を誘導したいなら `fraction_common_denominator_guide` を使う。
4. `description` `prompts` `hints` `placeholders` を問題の狙いに合わせて書く。
5. 問題JSONを更新したら、必要に応じて `app/src/data/sync_index.py` を実行する。
6. UIまたはデータ仕様を変えた場合は、README と関連 docs を同じ変更セットで更新する。

## 今回の試験導入

- `p026_q02_01`: `distribution_guide`
- `p013_q03_03`: `fraction_common_denominator_guide`

まずは 2 問だけで、自由記録型より「次に何を見るか」が伝わるかを確認する。

## 将来拡張

- `factorization_steps`: 素因数分解の階段図形式の過程入力
- `like_terms_guide`: 同類項をまとめる専用ガイド
- `distribution_guide` の「共通因数でまとめる」分岐追加
- 軽い妥当性チェックや、入力途中の補助コメント表示
- 転記モードで「入力内容＋途中式」を印刷できる表示

## ブランチ運用メモ

この実装は `feature/expression-work-input` ブランチで行い、main へはこの作業内でマージしない。
