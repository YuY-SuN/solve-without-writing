# Engineering Notes

## Purpose

このドキュメントは、このリポジトリで今後の作業を進めるときに前提となる知識、技術的制約、設計方針、運用ルールをまとめたものです。

単発の機能説明は個別docに残し、横断的に効く知見はここに蓄積します。

## Repository overview

- リポジトリ全体の入口説明はルート `README.md` に置く
- 主な対象は `app/` を中心とした単一の静的Webアプリ
- 静的Webツールとして実装しており、サーバーサイドアプリは持たない
- 画面本体は `app/index.html`
- 読み込み制御は `app/src/main.js`
- 問題描画は `app/src/renderers/`
- 問題データは `app/src/data/`
- スタイルは `app/src/styles/page.css`

## Current architecture

### Static app

- ブラウザが `fetch()` で `src/data/*.json` を読む構成
- `file://` 直開きではなく、ローカル静的サーバー経由で開く必要がある
- 動作確認は通常 `python3 -m http.server 4173` を使う

### Dataset loading

- アプリは単一JSON固定ではなく、`src/data/index.json` を読んで問題セット一覧を構築する
- 上部ツールバーの「問題セット」コンボボックスから dataset 全体を切り替える
- 上部ツールバーの「ページ」コンボボックスから全 dataset を横断して特定ページへ直接切り替える
- 最後に開いていた dataset / page 選択は `localStorage` に保存し、次回起動時に復元する
- `localStorage` の回答・完了・履歴・閲覧位置は JSON ファイルへ export / import できる
- 保存済みページが消えていた場合は dataset 全体表示、dataset も無効なら `defaultDatasetId` にフォールバックする
- `index.json` の各要素は少なくとも `id` `label` `path` を持つ
- `defaultDatasetId` が初期表示セットになる
- ページ選択肢は dataset ごとの再構築ではなく、起動時に全 dataset を読んで横断生成する

### Dataset index sync

- `src/data/sync_index.py` が `data/` 配下のJSONから `index.json` を再生成する
- `index.json` 自身は走査対象外
- 既存 `label` は対応ファイルが残っている限り保持する
- 既存 `defaultDatasetId` は有効なら保持し、無効なら先頭 dataset に補正する
- 新規 dataset の `id` はファイル名ベースで生成する
- `meta.title` があれば新規 `label` 候補に使う

## Data model knowledge

### Problem top level

問題データは概ね次の構造で扱う。

```json
{
  "id": "...",
  "page": 8,
  "section": {
    "no": 5,
    "title": "...",
    "category": "..."
  },
  "prompt": {
    "text": "..."
  },
  "context": {
    "text": "..."
  },
  "items": [],
  "visuals": [],
  "response": {},
  "answer": {},
  "explanation": "..."
}
```

### Meaning of `context`

- `prompt.text` は問題文本体
- `context.text` は補足文、会話文、数列、前提条件など
- `context` は `prompt` の下に別ブロックとして表示する前提で扱う
- 将来は `item.context.text` も出る可能性があるので、描画側はトップレベルだけに固定しない

### Visuals

現在扱う描画タイプ:
- `table`
- `number_line`
- `geometry_2d`
- `geometry_3d`
- `graph_grid`
- `histogram`
- `net`
- `factorization_ladder`

図やグラフは Canvas、表は HTML table を基本にする。

### Response types

実データで既に登場している response type:
- `blank`
- `multi_blank`
- `free_text`
- `choice`
- `draw_graph`
- `draw_point`
- `table_fill`
- `ladder_fill`
- `none`

重要:
- `response.type: "none"` は「解答欄を出さない」が正しい
- `blank` `multi_blank` `free_text` は入力可能なフォーム部品として描画する
- 回答保持を跨ぎたい場合は `main.js` の状態に加えて `localStorage` 永続化を使う
- 回答クリアは問題単位または表示中単位で行えると使いやすい
- Undo/Redo は回答状態全体のスナップショットを最大10件持つ形にすると実装が安定する
- 閲覧位置も跨ぎたい場合は `selectedDatasetId` と `selectedPageKey` を `localStorage` に保存し、起動時に有効性を検証してから復元する
- バックアップや端末移行が必要な場合は、`localStorage` スナップショットを JSON で export / import する。TOML ではなく JSON を選ぶのは、静的ブラウザ環境で追加パーサなしに扱え、既存の状態構造をそのまま version 付きで持ち出せるため
- `response.type: "choice"` は選択肢の表示と選択操作が必要
- `response.type: "draw_graph"` は数直線やグラフ上で直接入力でき、完了判定では answer の件数と入力件数をそろえる
- `response.type: "draw_point"` は点ラベルごとの配置入力ができ、完了判定では answer 側キーがすべて入力されている必要がある
- `response.type: "table_fill"` は `response.targets` と表セルの `blank.key` を結び付けてセルへ直接入力する
- `response.type: "ladder_fill"` は `factorization_ladder` 内の空欄 key を `response.targets` で列挙し、階段図の入力欄へ直接結び付ける
- `items` は1段とは限らず、教材によっては小問の中にさらに `items` が入るので、描画・完了判定・回答クリアは再帰構造を前提にする

## Lessons learned from recent work

### 1. Data issue and renderer issue must be separated

過去に「答え・解説が出ない」事象があり、原因はレンダラではなくデータ側だった。

具体例:
- ヒストグラム問題 `p015_hist` に `answer` と `explanation` が存在しなかった
- 表示ロジックは値がある前提で動いていたため、ボタンを押しても何も出なかった

教訓:
- 不具合調査ではまずデータ欠落か描画欠落かを切り分ける
- `ProblemRenderer` の表示条件と JSON の定義を同時に確認する

### 2. `context` だけでなく response type も見る

`context` が表示されない件を再確認した際、根本は `context` 未描画だけでなく、`choice` や `none` が未対応で、画面全体として「何も出ていない」ように見えていた。

教訓:
- 新しいデータセットを入れるときは、`context` だけでなく `response.type` の実出現値も見る
- 一つの症状の背後に複数の未対応仕様がある前提で調べる

### 3. Commit単位で再現性を崩さない

`index.json` がある dataset を指しているなら、その dataset 実ファイルも同じコミットに含める必要がある。

教訓:
- `index.json` だけ更新して新しいデータファイルをコミットしない状態は避ける
- 参照と実体は同じコミット単位で揃える

### 4. Compare時は未コミット変更の扱いを明示する

`main` と比較する際に、未コミット変更を抱えたままブランチ切り替えすると、見た目上は `main` にいても素の `main` ではなくなる。

教訓:
- 比較前に、変更を commit するか stash するかを決める
- 「破棄」ではなく「退避」が必要な場合は `stash` を使う
- 退避対象は必要なファイルだけに絞る

### Completion progress

- 問題ごとの完了状態は `main.js` で `localStorage` 保存する
- 完了フラグの保存キーは `benkyo-tool-prompt01:completed-problems:v1`
- 完了は手動で付けるが、その前提として問題内の必要入力がすべて埋まっている必要がある
- `response` を持たない問題は最初から完了可能とみなす
- ページ進捗は dataset ごとに `完了数 / 総問題数 / 残り` を集計して表示する
- 転記モード POC は、現在の問題セットの全ページから `完了` 済みの問題だけを抽出し、`入力内容` または `解答` を印刷向け一覧として表示する
- 転記モードでは入れ子の小問を個別行として扱い、表・数直線・ヒストグラムなどの図表も該当する行ごとに再描画する

## Git workflow rules

- GitHub 接続や push は明示的な指示があるまで行わない
- 機能作業は原則としてローカルブランチで始める
- 不具合修正は `fix/...` ブランチ名を優先し、commit 確認後に同名の remote branch へ push する
- ローカルブランチで内容確認が取れ、ユーザーから問題ない判断が出たら、対応する remote branch も push する
- remote branch 名は、原則としてローカルブランチ名とそろえる
- merge はローカルで行う前提を維持し、基底ブランチへ反映する前に不要な未追跡ファイルを混ぜない
- このリポジトリでは基底ブランチを `main` として扱う
- タグ付けもローカルで行い、push は別指示まで行わない
- 無関係な未追跡ファイルはコミットに含めない
- ただし、機能に必要な新規 data file は `index.json` との整合のため一緒に含める

## Documentation rules

- 機能追加時は `docs/` を同じ変更セットで更新する
- 単機能の設計・実装メモは個別docに書く
- 横断的な知見、作業ルール、失敗しやすい点はこの `engineering-notes.md` に追記する
- `AGENTS.md` はドキュメント運用ルールの入口として保つ
- feature の実装が docs を伴っていないまま残っていたら、取り込み時に同じブランチで補填してから push する

## Dataset maintenance notes

- 問題データの修正では、`prompt` / `items[].text` と `answer` と `explanation` を同時に照合する
- `「aよりb大きい数」` は `a+b`、`「aよりb小さい数」` は `a-b` で確認し、`b` が負数でもそのまま式へ入れる
- 符号つき数量の設問は、問題文だけ直して説明文を直し忘れる事故が起きやすいので、同じ変更セットで両方更新する

## Verification constraints

- この環境では `node` が入っていないことがある
- その場合、JSの機械的な構文チェックはできない
- 代替として次を使う
  - JSONは `python3 -m json.tool`
  - 静的配信確認は `python3 -m http.server`
  - 配信内容確認は `curl`
- `apply_patch` が環境依存で失敗することがあったため、必要に応じて権限付きのファイル更新手段に切り替える

## Constraints specific to this workspace

- `workspace-write` 制約下なので、権限付き実行が必要になることがある
- サンドボックス起動失敗により、単純な読み取りコマンドでも権限昇格が必要だった
- そのため、状態確認やローカルGit操作でも `require_escalated` を使うケースがある

## Recommended checklist for future changes

1. 対象 dataset の実ファイルと `index.json` の整合を確認する
2. 新しい data shape があるなら `rg` で実出現値を洗う
3. `renderers/` の対応状況を確認する
4. JSON妥当性を確認する
5. 静的サーバーで配信確認する
6. `docs/` と必要ならこのファイルを更新する
7. 関連する data file を含めてコミットする

## Files to read first next time

次に着手する人は、まず次を読むと早い。

- `AGENTS.md`
- `docs/engineering-notes.md`
- `docs/app-root-layout.md`
- `docs/benkyo-tool-prompt01-dataset-selector.md`
- `docs/benkyo-tool-prompt01-completion-progress-plan.md`
- `app/src/main.js`
- `app/src/renderers/ProblemRenderer.js`
- `app/src/renderers/TextRenderer.js`
- `app/src/data/index.json`
