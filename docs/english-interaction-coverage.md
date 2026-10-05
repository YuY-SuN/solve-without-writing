# 英語interaction coverage

対象ファイル: `english_lesson3_3_chatgpt.json`、`english_workbook_p32_p69.json`。response.type が none のsection/problem行を除く全 432 item を1行ずつ記録。

## 集計

- interaction定義あり: 53
- word_order途中フィードバック: 54
- 従来形式を維持: 326
- 静的catalog定義数: 59

| 分類 | 件数 |
|---|---:|
| ambiguous_multiple_answers | 1 |
| conversation | 7 |
| expand | 1 |
| fixed_expression | 19 |
| free_composition | 5 |
| interaction_adds_no_value | 114 |
| reading_comprehension | 26 |
| repair | 13 |
| role_change | 5 |
| short_form_check | 46 |
| transform | 27 |
| vocabulary | 115 |
| word_order | 54 |

## item別判定

`answer`・`explanation`・`context`・選択肢/distractor情報を含む全項目は同名JSON reportに保存しています。以下はレビュー用の要約です。

| itemId | page | section | 元response | 問題要約 | status / interaction | 理由 |
|---|---:|---|---|---|---|---|
| eng_lesson3_3_p32_a1_01 | 32 | A 基本を確認する！ | choice | ( ___ / ___ ) is she?　彼女はだれですか。 | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_lesson3_3_p32_a1_02 | 32 | A 基本を確認する！ | choice | That is Takeshi. He is my friend. I like ( her / him ). | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_lesson3_3_p32_a1_03 | 32 | A 基本を確認する！ | choice | She is Ms. White. Do you know ( her / him )? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_lesson3_3_p32_a2_01 | 32 | A 基本を確認する！ | mode_switch | こちらはだれですか。　___ is ___ ? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_lesson3_3_p32_a2_02 | 32 | A 基本を確認する！ | mode_switch | 彼は私の友達です。　___ is my ___ . | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_lesson3_3_p33_a3_01 | 33 | A-3 | word_order | あちらはだれですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_lesson3_3_p33_vocab_01 | 33 | 必ず覚えたい語句 | mode_switch | character | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_lesson3_3_p33_vocab_02 | 33 | 必ず覚えたい語句 | mode_switch | 考え、アイデア | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_lesson3_3_p33_vocab_03 | 33 | 必ず覚えたい語句 | mode_switch | 芸術について知っている　___ about art | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_lesson3_3_p33_vocab_04 | 33 | 必ず覚えたい語句 | mode_switch | 私は買い物が大好きだ。　I like shopping ___. | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_lesson3_3_p33_b1_01 | 33 | B 伝える練習をする！ | word_order | 私は彼女が大好きです。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_lesson3_3_p33_b1_02 | 33 | B 伝える練習をする！ | word_order | あなたのお気に入りの歌手はだれですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_lesson3_3_p33_b2_01 | 33 | B 自己表現 | mode_switch | This is Ken. Do you ___ ___ ? | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_lesson3_3_p33_b2_02 | 33 | B 自己表現 | mode_switch | ___ ___ very ___ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_lesson3_3_p33_b2_03 | 33 | B 自己表現 | mode_switch | I ___ ___ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_lesson3_3_p33_b3_01 | 33 | B CAN-DO 自己表現 | mode_switch | 好きなキャラクターを1人選び、「こちらは…です。私は彼［彼女］が好きです」と紹介しよう。 | kept_original | 複数の自然な表現があり、固定goalへ操作で誘導しない。 |
| eng_lesson3_3_p33_b3_02 | 33 | B CAN-DO 自己表現 | mode_switch | 別のキャラクターをもう1人選び、「こちらは…です。あなたは彼［彼女］を知っていますか」と Ann にたずねよう。 | kept_original | 複数の自然な表現があり、固定goalへ操作で誘導しない。 |
| eng_p32_a1_1 | 32 | A-1 基本を確認する | choice | ( Who / Who’s ) is she? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p32_a1_2 | 32 | A-1 基本を確認する | choice | That is Takeshi. He is my friend. I like ( her / him ). | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p32_a1_3 | 32 | A-1 基本を確認する | choice | She is Ms. White. Do you know ( her / him )? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p32_a2_1 | 32 | A-2 日本文にあう英文 | mode_switch | こちらはだれですか。 ________ is ________ ? | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p32_a2_2 | 32 | A-2 日本文にあう英文 | mode_switch | 彼は私の友達です。 ________ is my ________ . | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p32_a3_1 | 32 | A-3 並べかえ | word_order | あちらはだれですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p33_vocab_1 | 33 | 必ず覚えたい語句 | mode_switch | character［名］ | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p33_vocab_2 | 33 | 必ず覚えたい語句 | mode_switch | 考え、アイデア［名］ | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p33_vocab_3 | 33 | 必ず覚えたい語句 | mode_switch | 芸術について知っている ________ about art | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p33_vocab_4 | 33 | 必ず覚えたい語句 | mode_switch | 私は買い物が大好きだ。 I like shopping ________ ________ . | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p33_b1_1 | 33 | B-1 並べかえ | word_order | 私は彼女が大好きです。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p33_b1_2 | 33 | B-1 並べかえ | word_order | あなたのお気に入りの歌手はだれですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p33_b2_1 | 33 | B-2 自己表現 | mode_switch | This is Ken. Do you ________ ________ ? | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p33_b2_2 | 33 | B-2 自己表現 | mode_switch | 「彼はとても親切です」 ________ ________ very ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p33_b2_3 | 33 | B-2 自己表現 | mode_switch | 「私は彼が好きです」 I ________ ________ . | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p33_b3_1 | 33 | B-3 CAN-DO 自己表現 | mode_switch | 好きなキャラクターを1人選び、「こちらは…です。私は彼［彼女］が好きです」と紹介しよう。 | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p33_b3_2 | 33 | B-3 CAN-DO 自己表現 | mode_switch | 別のキャラクターを1人選び、「こちらは…です。あなたは彼［彼女］を知っていますか」とたずねよう。 | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p34_1_1 | 34 | 1 語を選ぶ | choice | Do you know Ms. White? — I don’t know ( him / her ). | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p34_1_2 | 34 | 1 語を選ぶ | choice | ( What / Who ) is this? — It’s a park. | interactive / conversation | 相手の発話・場面から意図を決め、会話が成立する発話へ進める。 |
| eng_p34_1_3 | 34 | 1 語を選ぶ | choice | ( What / Who ) is that? — That is my friend. | interactive / conversation | 相手の発話・場面から意図を決め、会話が成立する発話へ進める。 |
| eng_p34_2_1 | 34 | 2 文を作る | mode_switch | I am in the music club. 主語を he にかえる → He ________ in the music club. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p34_2_2 | 34 | 2 文を作る | mode_switch | This is Ms. Brown. 疑問文に → ________ Ms. Brown? | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p34_2_3 | 34 | 2 文を作る | mode_switch | That is a fox. “a fox” をたずねる文に → ________ that? | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p34_3_1 | 34 | 3 連語を確認する | mode_switch | 私は遊園地が大好きです。 I like amusement parks ________ ________ . | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p34_3_2 | 34 | 3 連語を確認する | mode_switch | メアリーは少し一輪車に乗ることができます。 Mary can ride a unicycle ________ ________ . | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p34_4_1 | 34 | 4 並べかえる | word_order | 彼女はあなたのおばですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p34_4_2 | 34 | 4 並べかえる | word_order | 彼女はサッカーのファンではありません。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p34_4_3 | 34 | 4 並べかえる | word_order | Is that your pen? — No. 続く文を作ろう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p35_5_1 | 35 | 5 場面にあわせて文を書く | mode_switch | ① 女性を指して “She is Maria.” と答える会話。相手への質問を書こう。 | interactive / conversation | 相手の発話・場面から意図を決め、会話が成立する発話へ進める。 |
| eng_p35_5_2 | 35 | 5 場面にあわせて文を書く | mode_switch | ② 犬を連れた相手が “Yes, it is.” と答える会話。犬についてたずねる文を書こう。 | interactive / conversation | 相手の発話・場面から意図を決め、会話が成立する発話へ進める。 |
| eng_p35_6_1 | 35 | 6 英文を読む | mode_switch | 下線部 “It’s new.” の It がさすものを日本語で答えよう。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p35_6_2 | 35 | 6 英文を読む | mode_switch | バスケットボール部に入っているのはだれですか。英語で答えよう。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p35_6_3 | 35 | 6 英文を読む | choice | マークはユウマを（知っていた / 知らなかった）。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p35_6_4 | 35 | 6 英文を読む | mode_switch | ユウマとはだれですか。日本語で答えよう。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p35_6_5 | 35 | 6 英文を読む | word_order | マークが見た順に絵を並べよう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p36_1_1 | 36 | 1 基本のドリル | mode_switch | 私は鈴木香奈です。 ________ am Suzuki Kana. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_2 | 36 | 1 基本のドリル | mode_switch | ぼくの名前は佐藤健です。 ________ name ________ Sato Takeshi. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_3 | 36 | 1 基本のドリル | mode_switch | 私は12歳です。 I’m ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_4 | 36 | 1 基本のドリル | mode_switch | 私は長野出身です。 ________ ________ Nagano. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_5 | 36 | 1 基本のドリル | mode_switch | 私は音楽部に入っています。 I’m ________ the music ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_6 | 36 | 1 基本のドリル | mode_switch | 私は音楽が好きです。 I ________ music. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_7 | 36 | 1 基本のドリル | mode_switch | 私は毎日日本語を勉強します。 I ________ ________ every day. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_8 | 36 | 1 基本のドリル | mode_switch | 私は数学が得意です。 I’m ________ ________ math. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_9 | 36 | 1 基本のドリル | mode_switch | 私は理科が好きではありません。 I ________ like science. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_10 | 36 | 1 基本のドリル | mode_switch | 私は夕食後に宿題をします。 I do my homework ________ dinner. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_11 | 36 | 1 基本のドリル | mode_switch | 私は上手にテニスをすることができます。 I ________ play tennis well. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_12 | 36 | 1 基本のドリル | mode_switch | 私は放課後にバスケットボールを練習します。 I ________ basketball after ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_13 | 36 | 1 基本のドリル | mode_switch | 私はサッカーファンです。 ________ ________ a soccer ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_14 | 36 | 1 基本のドリル | mode_switch | 私は毎週日曜日にテニスのレッスンを受けます。 I ________ tennis lessons ________ Sundays. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_15 | 36 | 1 基本のドリル | mode_switch | 私は音楽が大好きです。 I ________ music. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_16 | 36 | 1 基本のドリル | mode_switch | 私はピアノを弾きます。 I play ________ ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_17 | 36 | 1 基本のドリル | mode_switch | 私はギターを弾くことができません。 I ________ ________ the guitar. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_18 | 36 | 1 基本のドリル | mode_switch | これは私のお気に入りの曲です。 This is my ________ song. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_19 | 36 | 1 基本のドリル | mode_switch | 私はイヌを飼っています。 I ________ a dog. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_20 | 36 | 1 基本のドリル | mode_switch | 私はネコを２匹飼っています。 I have ________ ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p36_1_21 | 36 | 1 基本のドリル | mode_switch | 私のペットはかわいいです。 My pet is ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p37_2_1 | 37 | 2 日本語でリフレーズ | mode_switch | イヌが好き。→「私はイヌが好き」 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p37_2_2 | 37 | 2 日本語でリフレーズ | mode_switch | バスケットボールが上手にできます。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p37_2_3 | 37 | 2 日本語でリフレーズ | mode_switch | 小林美穂です。→「私の名前は…です」 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p37_2_4 | 37 | 2 日本語でリフレーズ | mode_switch | 毎日サッカーを練習します。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p37_2_5 | 37 | 2 日本語でリフレーズ | mode_switch | 日曜日には読書します。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p37_2_6 | 37 | 2 日本語でリフレーズ | mode_switch | 数学が嫌いです。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p37_2_7 | 37 | 2 日本語でリフレーズ | mode_switch | 泳ぎが苦手です。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p38_1_1 | 38 | 1 単語チェック | mode_switch | 話す | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_1_2 | 38 | 1 単語チェック | mode_switch | かど、曲がりかど | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_1_3 | 38 | 1 単語チェック | mode_switch | まっすぐに | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_1_4 | 38 | 1 単語チェック | mode_switch | 通り、街路 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_1_5 | 38 | 1 単語チェック | mode_switch | 感謝する | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_1_6 | 38 | 1 単語チェック | mode_switch | （おとなの）男性 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_1_7 | 38 | 1 単語チェック | mode_switch | それから、次に | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_1_8 | 38 | 1 単語チェック | mode_switch | 向きを変える、曲がる | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_1_9 | 38 | 1 単語チェック | mode_switch | 左へ、左 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_1_10 | 38 | 1 単語チェック | mode_switch | どこに、どこで | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p38_2_1 | 38 | 2 重要表現 | mode_switch | すみません。 ________ ________ . | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p38_2_2 | 38 | 2 重要表現 | mode_switch | 駅へはどのようにして行けますか。 How can I ________ ________ the station? | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p38_3_1 | 38 | 3 会話練習 | choice | Yamato Park への案内：Turn right at the first corner. の次に続く文。 | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p38_3_2 | 38 | 3 会話練習 | choice | Sakura Restaurant への案内：Go straight on this street. の次に続く文。 | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p39_1 | 39 | 読解のコツ① | choice | トムと美香が弾く楽器の組み合わせとして正しいものを選ぼう。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p39_2 | 39 | 読解のコツ① | mode_switch | 美香はどんな種類の本が好きですか。日本語で答えよう。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p39_3 | 39 | 読解のコツ① | choice | トムが読まないと言っているものはどれ？ | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p39_4 | 39 | 読解のコツ① | mode_switch | “How many comic books do you have?” に、あなた自身の答えを英語で書こう。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p40_a1_1 | 40 | A-1 過去形を選ぶ | choice | I ( go / went ) to the museum last month. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p40_a1_2 | 40 | A-1 過去形を選ぶ | choice | I ( enjoy / enjoyed ) playing soccer. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p40_a1_3 | 40 | A-1 過去形を選ぶ | choice | I ( ate / eat ) a hamburger with my friends. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p40_a2_1 | 40 | A-2 日本文にあう英文 | mode_switch | 私はこの前の土曜日に公園へ行きました。 I ________ to the park last Saturday. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p40_a2_2 | 40 | A-2 日本文にあう英文 | mode_switch | 私は北海道で花を見ました。 I ________ flowers in Hokkaido. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p40_a3_1 | 40 | A-3 語を適する形に | mode_switch | I ________ many beautiful fish last May. (see) | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p40_a3_2 | 40 | A-3 語を適する形に | mode_switch | I ________ hiking last summer. (enjoy) | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p41_v_1 | 41 | 必ず覚えたい語句 | mode_switch | 動物 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p41_v_2 | 41 | 必ず覚えたい語句 | mode_switch | この前の | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p41_v_3 | 41 | 必ず覚えたい語句 | mode_switch | 少ない | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p41_v_4 | 41 | 必ず覚えたい語句 | mode_switch | 景色、ながめ | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p41_v_5 | 41 | 必ず覚えたい語句 | mode_switch | 年、1年（間） | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p41_v_6 | 41 | 必ず覚えたい語句 | mode_switch | 頂上 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p41_v_7 | 41 | 必ず覚えたい語句 | mode_switch | 昼食にそばを食べる eat soba ________ lunch | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p41_b1_1 | 41 | B-1 並べかえ | word_order | この前の春、私は動物園でパンダを見ました。（固定の続き: last spring.） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p41_b1_2 | 41 | B-1 並べかえ | word_order | この前の夏、私は川で魚釣りを楽しみました。（固定の続き: last summer.） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p41_b2_1 | 41 | B-2 自己表現 | mode_switch | I eat two apples. → 私はリンゴを2こ食べました。 | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p41_b2_2 | 41 | B-2 自己表現 | mode_switch | I see pictures in the museum. → 私は美術館で絵を見ました。 | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p41_b3_1 | 41 | B-3 CAN-DO 自己表現 | mode_switch | メモを参考に「私は先週末…しました」という英文をできるだけ多く書こう。 | kept_original | 複数の自然な表現があり、固定goalへ操作で誘導しない。 |
| eng_p42_a1_1 | 42 | A-1 基本を確認する | choice | I ( get / want ) to go to Australia. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p42_a1_2 | 42 | A-1 基本を確認する | choice | ( What / Where ) do you want to go? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p42_a1_3 | 42 | A-1 基本を確認する | choice | I want ( play / to play ) soccer. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p42_a2_1 | 42 | A-2 日本文にあう英文 | mode_switch | 私はあなたと歌いたいです。 I ________ ________ sing with you. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p42_a2_2 | 42 | A-2 日本文にあう英文 | mode_switch | 私は友達に会いたいです。 I ________ to ________ my friend. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p42_a3_1 | 42 | A-3 並べかえ | word_order | 私はアメリカ合衆国に行きたいです。（固定の続き: to the U.S.A.） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p42_a3_2 | 42 | A-3 並べかえ | word_order | あなたはどこでテニスを練習したいですか。（固定の続き: practice tennis?） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p43_v_1 | 43 | 必ず覚えたい語句 | mode_switch | 赤ちゃん | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p43_v_2 | 43 | 必ず覚えたい語句 | mode_switch | いとこ | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p43_v_3 | 43 | 必ず覚えたい語句 | mode_switch | …したい | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p43_v_4 | 43 | 必ず覚えたい語句 | mode_switch | 岡先生（男性） ________ Oka | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p43_b1_1 | 43 | B-1 並べかえ | word_order | 私は音楽を聞きたいです。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p43_b1_2 | 43 | B-1 並べかえ | word_order | あなたはどこで昼食を食べたいですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p43_b2_1 | 43 | B-2 自己表現 | mode_switch | You: I ________ ________ go to the U.K. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p43_b2_2 | 43 | B-2 自己表現 | mode_switch | You: I ________ to ________ soccer games. | interactive / expand | 意味のまとまりを追加し、固定された文型へ段階的に進める。 |
| eng_p43_b2_3 | 43 | B-2 自己表現 | mode_switch | You: I ________ ________ eat scones. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p43_b3_1 | 43 | B-3 CAN-DO 自己表現 | mode_switch | 行きたい場所と、そこでしたいことを2文で書こう。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p44_1_1 | 44 | 1 連語・表現を確認 | mode_switch | あなたは週末にどこに行きたいですか。 ________ do you ________ to go on weekends? | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p44_1_2 | 44 | 1 連語・表現を確認 | mode_switch | 私たちはこの前の土曜日、公園を走って楽しみました。 We ________ ________ in the park last Saturday. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p44_2_1 | 44 | 2 場面にあわせて文を書く | mode_switch | ① 友達と映画に行きたい。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p44_2_2 | 44 | 2 場面にあわせて文を書く | mode_switch | ② 横浜でラーメンを食べたい。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p44_3_1 | 44 | 3 英文を読む | mode_switch | We enjoyed ( talk ) with them. の talk を適する形に。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p44_3_2a | 44 | 3 英文を読む | mode_switch | ニューヨークで何を見たい？ | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p44_3_2b | 44 | 3 英文を読む | mode_switch | 京都で何を食べた？ | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p44_3_2c | 44 | 3 英文を読む | mode_switch | ニューヨークで何を食べたい？ | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p45_v_1 | 45 | 1 単語チェック | mode_switch | topping | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_v_2 | 45 | 1 単語チェック | mode_switch | boiled egg | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_v_3 | 45 | 1 単語チェック | mode_switch | garlic | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_v_4 | 45 | 1 単語チェック | mode_switch | shrimp | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_v_5 | 45 | 1 単語チェック | mode_switch | clerk | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_v_6 | 45 | 1 単語チェック | mode_switch | 何か、何も［…ない］ | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_v_7 | 45 | 1 単語チェック | mode_switch | ドル | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_v_8 | 45 | 1 単語チェック | mode_switch | 無料の | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_v_9 | 45 | 1 単語チェック | mode_switch | 合計 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_v_10 | 45 | 1 単語チェック | mode_switch | 注文、注文の品 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p45_2_1 | 45 | 2 重要表現 | mode_switch | 飲みものは無料でもらえます。 You can get drinks ________ ________ . | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p45_2_2 | 45 | 2 重要表現 | mode_switch | 何になさいますか。 What ________ you ________ ? | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p45_2_3 | 45 | 2 重要表現 | mode_switch | テーブルに注文の品を取りに行ってください。 Please ________ ________ your order at the table. | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p45_3_1 | 45 | 3 会話練習 | mode_switch | Clerk: Can I take your order? / Kana: ________ like the pizza and orange ________, please. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p45_3_2 | 45 | 3 会話練習 | mode_switch | Naoto: I ________ the ramen with corn. ________ ________ is it? / Clerk: It’s ten dollars. | interactive / conversation | 相手の発話・場面から意図を決め、会話が成立する発話へ進める。 |
| eng_p47_v_1 | 47 | 1 単語チェック | mode_switch | 重い | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_v_2 | 47 | 1 単語チェック | mode_switch | 言う、話す | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_v_3 | 47 | 1 単語チェック | mode_switch | 必要な | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_v_4 | 47 | 1 単語チェック | mode_switch | いす | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_v_5 | 47 | 1 単語チェック | mode_switch | シャツ、ブラウス | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_v_6 | 47 | 1 単語チェック | mode_switch | 厚い | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_v_7 | 47 | 1 単語チェック | mode_switch | 作動する、する | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_v_8 | 47 | 1 単語チェック | mode_switch | 役に立つ、便利な | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_v_9 | 47 | 1 単語チェック | mode_switch | 時刻、時間 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_v_10 | 47 | 1 単語チェック | mode_switch | foot の複数形 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p47_2_1 | 47 | 2 重要表現 | mode_switch | 氷は食べ物や飲み物を冷やすことができます。 Ice can ________ food and drinks. | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p47_2_2 | 47 | 2 重要表現 | mode_switch | 時計は時間を知らせます。 Clocks ________ ________ . | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p47_3_1 | 47 | 3 作文練習 | mode_switch | 辞書のヒントを3つ作ろう。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p47_3_2 | 47 | 3 作文練習 | mode_switch | 郵便箱のヒントを3つ作ろう。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p48_a1_1 | 48 | A-1 基本を確認する | choice | Kenji ( like / likes ) dogs. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p48_a1_2 | 48 | A-1 基本を確認する | choice | She ( speak / speaks ) Japanese. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p48_a1_3 | 48 | A-1 基本を確認する | choice | Mr. Yamada ( teach / teaches ) English. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p48_a2_1 | 48 | A-2 語を適する形に | mode_switch | Alex ________ the guitar. (play) | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p48_a2_2 | 48 | A-2 語を適する形に | mode_switch | My father ________ this computer. (use) | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p48_a2_3 | 48 | A-2 語を適する形に | mode_switch | He ________ to the park every Sunday. (go) | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p48_a3_1 | 48 | A-3 日本文にあう英文 | mode_switch | エレンはバッグをほしがっています。 Ellen ________ a bag. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p48_a3_2 | 48 | A-3 日本文にあう英文 | mode_switch | 私は毎朝バナナを食べます。 I ________ a banana every morning. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p48_a3_3 | 48 | A-3 日本文にあう英文 | mode_switch | ピーターは日曜日に日本語を勉強します。 Peter ________ Japanese on Sundays. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p49_v_1 | 49 | 必ず覚えたい語句 | mode_switch | 母、母親 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_2 | 49 | 必ず覚えたい語句 | mode_switch | 父 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_3 | 49 | 必ず覚えたい語句 | mode_switch | 住む、住んでいる | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_4 | 49 | 必ず覚えたい語句 | mode_switch | 彼［彼女］らは、それらは | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_5 | 49 | 必ず覚えたい語句 | mode_switch | （運動）選手、競技者 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_6 | 49 | 必ず覚えたい語句 | mode_switch | チーム、組 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_7 | 49 | 必ず覚えたい語句 | mode_switch | 場所、所、地域 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_8 | 49 | 必ず覚えたい語句 | mode_switch | 彼らの教室 ________ classroom | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_9 | 49 | 必ず覚えたい語句 | mode_switch | 鳥のような ________ a bird | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_10 | 49 | 必ず覚えたい語句 | mode_switch | Tシャツを着ている ________ a T-shirt | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_v_11 | 49 | 必ず覚えたい語句 | mode_switch | 私は週末にテレビゲームをする。 I play ________ games on weekends. | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p49_b1_1 | 49 | B-1 並べかえ | word_order | 悠斗は毎週金曜日にサッカーを練習します。（固定の続き: Friday.） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p49_b1_2 | 49 | B-1 並べかえ | word_order | 私のイヌは速く走ります。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p49_b1_3 | 49 | B-1 並べかえ | word_order | 私の父はこのベッドを使います。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p49_b2_1 | 49 | B-2 自己表現 | mode_switch | Mike はラグビーをする。 Mike ________ ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p49_b2_2 | 49 | B-2 自己表現 | mode_switch | 彼はラグビーの試合をよく見る。 He often ________ ________ ________ . | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p49_b2_3 | 49 | B-2 自己表現 | mode_switch | 彼は週末に昼食を作る。 He ________ ________ on weekends. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p49_b3_1 | 49 | B-3 CAN-DO 自己表現 | mode_switch | Jill の出身：ドイツ。 This is Jill. ① She ________ ________ Germany. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p49_b3_2 | 49 | B-3 CAN-DO 自己表現 | free_text | Jill の年齢を英語で表そう。 ② She ________ ________ . | kept_original | 複数の自然な表現があり、固定goalへ操作で誘導しない。 |
| eng_p49_b3_3 | 49 | B-3 CAN-DO 自己表現 | mode_switch | 身近な人を1人選び、その人を Jill に紹介しよう。 This is ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p50_a1_1 | 50 | A-1 基本を確認する | choice | ( Do / Does ) Paulo speak English? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p50_a1_2 | 50 | A-1 基本を確認する | choice | Does Aoi ( like / likes ) soccer? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p50_a1_3 | 50 | A-1 基本を確認する | choice | My brother ( do / does ) not sing well. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p50_a2_1 | 50 | A-2 対話を完成 | mode_switch | Does Maiko want the book? — Yes, she ________ . | interactive / conversation | 相手の発話・場面から意図を決め、会話が成立する発話へ進める。 |
| eng_p50_a2_2 | 50 | A-2 対話を完成 | mode_switch | Does Shinichi live in Osaka? — No, he ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p50_a3_1 | 50 | A-3 日本文にあう英文 | mode_switch | 結衣と健は納豆を食べますか。 ________ Yui and Ken eat natto? | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p50_a3_2 | 50 | A-3 日本文にあう英文 | mode_switch | 私の母はこのコンピュータを使いません。 My mother ________ ________ ________ this computer. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p50_a3_3 | 50 | A-3 日本文にあう英文 | mode_switch | トムには兄弟がいますか。 ________ Tom ________ any brothers? | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p51_v_1 | 51 | 必ず覚えたい語句 | mode_switch | university［名］ | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p51_v_2 | 51 | 必ず覚えたい語句 | mode_switch | 演奏会、音楽会 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p51_v_3 | 51 | 必ず覚えたい語句 | mode_switch | 観客、聴衆 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p51_v_4 | 51 | 必ず覚えたい語句 | mode_switch | 兄、弟 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p51_v_5 | 51 | 必ず覚えたい語句 | mode_switch | 彼［女］らを［に］、それらを［に］ | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p51_v_6 | 51 | 必ず覚えたい語句 | mode_switch | インターネットで on the ________ | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p51_b1_1 | 51 | B-1 並べかえ | word_order | 久美は映画を見ますか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p51_b1_2 | 51 | B-1 並べかえ | word_order | あなたのお兄さんは上手に泳ぎますか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p51_b1_3 | 51 | B-1 並べかえ | word_order | 私のネコは牛乳を飲みません。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p51_b2_1 | 51 | B-2 自己表現 | word_order | 岡先生はたくさんイヌを飼っているの？ 1語 does を補って並べよう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p51_b2_2 | 51 | B-2 自己表現 | word_order | ううん。彼はイヌを飼っていないよ。 1語 does を補って並べよう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p51_b2_3 | 51 | B-2 自己表現 | word_order | 彼はネコをたくさんほしがっているよ。 1語 wants を補って並べよう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p51_b3_1 | 51 | B-3 CAN-DO 自己表現 | mode_switch | Does Sota like music? | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p51_b3_2 | 51 | B-3 CAN-DO 自己表現 | mode_switch | Does Sota play tennis? | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p52_a1_1 | 52 | A-1 基本を確認する | choice | ( Who / Whose ) room is this? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p52_a1_2 | 52 | A-1 基本を確認する | choice | Whose umbrella ( is / are ) that? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p52_a1_3 | 52 | A-1 基本を確認する | choice | ( Whose / What ) cap is that? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p52_a2_1 | 52 | A-2 日本文にあう英文 | mode_switch | あれはだれのTシャツですか。— 私のものです。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p52_a2_2 | 52 | A-2 日本文にあう英文 | mode_switch | これはだれのカップですか。— 私の弟のものです。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p52_a3_1 | 52 | A-3 並べかえ | word_order | これはだれのボールですか。（固定の続き: this?） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p52_a3_2 | 52 | A-3 並べかえ | word_order | あれはだれのイヌですか。（固定の続き: that?） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p52_a3_3 | 52 | A-3 並べかえ | word_order | あのバイオリンは私のものです。（固定の文頭: That） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p53_v_1 | 53 | 必ず覚えたい語句 | mode_switch | 帽子 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p53_v_2 | 53 | 必ず覚えたい語句 | mode_switch | あした［は］、あすは | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p53_v_3 | 53 | 必ず覚えたい語句 | mode_switch | 待って。 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p53_v_4 | 53 | 必ず覚えたい語句 | mode_switch | じゃあね。 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p53_v_5 | 53 | 必ず覚えたい語句 | mode_switch | だれの | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p53_v_6 | 53 | 必ず覚えたい語句 | mode_switch | タオル | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p53_v_7 | 53 | 必ず覚えたい語句 | mode_switch | これは私のものです。 This is ________ . | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p53_v_8 | 53 | 必ず覚えたい語句 | mode_switch | あの本はあなたのものですか。 Is that book ________ ? | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p53_v_9 | 53 | 必ず覚えたい語句 | mode_switch | それは彼女のものではありません。 It isn’t ________ . | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p53_b1_1 | 53 | B-1 並べかえ | word_order | これはだれの本ですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p53_b1_2 | 53 | B-1 並べかえ | word_order | それはトムのものです。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p53_b1_3 | 53 | B-1 並べかえ | word_order | あなたはなぜ音楽が好きなのですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p53_b2_1 | 53 | B-2 自己表現 | word_order | これはだれの帽子？ 1語 whose を補って並べよう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p53_b2_2 | 53 | B-2 自己表現 | word_order | あかりのだよ。 1語 Akari’s を補って並べよう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p53_b2_3 | 53 | B-2 自己表現 | word_order | あかりってだれ？ 1語 who を補って並べよう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p53_b3_1 | 53 | B-3 CAN-DO 自己表現 | free_text | Whose bag is this? — （絵①の名札を見て答える） | kept_original | 正答が資料から確定できない、または解答の幅があり固定goalを置きにくい。 |
| eng_p53_b3_2 | 53 | B-3 CAN-DO 自己表現 | mode_switch | 持ち主がわからない絵②のものについて、Tom に「だれのものか」をたずねよう。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p54_v_1 | 54 | 1 単語チェック | mode_switch | detective | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_v_2 | 54 | 1 単語チェック | mode_switch | carefully | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_v_3 | 54 | 1 単語チェック | mode_switch | solve | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_v_4 | 54 | 1 単語チェック | mode_switch | confident | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_v_5 | 54 | 1 単語チェック | mode_switch | tough | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_v_6 | 54 | 1 単語チェック | mode_switch | 物、事 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_v_7 | 54 | 1 単語チェック | mode_switch | 奇妙な、不思議な | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_v_8 | 54 | 1 単語チェック | mode_switch | 事実 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_v_9 | 54 | 1 単語チェック | mode_switch | 問題、やっかいなこと | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_v_10 | 54 | 1 単語チェック | mode_switch | 難しい、困難な | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p54_2_1 | 54 | 2 重要表現 | mode_switch | 私の妹は毎日この写真を見ます。 My sister ________ ________ this picture every day. | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p54_2_2 | 54 | 2 重要表現 | mode_switch | 彼はこの国ではよく知られている歌手です。 He is a ________ singer in this country. | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p54_2_3 | 54 | 2 重要表現 | mode_switch | あなたはあの神秘的な動物を知っていますか。 Do you know that ________ animal? | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p54_3_1 | 54 | 3 本文読解 | free_text | シャーロック・ホームズは何に登場するキャラクターですか。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p54_3_2 | 54 | 3 本文読解 | free_text | シャーロック・ホームズはどこで人気がありますか。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p54_4_1 | 54 | 4 英作文の練習 | mode_switch | 小次郎（Kojiro）は世界的に有名なキャラクターです。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p54_4_2 | 54 | 4 英作文の練習 | mode_switch | 彼はとてもたくましいです。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p54_4_3 | 54 | 4 英作文の練習 | mode_switch | 彼はたくさんの言語を話します。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p55_1_1 | 55 | 1 下線部を代名詞に | mode_switch | I like Yumi’s mother. 「Yumi’s mother」を代名詞に。 | interactive / role_change | 文中の役割を決めてから、代名詞・所有形の語形を変える。 |
| eng_p55_1_2 | 55 | 1 下線部を代名詞に | mode_switch | This is Ms. Sato’s bike. 「Ms. Sato’s」を代名詞に。 | interactive / role_change | 文中の役割を決めてから、代名詞・所有形の語形を変える。 |
| eng_p55_1_3 | 55 | 1 下線部を代名詞に | mode_switch | This bag is Mr. Green’s. 「Mr. Green’s」を代名詞に。 | interactive / role_change | 文中の役割を決めてから、代名詞・所有形の語形を変える。 |
| eng_p55_1_4 | 55 | 1 下線部を代名詞に | mode_switch | You and Hiroshi use the computer. 「You and Hiroshi」を代名詞に。 | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p55_1_5 | 55 | 1 下線部を代名詞に | mode_switch | Does Ichiro know Tomomi and me? 「Tomomi and me」を代名詞に。 | interactive / role_change | 文中の役割を決めてから、代名詞・所有形の語形を変える。 |
| eng_p55_2_1 | 55 | 2 まちがい直し | mode_switch | This is Ms. Kato. × He is Ken’s mother. 正しい語は？ | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p55_2_2 | 55 | 2 まちがい直し | mode_switch | That is Ken’s father. I know × he. 正しい語は？ | interactive / role_change | 文中の役割を決めてから、代名詞・所有形の語形を変える。 |
| eng_p55_2_3 | 55 | 2 まちがい直し | mode_switch | Yuki and I like tennis. × They play it after school. 正しく直そう。 | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p56_1_1 | 56 | 1 語を選ぶ | choice | Toru ( speak / speaks ) English well. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p56_1_2 | 56 | 1 語を選ぶ | choice | Aki ( is / does ) not eat natto. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p56_1_3 | 56 | 1 語を選ぶ | choice | ( Do / Does ) your dog swim? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p56_1_4 | 56 | 1 語を選ぶ | choice | ( Who / Whose ) bag is that? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p56_2_1 | 56 | 2 文を作る | mode_switch | I practice soccer every day. 主語を She に → ________ soccer every day. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p56_2_2 | 56 | 2 文を作る | mode_switch | Kate knows about anime. 疑問文に。 | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p56_2_3 | 56 | 2 文を作る | mode_switch | My father watches TV. 否定文に。 | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p56_3_1 | 56 | 3 連語を確認する | mode_switch | 私たちはインターネットでその試合を楽しめます。 We can enjoy the game ________ the ________ . | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p56_3_2 | 56 | 3 連語を確認する | mode_switch | 彼は中央公園のような公園に行きます。 He goes to parks ________ Chuo Park. | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p56_3_3 | 56 | 3 連語を確認する | mode_switch | また明日。 ________ ________ tomorrow. | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p56_4_1 | 56 | 4 並べかえる | word_order | 彼はコーヒーが好きではありません。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p56_4_2 | 56 | 4 並べかえる | word_order | 裕太は放課後にテニスをします。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p56_4_3 | 56 | 4 並べかえる | word_order | あなたのお姉さんは日曜日に図書館へ行きますか。（固定の続き: Sundays?） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p57_5_1 | 57 | 5 場面にあわせて文を書く | mode_switch | ① Takeshi（ラグビーが好き） | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p57_5_2 | 57 | 5 場面にあわせて文を書く | mode_switch | ② 健は毎日英語を勉強する。 | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p57_6_1 | 57 | 6 英文を読む | choice | Sachi の写真として最も合う説明を選ぼう。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p57_6_2 | 57 | 6 英文を読む | mode_switch | Does Sachi walk Pochi every day? 3語以上で答えよう。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p57_6_3a | 57 | 6 英文を読む | mode_switch | Sachi がバンドで担当している楽器は？ | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p57_6_3b | 57 | 6 英文を読む | mode_switch | Sachi がそのほかにできることは？ | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p57_6_3c | 57 | 6 英文を読む | mode_switch | Hana がそのほかにできることは？ | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p57_6_3d | 57 | 6 英文を読む | mode_switch | Daiki がそのほかにできることは？ | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p59_1_1 | 59 | 1 3人称単数を選ぶ | choice | I / he / Mr. Baker / they / Ken / Alex and Kumi / we のうち、he と Ken 以外の3人称単数は？ | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p59_2_1 | 59 | 2 主語に注意して選ぶ | choice | Ken ( speak / speaks ) English. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p59_2_2 | 59 | 2 主語に注意して選ぶ | choice | He ( live / lives ) in Kyoto. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p59_2_3 | 59 | 2 主語に注意して選ぶ | choice | You ( want / wants ) a nice cap. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p59_2_4 | 59 | 2 主語に注意して選ぶ | choice | They ( come / comes ) to school every day. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p59_2_5 | 59 | 2 主語に注意して選ぶ | choice | Alex and Kumi ( sing / sings ) English songs. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p59_3_1 | 59 | 3 日本文にあう英文 | mode_switch | 健はこのペンを使います。 Ken ________ this pen. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p59_3_2 | 59 | 3 日本文にあう英文 | mode_switch | 私たちはあなたのお兄さんを知っています。 We ________ your brother. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p59_3_3 | 59 | 3 日本文にあう英文 | mode_switch | 彩は毎朝学校へ行きます。 Aya ________ to school every morning. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p59_3_4 | 59 | 3 日本文にあう英文 | mode_switch | ベーカー先生は英語を教えます。 Mr. Baker ________ English. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p59_3_5 | 59 | 3 日本文にあう英文 | mode_switch | 順と私は毎週日曜日にテニスをします。 Jun and I ________ tennis on Sundays. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p59_3_6 | 59 | 3 日本文にあう英文 | mode_switch | 彼女はよくゲームをします。 She often ________ games. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p59_4_1 | 59 | 4 まちがい直し | mode_switch | My mother × like animals very much. 正しい語は？ | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p59_4_2 | 59 | 4 まちがい直し | mode_switch | My father often × studys English. 正しい語は？ | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p59_4_3 | 59 | 4 まちがい直し | mode_switch | × My brothers sometimes watches movies. 正しく直そう。 | interactive / repair | 教材中の誤文・誤った語形を修理対象にし、修正後の状態を確認できる。 |
| eng_p60_1_1 | 60 | 1 基本のドリル | mode_switch | これは私の兄の写真です。 ________ is a ________ of my brother. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_2 | 60 | 1 基本のドリル | mode_switch | 彼は20歳です。 He is ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_3 | 60 | 1 基本のドリル | mode_switch | 彼は福岡に住んでいます。 ________ ________ in Fukuoka. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_4 | 60 | 1 基本のドリル | mode_switch | 彼は音楽が好きです。 He ________ music. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_5 | 60 | 1 基本のドリル | mode_switch | 彼は本をたくさん持っています。 He ________ many books. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_6 | 60 | 1 基本のドリル | mode_switch | 私の姉は大学で勉強しています。 My sister ________ at university. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_7 | 60 | 1 基本のドリル | mode_switch | 彼女は英語を上手に話すことができます。 She ________ ________ English well. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_8 | 60 | 1 基本のドリル | mode_switch | 彼女はイギリスに行きたがっています。 She ________ ________ go to the U.K. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_9 | 60 | 1 基本のドリル | mode_switch | 彼女はときどき朝食を食べません。 She sometimes ________ ________ breakfast. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_10 | 60 | 1 基本のドリル | mode_switch | 彼女はふつう11時に寝ます。 She ________ ________ to bed at 11. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_11 | 60 | 1 基本のドリル | mode_switch | トムは私の友達です。 Tom is my ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_12 | 60 | 1 基本のドリル | mode_switch | 彼はオーストラリア出身です。 He is ________ Australia. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_13 | 60 | 1 基本のドリル | mode_switch | 彼はバスケットボールを上手にします。 He plays basketball ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_14 | 60 | 1 基本のドリル | mode_switch | 彼と私はよくバスケットボールをします。 He and I ________ ________ basketball. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_15 | 60 | 1 基本のドリル | mode_switch | 私の友達の久美は動物が好きです。 My friend, Kumi, ________ animals. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_16 | 60 | 1 基本のドリル | mode_switch | 彼女はイヌ2匹とネコ1匹を飼っています。 She ________ two dogs and a cat. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_17 | 60 | 1 基本のドリル | mode_switch | 彼女は料理が得意です。 She is ________ at ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_18 | 60 | 1 基本のドリル | mode_switch | 彼女の誕生日は10月11日です。 ________ ________ is October 11. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_19 | 60 | 1 基本のドリル | mode_switch | 小松先生は音楽の先生です。 Ms. Komatsu is a ________ teacher. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_20 | 60 | 1 基本のドリル | mode_switch | 彼女はとても上手に歌を歌います。 She ________ very well. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_21 | 60 | 1 基本のドリル | mode_switch | 彼女はいつも親切です。 She is ________ ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_22 | 60 | 1 基本のドリル | mode_switch | 大谷翔平は野球選手です。 Ohtani Shohei is a baseball ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_23 | 60 | 1 基本のドリル | mode_switch | 彼はアメリカに住んでいます。 He ________ ________ the U.S.A. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_24 | 60 | 1 基本のドリル | mode_switch | 彼はとても有名です。 He is very ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_25 | 60 | 1 基本のドリル | mode_switch | 宇多田ヒカルは歌手です。 Utada Hikaru is a ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p60_1_26 | 60 | 1 基本のドリル | mode_switch | 彼女の歌はすばらしいです。 Her songs are ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p61_2_1 | 61 | 2 日本語でリフレーズ | mode_switch | 彼は読書家です。 He ________ many books. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p61_2_2 | 61 | 2 日本語でリフレーズ | mode_switch | 私の姉はランチを作ります。 My sister ________ lunch. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p61_2_3 | 61 | 2 日本語でリフレーズ | mode_switch | 彼女は勉強熱心です。 She ________ hard. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p61_2_4 | 61 | 2 日本語でリフレーズ | mode_switch | トムは料理がとても上手です。 Tom ________ very well. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p61_2_5 | 61 | 2 日本語でリフレーズ | mode_switch | 阿部先生は、いつも私たちに話をかけてくれます。 Ms. Abe ________ ________ to us. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p61_2_6 | 61 | 2 日本語でリフレーズ | mode_switch | 由美はケーキが大好物です。 Yumi ________ cake. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p61_2_7 | 61 | 2 日本語でリフレーズ | mode_switch | 私の弟は足が遅い。 My brother ________ ________ fast. | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p62_a1_1 | 62 | A-1 基本を確認する | choice | I ( am / is ) running now. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p62_a1_2 | 62 | A-1 基本を確認する | choice | The girls ( is / are ) waiting for the player now. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p62_a1_3 | 62 | A-1 基本を確認する | choice | My brother is ( plays / playing ) the guitar. | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p62_a2_1 | 62 | A-2 語を適する形に | mode_switch | Jim is ________ a computer now. (use) | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p62_a2_2 | 62 | A-2 語を適する形に | mode_switch | They are ________ a movie now. (see) | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p62_a2_3 | 62 | A-2 語を適する形に | mode_switch | The boys ________ playing baseball now. (is) | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p62_a3_1 | 62 | A-3 日本文にあう英文 | mode_switch | 私は今、泳いでいます。 I’m ________ now. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p62_a3_2 | 62 | A-3 日本文にあう英文 | mode_switch | 彼女たちは今、昼食をとっています。 They ________ ________ lunch now. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p62_a3_3 | 62 | A-3 日本文にあう英文 | mode_switch | エリックは今、手紙を書いています。 Eric ________ ________ a letter now. | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p63_v_1 | 63 | 必ず覚えたい語句 | mode_switch | 休憩 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_v_2 | 63 | 必ず覚えたい語句 | mode_switch | 学生、生徒 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_v_3 | 63 | 必ず覚えたい語句 | mode_switch | 生活 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_v_4 | 63 | 必ず覚えたい語句 | mode_switch | みんな | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_v_5 | 63 | 必ず覚えたい語句 | mode_switch | 今、今は、現在は | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_v_6 | 63 | 必ず覚えたい語句 | mode_switch | ケーキを買う ________ a cake | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_v_7 | 63 | 必ず覚えたい語句 | mode_switch | 次の夏 ________ summer | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_v_8 | 63 | 必ず覚えたい語句 | mode_switch | これらの本 ________ books | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_v_9 | 63 | 必ず覚えたい語句 | mode_switch | 2つの授業の間に ________ two classes | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_v_10 | 63 | 必ず覚えたい語句 | mode_switch | 私自身のスケジュール my ________ schedule | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p63_b1_1 | 63 | B-1 並べかえ | word_order | アレックスはアンとテニスを練習しています。（固定の続き: Ann.） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p63_b1_2 | 63 | B-1 並べかえ | word_order | この鳥たちは水を飲んでいます。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p63_b1_3 | 63 | B-1 並べかえ | word_order | 誠と由美は今、花について話しています。（固定の文頭: Makoto and Yumi／固定の続き: now.） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p63_b2_1 | 63 | B-2 自己表現 | mode_switch | I practice the piano on weekends. → 私は今、ピアノを練習しています。 | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p63_b2_2 | 63 | B-2 自己表現 | mode_switch | Ryo studies English every day. → 涼は今、英語を勉強しています。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p63_b3_1 | 63 | B-3 CAN-DO 自己表現 | mode_switch | 絵の Ken は何をしていますか。 Ken is ________ . | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p63_b3_2 | 63 | B-3 CAN-DO 自己表現 | mode_switch | 絵の Miki は何をしていますか。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p63_b3_3 | 63 | B-3 CAN-DO 自己表現 | mode_switch | 公園内のほかの人物について「…は（今）…しています」と2文以上書こう。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p64_a1_1 | 64 | A-1 基本を確認する | choice | ( Do / Are ) you eating tempura? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p64_a1_2 | 64 | A-1 基本を確認する | choice | Is Alex ( goes / going ) to the park? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p64_a1_3 | 64 | A-1 基本を確認する | choice | Is she ( walking / walk ) her dog? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p64_a2_1 | 64 | A-2 疑問文を作る | mode_switch | ________ you ________ the piano? (play) | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p64_a2_2 | 64 | A-2 疑問文を作る | mode_switch | ________ Kota ________ milk? (drink) | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p64_a2_3 | 64 | A-2 疑問文を作る | mode_switch | ________ Yuka and Mami ________ TV? (watch) | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p64_a3_1 | 64 | A-3 日本文にあう英文 | mode_switch | あなたは理科を勉強していますか。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p64_a3_2 | 64 | A-3 日本文にあう英文 | mode_switch | あなたのネコは走っていますか。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p64_a3_3 | 64 | A-3 日本文にあう英文 | mode_switch | あなたは英語が好きですか。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p64_a3_4 | 64 | A-3 日本文にあう英文 | mode_switch | ボブは今、部屋をそうじしていますか。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p65_v_1 | 65 | 必ず覚えたい語句 | mode_switch | are not の短縮形 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p65_v_2 | 65 | 必ず覚えたい語句 | mode_switch | ペンを買う ________ a pen | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p65_v_3 | 65 | 必ず覚えたい語句 | mode_switch | 本を持ってくる ________ a book | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p65_v_4 | 65 | 必ず覚えたい語句 | mode_switch | よくある考え a ________ idea | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p65_v_5 | 65 | 必ず覚えたい語句 | mode_switch | あなたは何の種類の音楽が好きですか。 What ________ of music do you like? | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p65_v_6 | 65 | 必ず覚えたい語句 | mode_switch | イヌが好きな生徒もいれば、ネコが好きな生徒もいる。 ________ students like dogs. ________ like cats. | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p65_b1_1 | 65 | B-1 並べかえ | word_order | あなたのお兄さんは今、コンピュータを使っていますか。（固定の続き: his computer now?） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p65_b1_2 | 65 | B-1 並べかえ | word_order | 生徒たちは試合を見ているのですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p65_b2_1 | 65 | B-2 自己表現 | word_order | 健は机を作っているの？ 1語 is を補おう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p65_b2_2 | 65 | B-2 自己表現 | word_order | Ken, 机を作っているの？ 1語 are を補おう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p65_b2_3 | 65 | B-2 自己表現 | word_order | ちがうよ。いすだよ。 1語 not を補おう。 | interactive / transform | 元問題が求める文の変形を段階操作にし、途中状態と因果を見せる。 |
| eng_p65_b3_1 | 65 | B-3 CAN-DO 自己表現 | mode_switch | Is Liz reading a book? 2文で答えよう。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p65_b3_2 | 65 | B-3 CAN-DO 自己表現 | mode_switch | ほかの子どもたちについて「…は…していますか」と2つ以上質問を書こう。 | kept_original | 複数の自然な表現があり、固定goalへ操作で誘導しない。 |
| eng_p66_a1_1 | 66 | A-1 基本を確認する | choice | ( Where / Which ) do you speak at home, Japanese or English? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p66_a1_2 | 66 | A-1 基本を確認する | choice | ( Who / Which ) do you want, a notebook or a pencil case? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p66_a1_3 | 66 | A-1 基本を確認する | choice | Which do you like, dogs ( and / or ) cats? | kept_original | 選択肢から語形・語句を判別する短い確認。操作型へ変えると手数が増える。 |
| eng_p66_a2_1 | 66 | A-2 文を完成させる | mode_switch | ________ do you study on Saturdays, English or science? | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p66_a2_2 | 66 | A-2 文を完成させる | mode_switch | ________ does your brother eat, apples ________ oranges? | interactive / conversation | 相手の発話・場面から意図を決め、会話が成立する発話へ進める。 |
| eng_p66_a3_1 | 66 | A-3 並べかえ | word_order | あなたは牛乳と紅茶のどちらがほしいですか。（固定の続き: , milk or tea?） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p66_a3_2 | 66 | A-3 並べかえ | word_order | 結衣は鳥とネコのどちらを飼っていますか。（固定の文頭: Which does Yui have,） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p67_v_1 | 67 | 必ず覚えたい語句 | mode_switch | pasta［名］ | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p67_v_2 | 67 | 必ず覚えたい語句 | mode_switch | 私たちの教室 ________ classroom | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p67_v_3 | 67 | 必ず覚えたい語句 | mode_switch | わくわくします。 I’m ________ . | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p67_v_4 | 67 | 必ず覚えたい語句 | mode_switch | 待ちきれません！ I can’t ________ ! | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p67_b1_1 | 67 | B-1 並べかえ | word_order | あなたは米とパンのどちらを食べますか。（固定の続き: , rice or bread?） | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p67_b1_2 | 67 | B-1 並べかえ | word_order | 私は米を食べます。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p67_b1_3 | 67 | B-1 並べかえ | word_order | あなたはこの映画のどんなことが好きですか。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p67_b2_1 | 67 | B-2 自己表現 | word_order | 英語と日本語、どっちが好き？ 1語 which を補おう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p67_b2_2 | 67 | B-2 自己表現 | word_order | 靴とバッグ、どっちがほしい？ 1語 which を補おう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p67_b2_3 | 67 | B-2 自己表現 | word_order | 動物園と水族館、どっちに行きたい？ 1語 or を補おう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p67_b2_4 | 67 | B-2 自己表現 | word_order | J-pop と K-pop、どっちが好き？ 1語 do を補おう。 | enhanced_word_order / word_order | 元のword_orderを保ち、正答token prefixから外れた位置を途中で知らせる。 |
| eng_p67_b3_1 | 67 | B-3 CAN-DO 自己表現 | mode_switch | Which do you like, udon or soba? に英語で答えよう。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p67_b3_2 | 67 | B-3 CAN-DO 自己表現 | mode_switch | Which do you want to eat, sushi or ramen? に英語で答えよう。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p67_b3_3 | 67 | B-3 CAN-DO 自己表現 | mode_switch | Peter に「AとBではどちらが食べたいですか」と質問を1つ書こう。 | kept_original | 短い穴埋め・知識確認で、状態操作を追加しても必要な思考が増えない。 |
| eng_p68_v_1 | 68 | 1 単語チェック | mode_switch | Spanish | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_v_2 | 68 | 1 単語チェック | mode_switch | event | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_v_3 | 68 | 1 単語チェック | mode_switch | ceremony | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_v_4 | 68 | 1 単語チェック | mode_switch | serve | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_v_5 | 68 | 1 単語チェック | mode_switch | 休暇、休み | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_v_6 | 68 | 1 単語チェック | mode_switch | 親密な… | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_v_7 | 68 | 1 単語チェック | mode_switch | 物語、話 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_v_8 | 68 | 1 単語チェック | mode_switch | 外国の | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_v_9 | 68 | 1 単語チェック | mode_switch | 卒業 | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_v_10 | 68 | 1 単語チェック | mode_switch | すべての、全部の | kept_original | 語句そのものの意味を確認する問題。操作を足すと語彙確認が遠回りになる。 |
| eng_p68_2_1 | 68 | 2 重要表現 | mode_switch | 私たちは今、英語の授業を受けています。 We are ________ an English ________ now. | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p68_2_2 | 68 | 2 重要表現 | mode_switch | 彼らは自転車で学校に行くのですか。 Do they go to school ________ ________ ? | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p68_2_3 | 68 | 2 重要表現 | mode_switch | 校外学習は10月3日にあります。 The ________ ________ is on October third. | kept_original | 定型表現・連語の想起が中心で、変形操作を足す利点が小さい。 |
| eng_p68_3_1 | 68 | 3 本文読解 | free_text | ケビンが送ったのは（ ）している写真です。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p68_3_2 | 68 | 3 本文読解 | free_text | ケビンの学校では、すべての生徒が（ ）を勉強し、（ ）か国語の中から選べます。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p68_3_3 | 68 | 3 本文読解 | free_text | 多くの生徒が（ ）を選びます。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p68_3_4 | 68 | 3 本文読解 | free_text | ケビンは日本の（ ）について知りたいと思っています。 | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p68_4_1 | 68 | 4 本文読解 | free_text | What picture is it? It’s a picture of Kevin’s ________ ________ . | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |
| eng_p68_4_2 | 68 | 4 本文読解 | free_text | Are the students serving lunch in the picture? ________ , they ________ . | kept_original | 本文・会話の内容や指示対象を読む問題。現在の英文操作catalogとは目的が異なる。 |

`kept_original` は未判定を表さず、各itemに理由キーを付けて通常形式を維持した記録です。`eng_p65_b2_3` は既存transformを維持したまま、word_order回答欄にも途中prefix feedbackを追加したため、interaction type別件数には重複があります。候補抽出と最終分類はこの静的一覧をレビュー対象とし、実行時にJSONからinteractionを自動生成しません。
