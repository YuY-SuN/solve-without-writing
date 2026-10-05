# 英語JSONのinteraction適用候補一覧

全英語datasetのitemを走査した候補調査。これは全面適用の指示ではなく、次フェーズで優先度を決めるための棚卸しである。response・prompt・answer・explanation・選択肢を使った一次分類を含むため、新規候補は教材意図と正答を人が再確認する。

対象: `english_lesson3_3_chatgpt.json`、`english_workbook_p32_p69.json` / 432 items

難易度は定義を新規作成する場合の実装見積もり。実装済み・word_orderは既存方式を再利用するためlow。会話やdistractorからの分類は候補抽出であり、自動interaction生成には使わない。

## 推奨方式の件数

| 推奨方式 | 件数 |
|---|---:|
| conversation | 8 |
| conversation（実装済） | 2 |
| expand | 7 |
| expand / repair | 13 |
| expand（実装済） | 1 |
| repair | 19 |
| repair / transform | 12 |
| repair（実装済） | 8 |
| role_change | 11 |
| role_change（実装済） | 2 |
| transform | 62 |
| transform（実装済） | 7 |
| transform（実装済） / word_order | 1 |
| word_order | 47 |
| word_order（実装済） | 6 |
| 通常choice | 25 |
| 通常choice / input | 193 |
| 通常input | 8 |

## item別一覧

| item.id | page | response.type | 問題内容 | 推奨interaction | 理由 | 難易度 |
|---|---:|---|---|---|---|---|
| eng_lesson3_3_p32_a1_01 | 32 | choice | ( ___ / ___ ) is she? 彼女はだれですか。 | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_lesson3_3_p32_a1_02 | 32 | choice | That is Takeshi. He is my friend. I like ( her / him ). | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_lesson3_3_p32_a1_03 | 32 | choice | She is Ms. White. Do you know ( her / him )? | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_lesson3_3_p32_a2_01 | 32 | mode_switch | こちらはだれですか。 ___ is ___ ? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_lesson3_3_p32_a2_02 | 32 | mode_switch | 彼は私の友達です。 ___ is my ___ . | repair | 正答文と近い英文distractor（Him is my friend.）を、意味を保って段階修理できる。 | medium |
| eng_p32_a1_1 | 32 | choice | ( Who / Who’s ) is she? | 通常choice | Who / Who’s の形を選ぶ短い知識確認で、状態を変化させる操作型にする利点が小さい。 | low |
| eng_p32_a1_2 | 32 | choice | That is Takeshi. He is my friend. I like ( her / him ). | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_p32_a1_3 | 32 | choice | She is Ms. White. Do you know ( her / him )? | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_p32_a2_1 | 32 | mode_switch | こちらはだれですか。 ________ is ________ ? | repair（実装済） | 既存distractor由来の文を語単位の修理操作に接続済み。 | low |
| eng_p32_a2_2 | 32 | mode_switch | 彼は私の友達です。 ________ is my ________ . | repair（実装済） | 既存distractor由来の文を語単位の修理操作に接続済み。 | low |
| eng_p32_a3_1 | 32 | word_order | あちらはだれですか。 | word_order（実装済） | token列があり、1語ごとの配置とprefix確認を利用できる。 | low |
| eng_lesson3_3_p33_a3_01 | 33 | word_order | あちらはだれですか。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_lesson3_3_p33_b1_01 | 33 | word_order | 私は彼女が大好きです。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_lesson3_3_p33_b1_02 | 33 | word_order | あなたのお気に入りの歌手はだれですか。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_lesson3_3_p33_b2_01 | 33 | mode_switch | This is Ken. Do you ___ ___ ? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_lesson3_3_p33_b2_02 | 33 | mode_switch | ___ ___ very ___ . | repair | 正答文と近い英文distractor（Him is very kind.）を、意味を保って段階修理できる。 | medium |
| eng_lesson3_3_p33_b2_03 | 33 | mode_switch | I ___ ___ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_lesson3_3_p33_b3_01 | 33 | mode_switch | 好きなキャラクターを1人選び、「こちらは…です。私は彼［彼女］が好きです」と紹介しよう。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_lesson3_3_p33_b3_02 | 33 | mode_switch | 別のキャラクターをもう1人選び、「こちらは…です。あなたは彼［彼女］を知っていますか」と Ann にたずねよう。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_lesson3_3_p33_vocab_01 | 33 | mode_switch | character | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_lesson3_3_p33_vocab_02 | 33 | mode_switch | 考え、アイデア | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_lesson3_3_p33_vocab_03 | 33 | mode_switch | 芸術について知っている ___ about art | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_lesson3_3_p33_vocab_04 | 33 | mode_switch | 私は買い物が大好きだ。 I like shopping ___. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p33_b1_1 | 33 | word_order | 私は彼女が大好きです。 | word_order（実装済） | token列があり、1語ごとの配置とprefix確認を利用できる。 | low |
| eng_p33_b1_2 | 33 | word_order | あなたのお気に入りの歌手はだれですか。 | word_order（実装済） | token列があり、1語ごとの配置とprefix確認を利用できる。 | low |
| eng_p33_b2_1 | 33 | mode_switch | This is Ken. Do you ________ ________ ? | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p33_b2_2 | 33 | mode_switch | 「彼はとても親切です」 ________ ________ very ________ . | conversation | 相手の発話・会話状況が条件になり、返答から質問や発話を逆算できる。 | medium |
| eng_p33_b2_3 | 33 | mode_switch | 「私は彼が好きです」 I ________ ________ . | repair（実装済） | 既存distractor由来の文を語単位の修理操作に接続済み。 | low |
| eng_p33_b3_1 | 33 | mode_switch | 好きなキャラクターを1人選び、「こちらは…です。私は彼［彼女］が好きです」と紹介しよう。 | repair（実装済） | 既存distractor由来の文を語単位の修理操作に接続済み。 | low |
| eng_p33_b3_2 | 33 | mode_switch | 別のキャラクターを1人選び、「こちらは…です。あなたは彼［彼女］を知っていますか」とたずねよう。 | repair（実装済） | 既存distractor由来の文を語単位の修理操作に接続済み。 | low |
| eng_p33_vocab_1 | 33 | mode_switch | character［名］ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p33_vocab_2 | 33 | mode_switch | 考え、アイデア［名］ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p33_vocab_3 | 33 | mode_switch | 芸術について知っている ________ about art | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p33_vocab_4 | 33 | mode_switch | 私は買い物が大好きだ。 I like shopping ________ ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p34_1_1 | 34 | choice | Do you know Ms. White? — I don’t know ( him / her ). | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_p34_1_2 | 34 | choice | ( What / Who ) is this? — It’s a park. | conversation | 相手の発話・会話状況が条件になり、返答から質問や発話を逆算できる。 | medium |
| eng_p34_1_3 | 34 | choice | ( What / Who ) is that? — That is my friend. | conversation | 相手の発話・会話状況が条件になり、返答から質問や発話を逆算できる。 | medium |
| eng_p34_2_1 | 34 | mode_switch | I am in the music club. 主語を he にかえる → He ________ in the music club. | transform（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p34_2_2 | 34 | mode_switch | This is Ms. Brown. 疑問文に → ________ Ms. Brown? | transform（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p34_2_3 | 34 | mode_switch | That is a fox. “a fox” をたずねる文に → ________ that? | transform（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p34_3_1 | 34 | mode_switch | 私は遊園地が大好きです。 I like amusement parks ________ ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p34_3_2 | 34 | mode_switch | メアリーは少し一輪車に乗ることができます。 Mary can ride a unicycle ________ ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p34_4_1 | 34 | word_order | 彼女はあなたのおばですか。 | word_order（実装済） | token列があり、1語ごとの配置とprefix確認を利用できる。 | low |
| eng_p34_4_2 | 34 | word_order | 彼女はサッカーのファンではありません。 | word_order（実装済） | token列があり、1語ごとの配置とprefix確認を利用できる。 | low |
| eng_p34_4_3 | 34 | word_order | Is that your pen? — No. 続く文を作ろう。 | word_order（実装済） | token列があり、1語ごとの配置とprefix確認を利用できる。 | low |
| eng_p35_5_1 | 35 | mode_switch | ① 女性を指して “She is Maria.” と答える会話。相手への質問を書こう。 | conversation（実装済） | 返答から質問意図を組み立てる既存interaction対象。 | low |
| eng_p35_5_2 | 35 | mode_switch | ② 犬を連れた相手が “Yes, it is.” と答える会話。犬についてたずねる文を書こう。 | conversation（実装済） | 返答から質問意図を組み立てる既存interaction対象。 | low |
| eng_p35_6_1 | 35 | mode_switch | 下線部 “It’s new.” の It がさすものを日本語で答えよう。 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p35_6_2 | 35 | mode_switch | バスケットボール部に入っているのはだれですか。英語で答えよう。 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p35_6_3 | 35 | choice | マークはユウマを（知っていた / 知らなかった）。 | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p35_6_4 | 35 | mode_switch | ユウマとはだれですか。日本語で答えよう。 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p35_6_5 | 35 | word_order | マークが見た順に絵を並べよう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p36_1_1 | 36 | mode_switch | 私は鈴木香奈です。 ________ am Suzuki Kana. | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_p36_1_10 | 36 | mode_switch | 私は夕食後に宿題をします。 I do my homework ________ dinner. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_11 | 36 | mode_switch | 私は上手にテニスをすることができます。 I ________ play tennis well. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_12 | 36 | mode_switch | 私は放課後にバスケットボールを練習します。 I ________ basketball after ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_13 | 36 | mode_switch | 私はサッカーファンです。 ________ ________ a soccer ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_14 | 36 | mode_switch | 私は毎週日曜日にテニスのレッスンを受けます。 I ________ tennis lessons ________ Sundays. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_15 | 36 | mode_switch | 私は音楽が大好きです。 I ________ music. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p36_1_16 | 36 | mode_switch | 私はピアノを弾きます。 I play ________ ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_17 | 36 | mode_switch | 私はギターを弾くことができません。 I ________ ________ the guitar. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_18 | 36 | mode_switch | これは私のお気に入りの曲です。 This is my ________ song. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_19 | 36 | mode_switch | 私はイヌを飼っています。 I ________ a dog. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_2 | 36 | mode_switch | ぼくの名前は佐藤健です。 ________ name ________ Sato Takeshi. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p36_1_20 | 36 | mode_switch | 私はネコを２匹飼っています。 I have ________ ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_21 | 36 | mode_switch | 私のペットはかわいいです。 My pet is ________ . | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p36_1_3 | 36 | mode_switch | 私は12歳です。 I’m ________ . | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p36_1_4 | 36 | mode_switch | 私は長野出身です。 ________ ________ Nagano. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p36_1_5 | 36 | mode_switch | 私は音楽部に入っています。 I’m ________ the music ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_6 | 36 | mode_switch | 私は音楽が好きです。 I ________ music. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p36_1_7 | 36 | mode_switch | 私は毎日日本語を勉強します。 I ________ ________ every day. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p36_1_8 | 36 | mode_switch | 私は数学が得意です。 I’m ________ ________ math. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p36_1_9 | 36 | mode_switch | 私は理科が好きではありません。 I ________ like science. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p37_2_1 | 37 | mode_switch | イヌが好き。→「私はイヌが好き」 | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p37_2_2 | 37 | mode_switch | バスケットボールが上手にできます。 | repair | 正答文と近い英文distractor（I can plays basketball well.）を、意味を保って段階修理できる。 | medium |
| eng_p37_2_3 | 37 | mode_switch | 小林美穂です。→「私の名前は…です」 | repair / transform | 正答文と近い英文distractor（I name is Kobayashi Miho.）を、意味を保って段階修理できる。 | medium |
| eng_p37_2_4 | 37 | mode_switch | 毎日サッカーを練習します。 | repair / transform | 正答文と近い英文distractor（I practices soccer every day.）を、意味を保って段階修理できる。 | medium |
| eng_p37_2_5 | 37 | mode_switch | 日曜日には読書します。 | repair | 正答文と近い英文distractor（I reads books on Sunday.）を、意味を保って段階修理できる。 | medium |
| eng_p37_2_6 | 37 | mode_switch | 数学が嫌いです。 | repair / transform | 正答文と近い英文distractor（I not like math.）を、意味を保って段階修理できる。 | medium |
| eng_p37_2_7 | 37 | mode_switch | 泳ぎが苦手です。 | repair | 正答文と近い英文distractor（I don’t can swim well.）を、意味を保って段階修理できる。 | medium |
| eng_p38_1_1 | 38 | mode_switch | 話す | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_1_10 | 38 | mode_switch | どこに、どこで | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_1_2 | 38 | mode_switch | かど、曲がりかど | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_1_3 | 38 | mode_switch | まっすぐに | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_1_4 | 38 | mode_switch | 通り、街路 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_1_5 | 38 | mode_switch | 感謝する | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_1_6 | 38 | mode_switch | （おとなの）男性 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_1_7 | 38 | mode_switch | それから、次に | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_1_8 | 38 | mode_switch | 向きを変える、曲がる | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_1_9 | 38 | mode_switch | 左へ、左 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_2_1 | 38 | mode_switch | すみません。 ________ ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_2_2 | 38 | mode_switch | 駅へはどのようにして行けますか。 How can I ________ ________ the station? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p38_3_1 | 38 | choice | Yamato Park への案内：Turn right at the first corner. の次に続く文。 | repair | 正答文と近い英文distractor（It’s on your left.）を、意味を保って段階修理できる。 | medium |
| eng_p38_3_2 | 38 | choice | Sakura Restaurant への案内：Go straight on this street. の次に続く文。 | repair | 正答文と近い英文distractor（It’s on your left.）を、意味を保って段階修理できる。 | medium |
| eng_p39_1 | 39 | choice | トムと美香が弾く楽器の組み合わせとして正しいものを選ぼう。 | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p39_2 | 39 | mode_switch | 美香はどんな種類の本が好きですか。日本語で答えよう。 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p39_3 | 39 | choice | トムが読まないと言っているものはどれ？ | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p39_4 | 39 | mode_switch | “How many comic books do you have?” に、あなた自身の答えを英語で書こう。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p40_a1_1 | 40 | choice | I ( go / went ) to the museum last month. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p40_a1_2 | 40 | choice | I ( enjoy / enjoyed ) playing soccer. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p40_a1_3 | 40 | choice | I ( ate / eat ) a hamburger with my friends. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p40_a2_1 | 40 | mode_switch | 私はこの前の土曜日に公園へ行きました。 I ________ to the park last Saturday. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p40_a2_2 | 40 | mode_switch | 私は北海道で花を見ました。 I ________ flowers in Hokkaido. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p40_a3_1 | 40 | mode_switch | I ________ many beautiful fish last May. (see) | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p40_a3_2 | 40 | mode_switch | I ________ hiking last summer. (enjoy) | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p41_b1_1 | 41 | word_order | この前の春、私は動物園でパンダを見ました。（固定の続き: last spring.） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p41_b1_2 | 41 | word_order | この前の夏、私は川で魚釣りを楽しみました。（固定の続き: last summer.） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p41_b2_1 | 41 | mode_switch | I eat two apples. → 私はリンゴを2こ食べました。 | transform（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p41_b2_2 | 41 | mode_switch | I see pictures in the museum. → 私は美術館で絵を見ました。 | repair（実装済） | 既存distractor由来の文を語単位の修理操作に接続済み。 | low |
| eng_p41_b3_1 | 41 | mode_switch | メモを参考に「私は先週末…しました」という英文をできるだけ多く書こう。 | expand | 意味のまとまりを順に足して文を作る形式にできるが、自由回答を固定しすぎない工夫が必要。 | high |
| eng_p41_v_1 | 41 | mode_switch | 動物 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p41_v_2 | 41 | mode_switch | この前の | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p41_v_3 | 41 | mode_switch | 少ない | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p41_v_4 | 41 | mode_switch | 景色、ながめ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p41_v_5 | 41 | mode_switch | 年、1年（間） | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p41_v_6 | 41 | mode_switch | 頂上 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p41_v_7 | 41 | mode_switch | 昼食にそばを食べる eat soba ________ lunch | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p42_a1_1 | 42 | choice | I ( get / want ) to go to Australia. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p42_a1_2 | 42 | choice | ( What / Where ) do you want to go? | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p42_a1_3 | 42 | choice | I want ( play / to play ) soccer. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p42_a2_1 | 42 | mode_switch | 私はあなたと歌いたいです。 I ________ ________ sing with you. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p42_a2_2 | 42 | mode_switch | 私は友達に会いたいです。 I ________ to ________ my friend. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p42_a3_1 | 42 | word_order | 私はアメリカ合衆国に行きたいです。（固定の続き: to the U.S.A.） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p42_a3_2 | 42 | word_order | あなたはどこでテニスを練習したいですか。（固定の続き: practice tennis?） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p43_b1_1 | 43 | word_order | 私は音楽を聞きたいです。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p43_b1_2 | 43 | word_order | あなたはどこで昼食を食べたいですか。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p43_b2_1 | 43 | mode_switch | You: I ________ ________ go to the U.K. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p43_b2_2 | 43 | mode_switch | You: I ________ to ________ soccer games. | expand（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p43_b2_3 | 43 | mode_switch | You: I ________ ________ eat scones. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p43_b3_1 | 43 | mode_switch | 行きたい場所と、そこでしたいことを2文で書こう。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p43_v_1 | 43 | mode_switch | 赤ちゃん | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p43_v_2 | 43 | mode_switch | いとこ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p43_v_3 | 43 | mode_switch | …したい | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p43_v_4 | 43 | mode_switch | 岡先生（男性） ________ Oka | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p44_1_1 | 44 | mode_switch | あなたは週末にどこに行きたいですか。 ________ do you ________ to go on weekends? | repair / transform | 正答文と近い英文distractor（What do you want to go on weekends?）を、意味を保って段階修理できる。 | medium |
| eng_p44_1_2 | 44 | mode_switch | 私たちはこの前の土曜日、公園を走って楽しみました。 We ________ ________ in the park last Saturday. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p44_2_1 | 44 | mode_switch | ① 友達と映画に行きたい。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p44_2_2 | 44 | mode_switch | ② 横浜でラーメンを食べたい。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p44_3_1 | 44 | mode_switch | We enjoyed ( talk ) with them. の talk を適する形に。 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p44_3_2a | 44 | mode_switch | ニューヨークで何を見たい？ | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p44_3_2b | 44 | mode_switch | 京都で何を食べた？ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p44_3_2c | 44 | mode_switch | ニューヨークで何を食べたい？ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_2_1 | 45 | mode_switch | 飲みものは無料でもらえます。 You can get drinks ________ ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_2_2 | 45 | mode_switch | 何になさいますか。 What ________ you ________ ? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_2_3 | 45 | mode_switch | テーブルに注文の品を取りに行ってください。 Please ________ ________ your order at the table. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_3_1 | 45 | mode_switch | Clerk: Can I take your order? / Kana: ________ like the pizza and orange ________, please. | repair | 正答文と近い英文distractor（I like the pizza and orange juice, please.）を、意味を保って段階修理できる。 | medium |
| eng_p45_3_2 | 45 | mode_switch | Naoto: I ________ the ramen with corn. ________ ________ is it? / Clerk: It’s ten dollars. | conversation | 相手の発話・会話状況が条件になり、返答から質問や発話を逆算できる。 | medium |
| eng_p45_v_1 | 45 | mode_switch | topping | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_v_10 | 45 | mode_switch | 注文、注文の品 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_v_2 | 45 | mode_switch | boiled egg | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_v_3 | 45 | mode_switch | garlic | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_v_4 | 45 | mode_switch | shrimp | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_v_5 | 45 | mode_switch | clerk | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_v_6 | 45 | mode_switch | 何か、何も［…ない］ | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p45_v_7 | 45 | mode_switch | ドル | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_v_8 | 45 | mode_switch | 無料の | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p45_v_9 | 45 | mode_switch | 合計 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_2_1 | 47 | mode_switch | 氷は食べ物や飲み物を冷やすことができます。 Ice can ________ food and drinks. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_2_2 | 47 | mode_switch | 時計は時間を知らせます。 Clocks ________ ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_3_1 | 47 | mode_switch | 辞書のヒントを3つ作ろう。 | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p47_3_2 | 47 | mode_switch | 郵便箱のヒントを3つ作ろう。 | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p47_v_1 | 47 | mode_switch | 重い | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_v_10 | 47 | mode_switch | foot の複数形 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_v_2 | 47 | mode_switch | 言う、話す | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_v_3 | 47 | mode_switch | 必要な | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_v_4 | 47 | mode_switch | いす | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_v_5 | 47 | mode_switch | シャツ、ブラウス | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_v_6 | 47 | mode_switch | 厚い | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_v_7 | 47 | mode_switch | 作動する、する | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_v_8 | 47 | mode_switch | 役に立つ、便利な | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p47_v_9 | 47 | mode_switch | 時刻、時間 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p48_a1_1 | 48 | choice | Kenji ( like / likes ) dogs. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p48_a1_2 | 48 | choice | She ( speak / speaks ) Japanese. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p48_a1_3 | 48 | choice | Mr. Yamada ( teach / teaches ) English. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p48_a2_1 | 48 | mode_switch | Alex ________ the guitar. (play) | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p48_a2_2 | 48 | mode_switch | My father ________ this computer. (use) | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p48_a2_3 | 48 | mode_switch | He ________ to the park every Sunday. (go) | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p48_a3_1 | 48 | mode_switch | エレンはバッグをほしがっています。 Ellen ________ a bag. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p48_a3_2 | 48 | mode_switch | 私は毎朝バナナを食べます。 I ________ a banana every morning. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p48_a3_3 | 48 | mode_switch | ピーターは日曜日に日本語を勉強します。 Peter ________ Japanese on Sundays. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p49_b1_1 | 49 | word_order | 悠斗は毎週金曜日にサッカーを練習します。（固定の続き: Friday.） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p49_b1_2 | 49 | word_order | 私のイヌは速く走ります。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p49_b1_3 | 49 | word_order | 私の父はこのベッドを使います。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p49_b2_1 | 49 | mode_switch | Mike はラグビーをする。 Mike ________ ________ . | expand | 意味のまとまりを順に足して文を伸ばす形式にできる。 | medium |
| eng_p49_b2_2 | 49 | mode_switch | 彼はラグビーの試合をよく見る。 He often ________ ________ ________ . | repair / transform | 正答文と近い英文distractor（He often watch rugby games.）を、意味を保って段階修理できる。 | medium |
| eng_p49_b2_3 | 49 | mode_switch | 彼は週末に昼食を作る。 He ________ ________ on weekends. | repair | 正答文と近い英文distractor（He make lunch on weekends.）を、意味を保って段階修理できる。 | medium |
| eng_p49_b3_1 | 49 | mode_switch | Jill の出身：ドイツ。 This is Jill. ① She ________ ________ Germany. | repair | 正答文と近い英文distractor（She is in Germany.）を、意味を保って段階修理できる。 | medium |
| eng_p49_b3_2 | 49 | free_text | Jill の年齢を英語で表そう。 ② She ________ ________ . | expand | 意味のまとまりを順に足して文を作る形式にできるが、自由回答を固定しすぎない工夫が必要。 | high |
| eng_p49_b3_3 | 49 | mode_switch | 身近な人を1人選び、その人を Jill に紹介しよう。 This is ________ . | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p49_v_1 | 49 | mode_switch | 母、母親 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p49_v_10 | 49 | mode_switch | Tシャツを着ている ________ a T-shirt | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p49_v_11 | 49 | mode_switch | 私は週末にテレビゲームをする。 I play ________ games on weekends. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p49_v_2 | 49 | mode_switch | 父 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p49_v_3 | 49 | mode_switch | 住む、住んでいる | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p49_v_4 | 49 | mode_switch | 彼［彼女］らは、それらは | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p49_v_5 | 49 | mode_switch | （運動）選手、競技者 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p49_v_6 | 49 | mode_switch | チーム、組 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p49_v_7 | 49 | mode_switch | 場所、所、地域 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p49_v_8 | 49 | mode_switch | 彼らの教室 ________ classroom | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p49_v_9 | 49 | mode_switch | 鳥のような ________ a bird | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p50_a1_1 | 50 | choice | ( Do / Does ) Paulo speak English? | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p50_a1_2 | 50 | choice | Does Aoi ( like / likes ) soccer? | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p50_a1_3 | 50 | choice | My brother ( do / does ) not sing well. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p50_a2_1 | 50 | mode_switch | Does Maiko want the book? — Yes, she ________ . | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p50_a2_2 | 50 | mode_switch | Does Shinichi live in Osaka? — No, he ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p50_a3_1 | 50 | mode_switch | 結衣と健は納豆を食べますか。 ________ Yui and Ken eat natto? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p50_a3_2 | 50 | mode_switch | 私の母はこのコンピュータを使いません。 My mother ________ ________ ________ this computer. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p50_a3_3 | 50 | mode_switch | トムには兄弟がいますか。 ________ Tom ________ any brothers? | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p51_b1_1 | 51 | word_order | 久美は映画を見ますか。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p51_b1_2 | 51 | word_order | あなたのお兄さんは上手に泳ぎますか。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p51_b1_3 | 51 | word_order | 私のネコは牛乳を飲みません。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p51_b2_1 | 51 | word_order | 岡先生はたくさんイヌを飼っているの？ 1語 does を補って並べよう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p51_b2_2 | 51 | word_order | ううん。彼はイヌを飼っていないよ。 1語 does を補って並べよう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p51_b2_3 | 51 | word_order | 彼はネコをたくさんほしがっているよ。 1語 wants を補って並べよう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p51_b3_1 | 51 | mode_switch | Does Sota like music? | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p51_b3_2 | 51 | mode_switch | Does Sota play tennis? | expand | 意味のまとまりを順に足して文を作る形式にできるが、自由回答を固定しすぎない工夫が必要。 | high |
| eng_p51_v_1 | 51 | mode_switch | university［名］ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p51_v_2 | 51 | mode_switch | 演奏会、音楽会 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p51_v_3 | 51 | mode_switch | 観客、聴衆 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p51_v_4 | 51 | mode_switch | 兄、弟 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p51_v_5 | 51 | mode_switch | 彼［女］らを［に］、それらを［に］ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p51_v_6 | 51 | mode_switch | インターネットで on the ________ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p52_a1_1 | 52 | choice | ( Who / Whose ) room is this? | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p52_a1_2 | 52 | choice | Whose umbrella ( is / are ) that? | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p52_a1_3 | 52 | choice | ( Whose / What ) cap is that? | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p52_a2_1 | 52 | mode_switch | あれはだれのTシャツですか。— 私のものです。 | conversation | 相手の発話・会話状況が条件になり、返答から質問や発話を逆算できる。 | medium |
| eng_p52_a2_2 | 52 | mode_switch | これはだれのカップですか。— 私の弟のものです。 | conversation | 相手の発話・会話状況が条件になり、返答から質問や発話を逆算できる。 | medium |
| eng_p52_a3_1 | 52 | word_order | これはだれのボールですか。（固定の続き: this?） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p52_a3_2 | 52 | word_order | あれはだれのイヌですか。（固定の続き: that?） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p52_a3_3 | 52 | word_order | あのバイオリンは私のものです。（固定の文頭: That） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p53_b1_1 | 53 | word_order | これはだれの本ですか。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p53_b1_2 | 53 | word_order | それはトムのものです。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p53_b1_3 | 53 | word_order | あなたはなぜ音楽が好きなのですか。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p53_b2_1 | 53 | word_order | これはだれの帽子？ 1語 whose を補って並べよう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p53_b2_2 | 53 | word_order | あかりのだよ。 1語 Akari’s を補って並べよう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p53_b2_3 | 53 | word_order | あかりってだれ？ 1語 who を補って並べよう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p53_b3_1 | 53 | free_text | Whose bag is this? — （絵①の名札を見て答える） | expand | 意味のまとまりを順に足して文を作る形式にできるが、自由回答を固定しすぎない工夫が必要。 | high |
| eng_p53_b3_2 | 53 | mode_switch | 持ち主がわからない絵②のものについて、Tom に「だれのものか」をたずねよう。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p53_v_1 | 53 | mode_switch | 帽子 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p53_v_2 | 53 | mode_switch | あした［は］、あすは | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p53_v_3 | 53 | mode_switch | 待って。 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p53_v_4 | 53 | mode_switch | じゃあね。 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p53_v_5 | 53 | mode_switch | だれの | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p53_v_6 | 53 | mode_switch | タオル | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p53_v_7 | 53 | mode_switch | これは私のものです。 This is ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p53_v_8 | 53 | mode_switch | あの本はあなたのものですか。 Is that book ________ ? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p53_v_9 | 53 | mode_switch | それは彼女のものではありません。 It isn’t ________ . | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_p54_2_1 | 54 | mode_switch | 私の妹は毎日この写真を見ます。 My sister ________ ________ this picture every day. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_2_2 | 54 | mode_switch | 彼はこの国ではよく知られている歌手です。 He is a ________ singer in this country. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_2_3 | 54 | mode_switch | あなたはあの神秘的な動物を知っていますか。 Do you know that ________ animal? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_3_1 | 54 | free_text | シャーロック・ホームズは何に登場するキャラクターですか。 | 通常input | 自由記述・読解応答で複数の自然な表現があり、操作型へ固定しにくい。 | high |
| eng_p54_3_2 | 54 | free_text | シャーロック・ホームズはどこで人気がありますか。 | 通常input | 自由記述・読解応答で複数の自然な表現があり、操作型へ固定しにくい。 | high |
| eng_p54_4_1 | 54 | mode_switch | 小次郎（Kojiro）は世界的に有名なキャラクターです。 | repair | 正答文と近い英文distractor（Kojiro are a famous character around the world.）を、意味を保って段階修理できる。 | medium |
| eng_p54_4_2 | 54 | mode_switch | 彼はとてもたくましいです。 | repair / transform | 正答文と近い英文distractor（He are very tough.）を、意味を保って段階修理できる。 | medium |
| eng_p54_4_3 | 54 | mode_switch | 彼はたくさんの言語を話します。 | repair | 正答文と近い英文distractor（He speak many languages.）を、意味を保って段階修理できる。 | medium |
| eng_p54_v_1 | 54 | mode_switch | detective | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_v_10 | 54 | mode_switch | 難しい、困難な | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_v_2 | 54 | mode_switch | carefully | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_v_3 | 54 | mode_switch | solve | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_v_4 | 54 | mode_switch | confident | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_v_5 | 54 | mode_switch | tough | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_v_6 | 54 | mode_switch | 物、事 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_v_7 | 54 | mode_switch | 奇妙な、不思議な | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_v_8 | 54 | mode_switch | 事実 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p54_v_9 | 54 | mode_switch | 問題、やっかいなこと | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p55_1_1 | 55 | mode_switch | I like Yumi’s mother. 「Yumi’s mother」を代名詞に。 | role_change（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p55_1_2 | 55 | mode_switch | This is Ms. Sato’s bike. 「Ms. Sato’s」を代名詞に。 | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_p55_1_3 | 55 | mode_switch | This bag is Mr. Green’s. 「Mr. Green’s」を代名詞に。 | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_p55_1_4 | 55 | mode_switch | You and Hiroshi use the computer. 「You and Hiroshi」を代名詞に。 | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_p55_1_5 | 55 | mode_switch | Does Ichiro know Tomomi and me? 「Tomomi and me」を代名詞に。 | role_change | 主語・目的語など文中の役割と代名詞の語形を対応づけられる。 | low |
| eng_p55_2_1 | 55 | mode_switch | This is Ms. Kato. × He is Ken’s mother. 正しい語は？ | transform（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p55_2_2 | 55 | mode_switch | That is Ken’s father. I know × he. 正しい語は？ | role_change（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p55_2_3 | 55 | mode_switch | Yuki and I like tennis. × They play it after school. 正しく直そう。 | transform（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p56_1_1 | 56 | choice | Toru ( speak / speaks ) English well. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p56_1_2 | 56 | choice | Aki ( is / does ) not eat natto. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p56_1_3 | 56 | choice | ( Do / Does ) your dog swim? | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p56_1_4 | 56 | choice | ( Who / Whose ) bag is that? | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p56_2_1 | 56 | mode_switch | I practice soccer every day. 主語を She に → ________ soccer every day. | transform（実装済） | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p56_2_2 | 56 | mode_switch | Kate knows about anime. 疑問文に。 | repair（実装済） | 既存の段階型repair定義を利用できる。 | low |
| eng_p56_2_3 | 56 | mode_switch | My father watches TV. 否定文に。 | repair（実装済） | 既存の段階型repair定義を利用できる。 | low |
| eng_p56_3_1 | 56 | mode_switch | 私たちはインターネットでその試合を楽しめます。 We can enjoy the game ________ the ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p56_3_2 | 56 | mode_switch | 彼は中央公園のような公園に行きます。 He goes to parks ________ Chuo Park. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p56_3_3 | 56 | mode_switch | また明日。 ________ ________ tomorrow. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p56_4_1 | 56 | word_order | 彼はコーヒーが好きではありません。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p56_4_2 | 56 | word_order | 裕太は放課後にテニスをします。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p56_4_3 | 56 | word_order | あなたのお姉さんは日曜日に図書館へ行きますか。（固定の続き: Sundays?） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p57_5_1 | 57 | mode_switch | ① Takeshi（ラグビーが好き） | expand | 意味のまとまりを順に足して文を伸ばす形式にできる。 | medium |
| eng_p57_5_2 | 57 | mode_switch | ② 健は毎日英語を勉強する。 | repair | 正答文と近い英文distractor（He study English every day.）を、意味を保って段階修理できる。 | medium |
| eng_p57_6_1 | 57 | choice | Sachi の写真として最も合う説明を選ぼう。 | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p57_6_2 | 57 | mode_switch | Does Sachi walk Pochi every day? 3語以上で答えよう。 | repair | 正答文と近い英文distractor（No, she isn’t.）を、意味を保って段階修理できる。 | medium |
| eng_p57_6_3a | 57 | mode_switch | Sachi がバンドで担当している楽器は？ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p57_6_3b | 57 | mode_switch | Sachi がそのほかにできることは？ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p57_6_3c | 57 | mode_switch | Hana がそのほかにできることは？ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p57_6_3d | 57 | mode_switch | Daiki がそのほかにできることは？ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p59_1_1 | 59 | choice | I / he / Mr. Baker / they / Ken / Alex and Kumi / we のうち、he と Ken 以外の3人称単数は？ | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p59_2_1 | 59 | choice | Ken ( speak / speaks ) English. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p59_2_2 | 59 | choice | He ( live / lives ) in Kyoto. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p59_2_3 | 59 | choice | You ( want / wants ) a nice cap. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p59_2_4 | 59 | choice | They ( come / comes ) to school every day. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p59_2_5 | 59 | choice | Alex and Kumi ( sing / sings ) English songs. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p59_3_1 | 59 | mode_switch | 健はこのペンを使います。 Ken ________ this pen. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p59_3_2 | 59 | mode_switch | 私たちはあなたのお兄さんを知っています。 We ________ your brother. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p59_3_3 | 59 | mode_switch | 彩は毎朝学校へ行きます。 Aya ________ to school every morning. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p59_3_4 | 59 | mode_switch | ベーカー先生は英語を教えます。 Mr. Baker ________ English. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p59_3_5 | 59 | mode_switch | 順と私は毎週日曜日にテニスをします。 Jun and I ________ tennis on Sundays. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p59_3_6 | 59 | mode_switch | 彼女はよくゲームをします。 She often ________ games. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p59_4_1 | 59 | mode_switch | My mother × like animals very much. 正しい語は？ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p59_4_2 | 59 | mode_switch | My father often × studys English. 正しい語は？ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p59_4_3 | 59 | mode_switch | × My brothers sometimes watches movies. 正しく直そう。 | repair | 正答文と近い英文distractor（My brothers sometimes watches movies.）を、意味を保って段階修理できる。 | medium |
| eng_p60_1_1 | 60 | mode_switch | これは私の兄の写真です。 ________ is a ________ of my brother. | repair | 正答文と近い英文distractor（This are a picture of my brother.）を、意味を保って段階修理できる。 | medium |
| eng_p60_1_10 | 60 | mode_switch | 彼女はふつう11時に寝ます。 She ________ ________ to bed at 11. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p60_1_11 | 60 | mode_switch | トムは私の友達です。 Tom is my ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_12 | 60 | mode_switch | 彼はオーストラリア出身です。 He is ________ Australia. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_13 | 60 | mode_switch | 彼はバスケットボールを上手にします。 He plays basketball ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_14 | 60 | mode_switch | 彼と私はよくバスケットボールをします。 He and I ________ ________ basketball. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p60_1_15 | 60 | mode_switch | 私の友達の久美は動物が好きです。 My friend, Kumi, ________ animals. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_16 | 60 | mode_switch | 彼女はイヌ2匹とネコ1匹を飼っています。 She ________ two dogs and a cat. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_17 | 60 | mode_switch | 彼女は料理が得意です。 She is ________ at ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_18 | 60 | mode_switch | 彼女の誕生日は10月11日です。 ________ ________ is October 11. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_19 | 60 | mode_switch | 小松先生は音楽の先生です。 Ms. Komatsu is a ________ teacher. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_2 | 60 | mode_switch | 彼は20歳です。 He is ________ . | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p60_1_20 | 60 | mode_switch | 彼女はとても上手に歌を歌います。 She ________ very well. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_21 | 60 | mode_switch | 彼女はいつも親切です。 She is ________ ________ . | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p60_1_22 | 60 | mode_switch | 大谷翔平は野球選手です。 Ohtani Shohei is a baseball ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_23 | 60 | mode_switch | 彼はアメリカに住んでいます。 He ________ ________ the U.S.A. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_24 | 60 | mode_switch | 彼はとても有名です。 He is very ________ . | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p60_1_25 | 60 | mode_switch | 宇多田ヒカルは歌手です。 Utada Hikaru is a ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_26 | 60 | mode_switch | 彼女の歌はすばらしいです。 Her songs are ________ . | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p60_1_3 | 60 | mode_switch | 彼は福岡に住んでいます。 ________ ________ in Fukuoka. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_4 | 60 | mode_switch | 彼は音楽が好きです。 He ________ music. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_5 | 60 | mode_switch | 彼は本をたくさん持っています。 He ________ many books. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_6 | 60 | mode_switch | 私の姉は大学で勉強しています。 My sister ________ at university. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p60_1_7 | 60 | mode_switch | 彼女は英語を上手に話すことができます。 She ________ ________ English well. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_8 | 60 | mode_switch | 彼女はイギリスに行きたがっています。 She ________ ________ go to the U.K. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p60_1_9 | 60 | mode_switch | 彼女はときどき朝食を食べません。 She sometimes ________ ________ breakfast. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p61_2_1 | 61 | mode_switch | 彼は読書家です。 He ________ many books. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p61_2_2 | 61 | mode_switch | 私の姉はランチを作ります。 My sister ________ lunch. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p61_2_3 | 61 | mode_switch | 彼女は勉強熱心です。 She ________ hard. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p61_2_4 | 61 | mode_switch | トムは料理がとても上手です。 Tom ________ very well. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p61_2_5 | 61 | mode_switch | 阿部先生は、いつも私たちに話をかけてくれます。 Ms. Abe ________ ________ to us. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p61_2_6 | 61 | mode_switch | 由美はケーキが大好物です。 Yumi ________ cake. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p61_2_7 | 61 | mode_switch | 私の弟は足が遅い。 My brother ________ ________ fast. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p62_a1_1 | 62 | choice | I ( am / is ) running now. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p62_a1_2 | 62 | choice | The girls ( is / are ) waiting for the player now. | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p62_a1_3 | 62 | choice | My brother is ( plays / playing ) the guitar. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p62_a2_1 | 62 | mode_switch | Jim is ________ a computer now. (use) | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p62_a2_2 | 62 | mode_switch | They are ________ a movie now. (see) | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p62_a2_3 | 62 | mode_switch | The boys ________ playing baseball now. (is) | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p62_a3_1 | 62 | mode_switch | 私は今、泳いでいます。 I’m ________ now. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p62_a3_2 | 62 | mode_switch | 彼女たちは今、昼食をとっています。 They ________ ________ lunch now. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p62_a3_3 | 62 | mode_switch | エリックは今、手紙を書いています。 Eric ________ ________ a letter now. | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p63_b1_1 | 63 | word_order | アレックスはアンとテニスを練習しています。（固定の続き: Ann.） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p63_b1_2 | 63 | word_order | この鳥たちは水を飲んでいます。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p63_b1_3 | 63 | word_order | 誠と由美は今、花について話しています。（固定の文頭: Makoto and Yumi／固定の続き: now.） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p63_b2_1 | 63 | mode_switch | I practice the piano on weekends. → 私は今、ピアノを練習しています。 | repair / transform | 正答文と近い英文distractor（I practice the piano now.）を、意味を保って段階修理できる。 | medium |
| eng_p63_b2_2 | 63 | mode_switch | Ryo studies English every day. → 涼は今、英語を勉強しています。 | repair | 正答文と近い英文distractor（Ryo studies English now.）を、意味を保って段階修理できる。 | medium |
| eng_p63_b3_1 | 63 | mode_switch | 絵の Ken は何をしていますか。 Ken is ________ . | repair | 正答文と近い英文distractor（Ken is kick a ball.）を、意味を保って段階修理できる。 | medium |
| eng_p63_b3_2 | 63 | mode_switch | 絵の Miki は何をしていますか。 | conversation | 相手の発話・会話状況が条件になり、返答から質問や発話を逆算できる。 | medium |
| eng_p63_b3_3 | 63 | mode_switch | 公園内のほかの人物について「…は（今）…しています」と2文以上書こう。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p63_v_1 | 63 | mode_switch | 休憩 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p63_v_10 | 63 | mode_switch | 私自身のスケジュール my ________ schedule | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p63_v_2 | 63 | mode_switch | 学生、生徒 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p63_v_3 | 63 | mode_switch | 生活 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p63_v_4 | 63 | mode_switch | みんな | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p63_v_5 | 63 | mode_switch | 今、今は、現在は | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p63_v_6 | 63 | mode_switch | ケーキを買う ________ a cake | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p63_v_7 | 63 | mode_switch | 次の夏 ________ summer | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p63_v_8 | 63 | mode_switch | これらの本 ________ books | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p63_v_9 | 63 | mode_switch | 2つの授業の間に ________ two classes | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p64_a1_1 | 64 | choice | ( Do / Are ) you eating tempura? | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p64_a1_2 | 64 | choice | Is Alex ( goes / going ) to the park? | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p64_a1_3 | 64 | choice | Is she ( walking / walk ) her dog? | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p64_a2_1 | 64 | mode_switch | ________ you ________ the piano? (play) | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p64_a2_2 | 64 | mode_switch | ________ Kota ________ milk? (drink) | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p64_a2_3 | 64 | mode_switch | ________ Yuka and Mami ________ TV? (watch) | transform | 問題文・解説が時制、語順、否定／疑問などの形の変更を明示している。 | medium |
| eng_p64_a3_1 | 64 | mode_switch | あなたは理科を勉強していますか。 | repair / transform | 正答文と近い英文distractor（Do you study science?）を、意味を保って段階修理できる。 | medium |
| eng_p64_a3_2 | 64 | mode_switch | あなたのネコは走っていますか。 | repair / transform | 正答文と近い英文distractor（Does your cat run?）を、意味を保って段階修理できる。 | medium |
| eng_p64_a3_3 | 64 | mode_switch | あなたは英語が好きですか。 | repair / transform | 正答文と近い英文distractor（Are you liking English?）を、意味を保って段階修理できる。 | medium |
| eng_p64_a3_4 | 64 | mode_switch | ボブは今、部屋をそうじしていますか。 | repair / transform | 正答文と近い英文distractor（Does Bob clean his room now?）を、意味を保って段階修理できる。 | medium |
| eng_p65_b1_1 | 65 | word_order | あなたのお兄さんは今、コンピュータを使っていますか。（固定の続き: his computer now?） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p65_b1_2 | 65 | word_order | 生徒たちは試合を見ているのですか。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p65_b2_1 | 65 | word_order | 健は机を作っているの？ 1語 is を補おう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p65_b2_2 | 65 | word_order | Ken, 机を作っているの？ 1語 are を補おう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p65_b2_3 | 65 | word_order | ちがうよ。いすだよ。 1語 not を補おう。 | transform（実装済） / word_order | 既存interaction定義があり、通常回答モードも併用できる。 | low |
| eng_p65_b3_1 | 65 | mode_switch | Is Liz reading a book? 2文で答えよう。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p65_b3_2 | 65 | mode_switch | ほかの子どもたちについて「…は…していますか」と2つ以上質問を書こう。 | conversation | 相手の発話・会話状況が条件になり、返答から質問や発話を逆算できる。 | medium |
| eng_p65_v_1 | 65 | mode_switch | are not の短縮形 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p65_v_2 | 65 | mode_switch | ペンを買う ________ a pen | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p65_v_3 | 65 | mode_switch | 本を持ってくる ________ a book | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p65_v_4 | 65 | mode_switch | よくある考え a ________ idea | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p65_v_5 | 65 | mode_switch | あなたは何の種類の音楽が好きですか。 What ________ of music do you like? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p65_v_6 | 65 | mode_switch | イヌが好きな生徒もいれば、ネコが好きな生徒もいる。 ________ students like dogs. ________ like cats. | repair | 正答文と近い英文distractor（Some students like dogs. Another like cats.）を、意味を保って段階修理できる。 | medium |
| eng_p66_a1_1 | 66 | choice | ( Where / Which ) do you speak at home, Japanese or English? | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p66_a1_2 | 66 | choice | ( Who / Which ) do you want, a notebook or a pencil case? | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p66_a1_3 | 66 | choice | Which do you like, dogs ( and / or ) cats? | 通常choice | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p66_a2_1 | 66 | mode_switch | ________ do you study on Saturdays, English or science? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p66_a2_2 | 66 | mode_switch | ________ does your brother eat, apples ________ oranges? | repair / transform | 正答文と近い英文distractor（What does your brother eat, apples and oranges?）を、意味を保って段階修理できる。 | medium |
| eng_p66_a3_1 | 66 | word_order | あなたは牛乳と紅茶のどちらがほしいですか。（固定の続き: , milk or tea?） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p66_a3_2 | 66 | word_order | 結衣は鳥とネコのどちらを飼っていますか。（固定の文頭: Which does Yui have,） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p67_b1_1 | 67 | word_order | あなたは米とパンのどちらを食べますか。（固定の続き: , rice or bread?） | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p67_b1_2 | 67 | word_order | 私は米を食べます。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p67_b1_3 | 67 | word_order | あなたはこの映画のどんなことが好きですか。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p67_b2_1 | 67 | word_order | 英語と日本語、どっちが好き？ 1語 which を補おう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p67_b2_2 | 67 | word_order | 靴とバッグ、どっちがほしい？ 1語 which を補おう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p67_b2_3 | 67 | word_order | 動物園と水族館、どっちに行きたい？ 1語 or を補おう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p67_b2_4 | 67 | word_order | J-pop と K-pop、どっちが好き？ 1語 do を補おう。 | word_order | 既存token列を順に置き、正答prefixで途中フィードバックできる。 | low |
| eng_p67_b3_1 | 67 | mode_switch | Which do you like, udon or soba? に英語で答えよう。 | expand | 意味のまとまりを順に足して文を作る形式にできるが、自由回答を固定しすぎない工夫が必要。 | high |
| eng_p67_b3_2 | 67 | mode_switch | Which do you want to eat, sushi or ramen? に英語で答えよう。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p67_b3_3 | 67 | mode_switch | Peter に「AとBではどちらが食べたいですか」と質問を1つ書こう。 | expand / repair | 自由表現を意味単位で組み立てる案と、既存の誤文distractorを修理する案がある。 | high |
| eng_p67_v_1 | 67 | mode_switch | pasta［名］ | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p67_v_2 | 67 | mode_switch | 私たちの教室 ________ classroom | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p67_v_3 | 67 | mode_switch | わくわくします。 I’m ________ . | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p67_v_4 | 67 | mode_switch | 待ちきれません！ I can’t ________ ! | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_2_1 | 68 | mode_switch | 私たちは今、英語の授業を受けています。 We are ________ an English ________ now. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_2_2 | 68 | mode_switch | 彼らは自転車で学校に行くのですか。 Do they go to school ________ ________ ? | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_2_3 | 68 | mode_switch | 校外学習は10月3日にあります。 The ________ ________ is on October third. | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_3_1 | 68 | free_text | ケビンが送ったのは（ ）している写真です。 | 通常input | 自由記述・読解応答で複数の自然な表現があり、操作型へ固定しにくい。 | high |
| eng_p68_3_2 | 68 | free_text | ケビンの学校では、すべての生徒が（ ）を勉強し、（ ）か国語の中から選べます。 | 通常input | 自由記述・読解応答で複数の自然な表現があり、操作型へ固定しにくい。 | high |
| eng_p68_3_3 | 68 | free_text | 多くの生徒が（ ）を選びます。 | 通常input | 自由記述・読解応答で複数の自然な表現があり、操作型へ固定しにくい。 | high |
| eng_p68_3_4 | 68 | free_text | ケビンは日本の（ ）について知りたいと思っています。 | 通常input | 自由記述・読解応答で複数の自然な表現があり、操作型へ固定しにくい。 | high |
| eng_p68_4_1 | 68 | free_text | What picture is it? It’s a picture of Kevin’s ________ ________ . | 通常input | 自由記述・読解応答で複数の自然な表現があり、操作型へ固定しにくい。 | high |
| eng_p68_4_2 | 68 | free_text | Are the students serving lunch in the picture? ________ , they ________ . | 通常input | 自由記述・読解応答で複数の自然な表現があり、操作型へ固定しにくい。 | high |
| eng_p68_v_1 | 68 | mode_switch | Spanish | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_v_10 | 68 | mode_switch | すべての、全部の | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_v_2 | 68 | mode_switch | event | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_v_3 | 68 | mode_switch | ceremony | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_v_4 | 68 | mode_switch | serve | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_v_5 | 68 | mode_switch | 休暇、休み | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_v_6 | 68 | mode_switch | 親密な… | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_v_7 | 68 | mode_switch | 物語、話 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_v_8 | 68 | mode_switch | 外国の | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
| eng_p68_v_9 | 68 | mode_switch | 卒業 | 通常choice / input | 語彙・知識確認または短い穴埋めが中心で、現状の回答形式が簡潔。 | low |
