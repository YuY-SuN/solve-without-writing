# guided_steps（操作式）

`guided_steps` は、式変形・文章題・基礎計算をJSONで定義した状態遷移として一手ずつ進める共通responseです。利用者が一度に判断する内容を小さくし、スマートフォンでも現在の式と選択肢に集中できるようにします。アプリは数学を計算したり途中式を生成したりせず、教材JSONに書かれた表示・選択肢・正誤・遷移を再生します。

## 利用者の操作

`mode_switch` に `guided` があれば、回答欄に「操作式」「選択式」「入力式」を表示します。`defaultMode: "guided"` の場合は操作式から始まります。guidedがない既存問題では選択式・入力式など、JSONにあるmodeだけを表示します。操作式では誤答時に同じstepへ留まり、JSONの `feedback` を案内として表示します。正答すると指定された次のstepへ進み、「ひとつ戻る」「最初から」で進行をやり直せます。

finishに到達するまでは最終結果を表示しません。finishでは最終表示と任意のsummaryを示し、通常のanswer・explanationがあれば「解説を見る」に入れます。操作式では問題の答え合わせボタンを出しません。既存の問題モーダルは通常どおり利用でき、モーダルを開閉しても回答stateを変更しません。

## JSON構造

`guided_steps` は `mode_switch.modes.guided` に置けます。`steps` は配列ではなくstep IDからstep定義へのmapです。各correct choiceには次のstep IDか `finish` を指定します。1 step内に複数のcorrect choiceを置き、それぞれ異なる正答ルートへ分岐できます。

```json
{
  "response": {
    "type": "mode_switch",
    "defaultMode": "guided",
    "modes": {
      "guided": {
        "type": "guided_steps",
        "start": "subtract",
        "steps": {
          "subtract": {
          "display": "3x + 9 = 15",
          "prompt": "次に何をする？",
          "progress": { "current": 1, "total": 3 },
            "interaction": {
              "type": "choice",
              "shuffle": false,
              "choices": [
                {
                  "key": "subtract-9",
                  "text": "両辺から9を引く",
                  "correct": true,
                  "next": "divide"
                },
                {
                  "key": "add-9",
                  "text": "両辺に9を足す",
                  "correct": false,
                  "feedback": "+9をなくす逆の操作を考えよう。"
                }
              ]
            }
          },
          "divide": {
            "display": "3x = 6",
            "prompt": "xを1個分にするには？",
            "progress": { "current": 2, "total": 3 },
            "interaction": {
              "type": "choice",
              "choices": [
                {
                  "key": "divide-3",
                  "text": "両辺を3で割る",
                  "correct": true,
                  "next": "calculate"
                }
              ]
            }
          },
          "calculate": {
            "display": "x = 6 ÷ 3",
            "prompt": "6 ÷ 3 は？",
            "progress": { "current": 3, "total": 3 },
            "interaction": {
              "type": "choice",
              "choices": [
                { "key": "one", "text": "1", "correct": false },
                { "key": "two", "text": "2", "correct": true, "next": "finish" }
              ]
            }
          }
        },
        "finish": {
          "display": "x = 2",
          "summary": "最後に6を3つに分けました。"
        }
      },
      "choice": { "type": "choice", "choices": [] },
      "input": { "type": "blank" }
    }
  }
}
```

フィールドの要点:

- `type`: guided responseは `guided_steps`、選択interactionは `choice`。複数項を選ばせる場合は `multi_select` も使えます。
- `start`: 最初のstep ID。
- `steps`: step IDごとの定義。`display` は現在の式・状態、`prompt` は今考える問いです。
- `progress`: 任意の `{current,total}`。分岐があっても教材側で進行表示を指定できます。省略時はstep番号を表示します。
- `interaction.choices`: `key` はstep内で一意、`text` はボタン表示、`correct` は正誤の明示値です。correctは複数指定できます。
- `feedback`: 誤答時に同じstepで表示する短いヒントです。未指定時は共通案内になります。
- `next`: correct choiceが進むstep IDまたは `finish`。複数のcorrect choiceで別々のnextを指定すると正答ルートを分岐できます。
- `shuffle`: 任意の真偽値。trueなら初回表示順を回答stateに保存し、その試行中は順序を保ちます。
- `finish.display`: 完了時の最終表示。`summary` は任意の短いまとめです。

`multi_select` は複数ボタンを切り替えて選び、「選んだ項を確認」で採点します。`correct: true` の全keyと選択集合が一致したとき正答になります。同じstepのcorrect choiceは同じ `next` を指定してください。数学的にどこまで細分化するかは教材JSON作成者が決め、rendererは計算・分解・数式判定をしません。

## 保存と完了

回答値は既存の `benkyo-tool-prompt01:response-values:v1` に他modeと一緒に保存されます。mode_switchは `{ "mode": "guided", "values": { "guided": { ... } } }` の形で、step、履歴、選択、正誤結果、shuffle順、完了フラグを保持します。ページ再読込後に同じstepから再開できます。選択式・入力式の値はmodeごとに分かれて保持されます。

管理モード中は既存の共通storage制御によりlocalStorageへの書き込みを止めます。管理モードの正答反映では、guidedグラフのcorrect edgeをたどってfinish状態を作ります。問題完了の通常条件では、現在選択中のguidedがfinishへ到達したとき入力済みになります。

## 検証と更新手順

現在の数学2610 p.43〜79教材（`app/src/data/math/math_jhs1_p43_p79.json`）では、p.43〜47の一部小問に操作式を収録しています。p.48〜79は従来の教材内容を維持しています。p.43〜47すべての小問にguidedがあるわけではなく、guidedを持たない問題ではJSONに定義された他の回答modeだけを表示します。

起動時のresponse validationは次を確認し、不正なdatasetを読み込み対象から外します。

- `start` が存在する。
- 各stepに `display`、`prompt`、対応interaction、選択肢がある。
- choice key重複がなく、`correct` はbooleanで、各stepに1つ以上のcorrect choiceがある。
- correct choiceの `next` がstepまたはfinishを指し、startからcorrect edgeでfinishへ到達できる。
- multi_selectのcorrect choiceは同じnextを指す。

到達不能stepとcorrect edgeのcycleは読み込みを止めず、console warningとして出します。複数ルートに対応し、一本道を前提とした検証はしません。

guidedを含む既存教材の更新では、同じ教材のJSONを既存のファイル名へ置き換えます。別名のJSONを追加するとindexに重複登録される可能性があります。新しいguided教材を追加するときは、教科folder内の問題JSONでresponseを定義し、各小さい計算と数学的判断をstepに分けます。JSONの問題文、選択肢、正答、feedback、遷移は教材作成側で確認してください。配置後は `app/src/data/` で `python3 sync_index.py` を実行してindexを更新し、次のfixtureページを開いて操作確認します。

```text
tests/guided-steps.html
tests/fixtures/guided-steps.json
```

fixtureは本番教材indexへ登録しません。rendererとJSON構造の変更時は、fixtureにある方程式・同類項・分配法則・比例式を含めて確認してください。testページは本番の数学JSONも読み、p.43〜47のguided itemをアプリで描画し、p.43のmode切替とp.45問題モーダル内の画像を確認します。

## 実装ファイル

- `app/src/renderers/GuidedStepsRenderer.js`: state遷移、誤答案内、back/restart、完了表示。
- `app/src/renderers/TextRenderer.js`: `guided_steps` とmode switchの共通描画。
- `app/src/renderers/ProblemRenderer.js`: 完了状態とguided中の答え合わせUI制御、問題モーダルとの共存。guidedのshuffle順を初回描画で保存するcallbackがresponse unit初期化前に発生しても安全に処理します。
- `app/src/main.js`: 回答保存、完了判定、読み込み時warning、管理モード用answer反映、転記表示。
- `app/src/response-validation.js`: 構造エラーと非致命warning。
- `app/src/response-checking.js`, `app/src/solved-answer.js`: 既存答え合わせ・管理モードとの共通接続。
- `app/src/styles/page.css`: 小画面でも押しやすい操作ボタンと状態表示。
