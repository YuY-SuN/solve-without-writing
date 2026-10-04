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

- ブラウザが `fetch()` で `src/data/<subject>/*.json` を読む構成
- `file://` 直開きではなく、ローカル静的サーバー経由で開く必要がある
- 動作確認は通常 `python3 -m http.server 4173` を使う
- GitHub Pages では repository root ではなく `app/` を公開rootとして扱う。`.github/workflows/pages.yml` の Pages artifact path は `./app` に固定し、`./src/...` の相対参照を維持する
- Pages workflow は `main` への push と手動実行で起動し、commit 済みの `app/` をそのまま artifact 化する。`sync_index.py` は自動実行せず、教材JSONを追加・移動・削除した場合は従来どおり手元で同期して `index.json` を commit する
- 初回のPages利用時は repository Settings → Pages → Build and deployment → Source を GitHub Actions に設定する。公開URLは Pages 設定または成功した deploy job から確認する

### Dataset loading

- アプリは単一JSON固定ではなく、`src/data/index.json` を読んで問題セット一覧を構築する
- 上部ツールバーで「教科 → 問題セット → ページ」の順に選ぶ
- 教科はindexのsubject、問題セットはその教科内、ページは選択中dataset内で絞り込む
- 最後に開いていた dataset / page 選択は `localStorage` に保存し、次回起動時に復元する
- `localStorage` の回答・完了・履歴・閲覧位置は JSON ファイルへ export / import できる
- 保存済みページが消えていた場合は dataset 全体表示、dataset も無効なら `defaultDatasetId` にフォールバックする
- `index.json` の各要素は少なくとも `id` `label` `subject` `path` を持つ
- 教科IDは問題JSONの親フォルダ名。問題JSONの `meta.subject` は分類に使わない
- 表示名は `main.js` の `SUBJECT_LABELS` 対応表で管理し、未知のsubjectはIDをそのまま表示する
- `index.json` の `path` は `src/data/` からの相対パス（例 `english/lesson.json`）
- `defaultDatasetId` が初期表示セットになる
- ページ選択肢は選択中datasetのページだけを表示する

### Dataset index sync

- `src/data/sync_index.py` が `data/` 以下を再帰走査して `index.json` を再生成する
- `index.json` と、トップレベルに `meta` オブジェクトと `pages` 配列を持たない管理用JSONはdataset対象外
- 問題JSONは `data/<subject>/...json` に置く。subjectにはそのファイルの親ディレクトリ名を使う
- 既存 `label` は対応ファイルが残っている限り保持する
- 既存 `defaultDatasetId` は有効なら保持し、無効なら先頭 dataset に補正する
- 新規 dataset の `id` はファイル名ベースで生成する。既存datasetは同じファイル名の登録情報を引き継ぎ、移動後の相対pathへ更新する
- `meta.title` があれば新規 `label` 候補に使う
- `subject` はファイルの親ディレクトリ名からindexへ出力する

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
- 長文または複数改行を含む `context.text` は「本文・資料」パネルとして表示し、各小問から本文へ戻るリンクを付ける
- prompt、context、item textは `white-space: pre-wrap` 相当で改行を維持する。本文パネルは行間と幅を制限して可読性を保つ
- 長文contextと複数response nodeを持つproblemでは、subjectに関係なく本文表示を `default` / `split` / `modal` で切り替えられる
- `readingViewMode` は `benkyo-tool-prompt01:reading-view-mode:v1` に教科共通設定として保存する。初期値は `default`。未知値はdefaultへ戻す
- splitは幅900px以下でCSS上1カラムにするが、保存値はsplitのまま維持する
- mode切替でProblemRenderer全体を再描画するため、回答・完了・checked stateを保持する既存main stateを利用し、ページscrollとmodeボタンfocusを復元する
- modal本文はdialog内の共有本文node一つを表示する。ネイティブdialogで背景を操作不能にし、本文内scroll、Escape、close時のfocusとscroll復元を行う
- 印刷時に本文が閉じたdialog内へ隠れないよう、print CSSでdialog本文を通常フローへ出す

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
- `word_order`
- `mode_switch`

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
- `response.type: "multi_blank"` に後から field を足す場合は、既存 `localStorage` の回答オブジェクトを削除せず、不足 field だけ `answer.value` で補完する。既存キーの上書きや field 順ずれは起こさない
- `items` は1段とは限らず、教材によっては小問の中にさらに `items` が入るので、描画・完了判定・回答クリアは再帰構造を前提にする
- 教科固有の分岐を問題全体のrendererへ広げず、回答操作は `response.type` ごとの共通rendererとして追加する
- `choice.shuffle` の順序はrendererのdataset内responseオブジェクト単位でキャッシュし、DOM再描画中に変わらないようにする。再読み込み後は新しい順序になりうる
- `choice.showKeys: false` は選択肢keyの表示だけを抑制する。省略時は既存どおりkeyを表示する
- `mode_switch` の保存値は `{ mode, values: { [mode]: answerValue } }`。完了判定は選択中modeのresponseへ委譲する
- `mode_switch` のmode内にある `multi_blank` の欄追加では、既存のmode別回答を保持し、不足キーだけ `answer.modes[mode].value` で補完する
- `word_order` の回答値はtoken keyの配列。すべてのtokenを選ぶと入力済みとなり、答え合わせ操作では正答配列と順序込みで比較する
- 答え合わせはresponseを持つ最小problem/item単位に置く。choice / word_order と mode_switch.choice は自動判定し、文字入力系は正誤色を付けずに回答・解答例・解説を並べて表示する
- 子itemにresponseがある場合、親problem/itemの共通explanationを引き継いで小問のフィードバック内に表示する
- 判定結果は `main.js` の一時的なUI状態に保持し、回答値が変わったキーの状態だけ無効化する。localStorageや記憶データexportには含めない
- 問題全体の旧答え・解説トグルは撤去した。`response.type: "none"` 等で子responseがなく答えデータを持つノードは、そのノード内の「答え・解説を見る」で参照できる
- テキスト入力は`input`イベントで保存する。IME composition中は中間値を確定せず、`compositionend`で最終値を保存する。アプリ内keydown処理では`event.isComposing` / keyCode 229を無視する
- 起動時にresponse形式を検証し、読み込みに失敗したdatasetは一覧から除外して他datasetの利用を継続する
- 英語教材の詳細仕様とサンプルは `docs/english-learning-support.md` を参照する
- 国語教材の長文・改行・IME対応は `docs/japanese-learning-support.md` を参照する
- 本文参照型problemの3レイアウトと保存仕様は `docs/reference-text-layout.md` を参照する

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
- ページ進捗は dataset ごとに集計し、現在はページセレクトのラベルに完了数を表示する。ツールバー下の進捗カード一覧はページ数の多い教材で画面を圧迫するため一時非表示
- 転記モード POC は、現在の問題セットの全ページから `完了` 済みの問題だけを抽出し、`入力内容` または `解答` を印刷向け一覧として表示する
- 転記モードでは入れ子の小問を個別行として扱い、表・数直線・ヒストグラムなどの図表も該当する行ごとに再描画する
- `p014_q01` のように既存設問へ計算結果欄を追加する更新では、保存済み `sign` / `value` を維持したまま、新設 `result` だけ答えデータから補完して回収する

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
- GitHub Pages 対応のデプロイは `.github/workflows/pages.yml` が `main` に push されたときに行う。ページ公開物は `app/` のみ

## Documentation rules

- 機能追加時は `docs/` を同じ変更セットで更新する
- 単機能の設計・実装メモは個別docに書く
- 横断的な知見、作業ルール、失敗しやすい点はこの `engineering-notes.md` に追記する
- `AGENTS.md` はドキュメント運用ルールの入口として保つ
- feature の実装が docs を伴っていないまま残っていたら、取り込み時に同じブランチで補填してから push する

## Dataset maintenance notes

- 問題データの修正では、`prompt` / `items[].text` と `answer` と `explanation` を同時に照合する
- `choice` 問題で `key` を持たせた場合は、画面にもその `key` が見えるようにする。ア・イ・ウの表記を本文だけに埋め込まず、選択肢ラベルとして扱う
- 行見出しつきの `table` は、列見出し側にも空の先頭セルを置いて、1行目だけ左へずれるデータを作らない
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
