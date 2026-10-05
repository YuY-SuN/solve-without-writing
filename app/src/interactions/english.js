// Small, item-specific interaction definitions for the experimental English mode.
// These stay separate from workbook JSON while the interaction format is evaluated.
export const englishInteractionOverrides = {
  eng_p34_2_1: {
    type: "transform",
    initialState: "I am in the music club.",
    goalState: "He is in the music club.",
    steps: [
      {
        id: "subject",
        prompt: "まず、主語を he に変えてみましょう。",
        options: [
          { id: "he", label: "I → He にする", outcome: "progress", result: "He am in the music club.", nextStep: "be-verb", highlight: "am" },
        ],
      },
      {
        id: "be-verb",
        prompt: "主語が変わると、be動詞も合う形に変わります。",
        options: [
          { id: "is", label: "am → is", outcome: "progress", result: "He is in the music club.", complete: true },
          { id: "are", label: "am → are", outcome: "invalid", message: "主語 he に対して are は使いません。" },
          { id: "keep", label: "そのまま", outcome: "valid_but_detour", result: "He am in the music club.", message: "主語を he にした後も、be動詞の形を合わせる必要があります。" },
        ],
      },
    ],
  },
  eng_p34_2_2: {
    type: "transform",
    initialState: "This is Ms. Brown.",
    goalState: "Is this Ms. Brown?",
    steps: [{
      id: "question",
      prompt: "疑問文にするには、どの操作をしますか。",
      options: [
        { id: "move-is", label: "is を主語の前へ移す", outcome: "progress", result: "Is this Ms. Brown?", complete: true },
        { id: "does", label: "Does を文頭に加える", outcome: "invalid", message: "この文は be動詞 is を使う文です。疑問文を作るために does は使いません。" },
        { id: "question-mark", label: "語順はそのままで ? を付ける", outcome: "invalid", message: "be動詞の疑問文では、? を付けるだけでなく is を主語の前へ移します。" },
      ],
    }],
  },
  eng_p34_2_3: {
    type: "transform",
    moreHint: "「もの」をたずねる疑問詞を文の先頭に置き、その後ろに元の文の形を続けてみよう。",
    initialState: "That is a fox.",
    goalState: "What is that?",
    steps: [
      {
        id: "question-word",
        prompt: "“a fox” は、何についてたずねていますか。",
        options: [
          { id: "who", label: "人について聞く", outcome: "valid_but_detour", result: "Who is that?", message: "文としては成立しますが、Who は人をたずねます。今回は「もの」をたずねます。" },
          { id: "what", label: "ものについて聞く", outcome: "progress", result: "What ___ that?", nextStep: "be-verb", highlight: "___" },
        ],
      },
      {
        id: "be-verb",
        prompt: "What の後に続く be動詞を選びましょう。",
        options: [
          { id: "is", label: "is", outcome: "progress", result: "What is that?", complete: true },
          { id: "are", label: "are", outcome: "invalid", message: "that は1つのものを指すので、ここでは is を使います。" },
          { id: "does", label: "does", outcome: "invalid", message: "元の文は be動詞 is を使っています。疑問詞の後にも is を続けます。" },
        ],
      },
    ],
  },
  eng_p32_a3_1: {
    type: "word_order",
    moreHint: "疑問詞の後ろに、疑問文を作る語があるか見直してみよう。",
  },
  eng_p33_b1_1: {
    type: "word_order",
    moreHint: "主語・動詞・目的語のまとまりを意識してみよう。",
  },
  eng_p33_b1_2: {
    type: "word_order",
    moreHint: "疑問詞の後ろに続く文のまとまりを考えてみよう。",
  },
  eng_p34_4_1: {
    type: "word_order",
    moreHint: "Yes / No で答える疑問文の語順を思い出してみよう。",
  },
  eng_p34_4_2: {
    type: "word_order",
    moreHint: "not はbe動詞の後に置く語です。短い返事の形を見直してみよう。",
  },
  eng_p34_4_3: {
    type: "word_order",
    moreHint: "短い否定の返事で、主語とbe動詞の並びを見直してみよう。",
  },
  eng_p55_2_1: {
    type: "transform",
    initialState: "He is Ken’s mother.",
    goalState: "She is Ken’s mother.",
    steps: [{
      id: "subject-pronoun",
      prompt: "Ken’s mother を指す主語に直しましょう。",
      options: [
        { id: "she", label: "He → She にする", outcome: "progress", result: "She is Ken’s mother.", complete: true },
        { id: "her", label: "He → Her にする", outcome: "invalid", message: "文の主語には目的格 her ではなく、主格 she を使います。" },
      ],
    }],
  },
  eng_p55_1_1: {
    type: "role_change",
    initialState: "I like she.",
    goalState: "I like her.",
    steps: [{
      id: "object-pronoun",
      prompt: "she は like の後ろで、どんな役割ですか。",
      options: [
        { id: "subject", label: "動作する人", outcome: "invalid", message: "like の後ろは好きな相手を置く位置です。" },
        { id: "object", label: "動作の対象", outcome: "progress", result: "I like her.", complete: true },
      ],
    }],
  },
  eng_p55_2_2: {
    type: "role_change",
    initialState: "I know he.",
    goalState: "I know him.",
    steps: [{
      id: "pronoun-role",
      prompt: "he は know の後ろで、どんな役割ですか。",
      options: [
        { id: "subject", label: "動作する人", outcome: "invalid", message: "know の後ろは知っている相手を置く位置です。" },
        { id: "object", label: "動作の対象", outcome: "progress", result: "I know him.", complete: true },
      ],
    }],
  },
  eng_p55_2_3: {
    type: "transform",
    initialState: "They play it after school.",
    goalState: "We play it after school.",
    steps: [{
      id: "subject-reference",
      prompt: "Yuki and I を受ける主語に直しましょう。",
      options: [
        { id: "we", label: "They → We にする", outcome: "progress", result: "We play it after school.", complete: true },
        { id: "us", label: "They → Us にする", outcome: "invalid", message: "文の主語には目的格 us ではなく、主格 we を使います。" },
      ],
    }],
  },
  eng_p56_2_1: {
    type: "transform",
    initialState: "I practice soccer every day.",
    goalState: "She practices soccer every day.",
    steps: [
      {
        id: "subject",
        prompt: "まず、主語を She に変えましょう。",
        options: [
          { id: "she", label: "I → She にする", outcome: "progress", result: "She practice soccer every day.", nextStep: "verb", highlight: "practice" },
        ],
      },
      {
        id: "verb",
        prompt: "主語が変わったので、動詞も確認してみよう。",
        options: [
          { id: "practices", label: "practice → practices", outcome: "progress", result: "She practices soccer every day.", complete: true },
          { id: "keep", label: "そのまま", outcome: "invalid", message: "She は三人称単数なので、現在形の動詞の形も変わります。" },
        ],
      },
    ],
  },
  eng_p41_b2_1: {
    type: "transform",
    initialState: "I eat two apples.",
    goalState: "I ate two apples.",
    steps: [
      {
        id: "tense",
        prompt: "リンゴを食べたのは、いつのことですか。",
        options: [
          { id: "present", label: "今のこと", outcome: "valid_but_detour", result: "I eat two apples.", message: "これは今のことを表す形です。問題は過去の出来事です。" },
          { id: "past", label: "過去のこと", outcome: "progress", result: "I eat two apples.", nextStep: "past-verb", highlight: "eat", message: "過去のことになりました。動詞の形も見てみよう。" },
        ],
      },
      {
        id: "past-verb",
        prompt: "過去の eat はどの形になりますか。",
        options: [
          { id: "ate", label: "eat → ate", outcome: "progress", result: "I ate two apples.", complete: true },
          { id: "eated", label: "eat → eated", outcome: "invalid", message: "eat は -ed を付けるのではなく、不規則に形が変わります。" },
          { id: "eaten", label: "eat → eaten", outcome: "invalid", message: "ここでは過去分詞ではなく、単純過去の形を使います。" },
        ],
      },
    ],
  },
  eng_p56_2_2: {
    type: "repair",
    initialState: "Kate knows about anime.",
    goalState: "Does Kate know about anime?",
    steps: [
      {
        id: "question-form",
        prompt: "一般動詞の文を疑問文にするには、どうしますか。",
        options: [
          { id: "be-verb", label: "be動詞を文頭へ出す", outcome: "invalid", message: "この文の動詞は knows です。be動詞の is / am / are は使っていません。" },
          { id: "do-support", label: "Do / Does を文頭に加える", outcome: "progress", result: "Does Kate knows about anime?", nextStep: "verb-base", highlight: "knows", message: "Does が入りました。動詞の形も確認してみよう。" },
          { id: "question-mark", label: "語順はそのままで ? を付ける", outcome: "invalid", message: "一般動詞の疑問文では、助動詞を文頭に置きます。" },
        ],
      },
      {
        id: "verb-base",
        prompt: "Does を使ったので、動詞を確認しましょう。",
        options: [
          { id: "know", label: "knows → know", outcome: "progress", result: "Does Kate know about anime?", complete: true },
          { id: "keep", label: "そのまま", outcome: "invalid", message: "Does が三人称単数を表すので、動詞は原形に戻します。" },
        ],
      },
    ],
  },
  eng_p56_2_3: {
    type: "repair",
    initialState: "My father watches TV.",
    goalState: "My father does not watch TV.",
    steps: [
      {
        id: "negative",
        prompt: "一般動詞の文を否定文にしましょう。",
        options: [
          { id: "add-does-not", label: "does not を加える", outcome: "progress", result: "My father does not watches TV.", nextStep: "verb-base", highlight: "watches", message: "does を使ったので、動詞の形も確認してみよう。" },
        ],
      },
      {
        id: "verb-base",
        prompt: "does not を使ったとき、動詞はどの形ですか。",
        options: [
          { id: "watch", label: "watches → watch", outcome: "progress", result: "My father does not watch TV.", complete: true },
          { id: "keep", label: "そのまま", outcome: "invalid", message: "does が三人称単数を表すので、動詞は原形に戻します。" },
        ],
      },
    ],
  },
  eng_p43_b2_2: {
    type: "expand",
    initialState: "I want",
    goalState: "I want to watch soccer games.",
    steps: [
      {
        id: "action",
        prompt: "何をしたいですか。",
        options: [
          { id: "watch-games", label: "サッカーの試合を見る", outcome: "progress", result: "I want to watch", nextStep: "object" },
        ],
      },
      {
        id: "object",
        prompt: "何を見るのか、目的語を加えましょう。",
        options: [
          { id: "soccer-games", label: "soccer games を加える", outcome: "progress", result: "I want to watch soccer games.", complete: true },
        ],
      },
    ],
  },
  eng_p65_b2_3: {
    type: "transform",
    initialState: "No, I am.",
    goalState: "No, I am not.",
    steps: [{
      id: "be-negative",
      prompt: "be動詞を使った短い否定の返事にしましょう。",
      options: [
        { id: "add-not", label: "be動詞の後ろに not を加える", outcome: "progress", result: "No, I am not.", complete: true, highlight: "not" },
        { id: "front-not", label: "not を文頭に置く", outcome: "invalid", message: "この短い否定の返事では、not はbe動詞の後ろに置きます。" },
      ],
    }],
  },
  eng_p32_a2_1: {
    type: "repair",
    initialState: "Who this is?",
    goalState: "Who is this?",
    repairPrompt: "英文を見て、直したい語をタップしてみましょう。",
    repairSelectionPrompt: "疑問文の語順を整える操作を選びましょう。",
    hints: [
      "Who の次に続く語順を見直してみよう。",
      "be動詞を主語の前へ置く形になっていますか。",
    ],
    repairTargets: [{
      id: "move-be",
      token: "is",
      tokenIndex: 2,
      operations: [{
        id: "move-is",
        label: "be動詞を主語の前へ移す",
        result: "Who is this?",
        highlight: "is",
        outcome: "progress",
      }],
    }],
  },
  eng_p32_a2_2: {
    type: "repair",
    initialState: "He are my friend.",
    goalState: "He is my friend.",
    repairPrompt: "英文を見て、直したい語をタップしてみましょう。",
    repairSelectionPrompt: "主語とbe動詞を合わせる操作を選びましょう。",
    hints: [
      "主語と、その後ろの語の組み合わせを見てみよう。",
      "He のとき、be動詞はどの形になるかな。",
    ],
    repairTargets: [{
      id: "be-agreement",
      token: "are",
      tokenIndex: 1,
      operations: [{
        id: "change-to-is",
        label: "主語に合う be動詞にする",
        replacement: "is",
        highlight: "is",
        outcome: "progress",
      }],
    }],
  },
  eng_p33_b2_3: {
    type: "repair",
    initialState: "I like he.",
    goalState: "I like him.",
    repairPrompt: "英文を見て、直したい語をタップしてみましょう。",
    repairSelectionPrompt: "この語の文中での役割に合う形を選びましょう。",
    hints: [
      "動詞の後ろにある語が、文の中で何をしているか考えよう。",
      "「彼が好き」ではなく「彼を好き」です。語の役割に合う形かな。",
    ],
    repairTargets: [{
      id: "object-pronoun",
      token: "he",
      tokenIndex: 2,
      operations: [{
        id: "use-object-form",
        label: "動詞の対象として使う",
        replacement: "him",
        highlight: "him",
        outcome: "progress",
      }],
    }],
  },
  eng_p33_b3_1: {
    type: "repair",
    initialState: "He is Doraemon. I likes him.",
    goalState: "This is Doraemon. I like him.",
    repairPrompt: "英文を見て、直したい語をタップしてみましょう。",
    repairSelectionPrompt: "この部分を整える操作を選びましょう。",
    hints: [
      "紹介する文と、好きだと伝える文をそれぞれ見てみよう。",
      "2文の中で、主語に合わせて形が変わる語がありそうです。",
    ],
    repairTargets: [
      {
        id: "introduction-subject",
        token: "He",
        tokenIndex: 0,
        operations: [{
          id: "use-this-introduction",
          label: "紹介する文の主語を整える",
          replacement: "This",
          highlight: "This",
          outcome: "progress",
          message: "紹介する文が整いました。もう一か所見てみよう。",
        }],
      },
      {
        id: "verb-agreement",
        token: "likes",
        tokenIndex: 4,
        operations: [{
          id: "restore-base-verb",
          label: "主語に合う動詞の形にする",
          replacement: "like",
          highlight: "like",
          outcome: "progress",
        }],
      },
    ],
  },
  eng_p33_b3_2: {
    type: "repair",
    initialState: "This is Anya. Does you know her?",
    goalState: "This is Anya. Do you know her?",
    repairPrompt: "英文を見て、直したい語をタップしてみましょう。",
    repairSelectionPrompt: "主語に合う疑問文の形へ直しましょう。",
    hints: [
      "疑問文の初めにある語と主語の組み合わせを見てみよう。",
      "you を主語にした一般動詞の疑問文では、Do と Does のどちらかな。",
    ],
    repairTargets: [{
      id: "question-auxiliary",
      token: "Does",
      tokenIndex: 3,
      operations: [{
        id: "use-do",
        label: "主語に合う疑問文の語を使う",
        replacement: "Do",
        highlight: "Do",
        outcome: "progress",
      }],
    }],
  },
  eng_p41_b2_2: {
    type: "repair",
    initialState: "I seed pictures in the museum.",
    goalState: "I saw pictures in the museum.",
    repairPrompt: "英文を見て、直したい語をタップしてみましょう。",
    repairSelectionPrompt: "過去の出来事に合う動詞へ修理しましょう。",
    hints: [
      "過去のことを表す動詞の形に注目してみよう。",
      "see の過去形は不規則に変化します。",
    ],
    repairTargets: [{
      id: "past-tense",
      token: "seed",
      tokenIndex: 1,
      operations: [{
        id: "change-to-saw",
        label: "過去形として正しい形に直す",
        replacement: "saw",
        highlight: "saw",
        outcome: "progress",
      }],
    }],
  },
  eng_p35_5_1: {
    type: "conversation",
    initialState: "（質問を組み立てよう）",
    goalState: "Who is she?",
    partnerLabel: "相手の返事",
    partnerReply: "She is Maria.",
    hints: [
      "相手は何を答えていますか？",
      "Maria は人の名前ですね。",
      "人がだれなのか聞くときの疑問詞を考えてみよう。",
    ],
    steps: [
      {
        id: "intent",
        prompt: "どんなことを聞いた会話だろう？",
        options: [
          { id: "person-identity", label: "人がだれなのか聞く", outcome: "progress", result: "Who ___ ___ ?", nextStep: "subject", highlight: "Who" },
          { id: "what-about-person", label: "何者・何について聞く", outcome: "conversation_mismatch", message: "この返事は Maria という人の名前を答えています。What の質問とは少しずれていそうです。" },
          { id: "yes-no", label: "Yes / No で答えられることを聞く", outcome: "conversation_mismatch", message: "相手は Yes / No ではなく、女性の名前を答えています。だれなのかを聞く会話かもしれません。" },
        ],
      },
      {
        id: "subject",
        prompt: "誰について聞いている？",
        options: [
          { id: "she", label: "she", outcome: "progress", result: "Who ___ she?", nextStep: "be-verb", highlight: "she" },
          { id: "maria", label: "Maria", outcome: "conversation_mismatch", message: "Who is Maria? は Maria について聞く形です。相手が答えた Maria を、質問の対象と取り違えていないか考えてみよう。" },
          { id: "this", label: "this person", outcome: "conversation_mismatch", message: "この返事では女性を she と呼んでいます。返事の中の代名詞を使うと会話がつながりそうです。" },
        ],
      },
      {
        id: "be-verb",
        prompt: "she に続く be動詞を選びましょう。",
        options: [
          { id: "is", label: "is", outcome: "progress", result: "Who is she?", complete: true, highlight: "is" },
          { id: "are", label: "are", outcome: "grammar_invalid", message: "she は1人を表す主語なので、are とは組み合わせません。" },
          { id: "does", label: "does", outcome: "grammar_invalid", message: "この返事は be動詞 is を使っています。質問にも be動詞を使います。" },
        ],
      },
    ],
  },
  eng_p35_5_2: {
    type: "conversation",
    initialState: "（質問を組み立てよう）",
    goalState: "Is that your dog?",
    partnerLabel: "相手の返事",
    partnerReply: "Yes, it is.",
    hints: [
      "相手はどんな言葉で返事をしていますか？",
      "Yes / No で答えられる質問です。",
      "返事が it is なので、be動詞を使う質問を考えてみよう。",
    ],
    steps: [
      {
        id: "intent",
        prompt: "どんな質問なら “Yes, it is.” と答えられそう？",
        options: [
          { id: "yes-no", label: "Yes / No で答える質問", outcome: "progress", result: "___ ___ ___ ___?", nextStep: "topic" },
          { id: "person-identity", label: "人がだれかを聞く質問", outcome: "conversation_mismatch", message: "相手は人の名前ではなく、it を使って物について答えています。" },
          { id: "place", label: "場所を聞く質問", outcome: "conversation_mismatch", message: "Yes, it is. は場所を答える返事ではありません。Yes / No で答える質問を考えてみよう。" },
        ],
      },
      {
        id: "topic",
        prompt: "何について聞いている？",
        options: [
          { id: "dog", label: "あの犬のこと", outcome: "progress", result: "___ that your dog?", nextStep: "be-verb", highlight: "that your dog" },
          { id: "partner", label: "相手本人のこと", outcome: "conversation_mismatch", message: "相手の返事は it で物を受けています。人についての質問とは合わなそうです。" },
          { id: "dog-name", label: "犬の名前", outcome: "conversation_mismatch", message: "犬の名前を尋ねるなら、Yes, it is. だけでは名前を答えられません。" },
        ],
      },
      {
        id: "be-verb",
        prompt: "この質問をどの形で始める？",
        options: [
          { id: "is", label: "Is", outcome: "progress", result: "Is that your dog?", complete: true, highlight: "Is" },
          { id: "does", label: "Does", outcome: "grammar_invalid", message: "Does の後ろには一般動詞が必要です。この質問は be動詞の文なので Does は使いません。" },
          { id: "who", label: "Who", outcome: "grammar_invalid", message: "この質問は人を尋ねる形ではありません。be動詞を使った Yes / No 質問の形を考えよう。" },
        ],
      },
    ],
  },
  eng_p40_a2_1: {
    type: "transform",
    initialState: "I go to the park every Saturday.",
    goalState: "I went to the park last Saturday.",
    hints: ["文の中に過去を示す語があります。", "go は規則的に -ed を付ける動詞ではありません。"],
    steps: [
      { id: "time", prompt: "まず、いつのことかを過去に変えましょう。", options: [
        { id: "past-time", label: "毎週のことから、先週のことにする", outcome: "progress", result: "I go to the park last Saturday.", nextStep: "verb", highlight: "last Saturday" },
      ] },
      { id: "verb", prompt: "過去を表すために、動詞も変えましょう。", options: [
        { id: "went", label: "go → went", outcome: "progress", result: "I went to the park last Saturday.", complete: true },
        { id: "goed", label: "go → goed", outcome: "invalid", message: "go は -ed を付けず、形が不規則に変わります。" },
      ] },
    ],
  },
  eng_p40_a2_2: {
    type: "transform",
    initialState: "I see flowers in Hokkaido every spring.",
    goalState: "I saw flowers in Hokkaido.",
    hints: ["日本文は過去の出来事を表しています。", "see は形が変わる過去形です。"],
    steps: [{ id: "verb", prompt: "動詞を過去の形に変えましょう。", options: [
      { id: "saw", label: "see → saw", outcome: "progress", result: "I saw flowers in Hokkaido.", complete: true },
      { id: "seed", label: "see → seed", outcome: "invalid", message: "see は -ed を付けず、不規則に形が変わります。" },
    ] }],
  },
  eng_p40_a3_1: {
    type: "transform",
    initialState: "I see many beautiful fish every May.",
    goalState: "I saw many beautiful fish last May.",
    hints: ["last May は過去の時を示しています。", "see の過去形を考えよう。"],
    steps: [{ id: "verb", prompt: "過去の時に合う動詞へ変えましょう。", options: [
      { id: "saw", label: "see → saw", outcome: "progress", result: "I saw many beautiful fish last May.", complete: true },
    ] }],
  },
  eng_p40_a3_2: {
    type: "transform",
    initialState: "I enjoy hiking every summer.",
    goalState: "I enjoyed hiking last summer.",
    hints: ["last summer は過去の時を示しています。", "過去を表すのは enjoy の部分です。"],
    steps: [{ id: "verb", prompt: "過去の時に合う動詞へ変えましょう。", options: [
      { id: "enjoyed", label: "enjoy → enjoyed", outcome: "progress", result: "I enjoyed hiking last summer.", complete: true },
    ] }],
  },
  eng_p44_1_2: {
    type: "transform",
    initialState: "We enjoy running in the park every Saturday.",
    goalState: "We enjoyed running in the park last Saturday.",
    hints: ["last Saturday が過去を表しています。", "enjoy の後ろの running は動作を表すまとまりです。"],
    steps: [
      { id: "time", prompt: "文を過去の出来事にしましょう。", options: [
        { id: "past", label: "毎週から、この前の土曜日にする", outcome: "progress", result: "We enjoy running in the park last Saturday.", nextStep: "verb", highlight: "last Saturday" },
      ] },
      { id: "verb", prompt: "過去を表す動詞の形に直しましょう。", options: [
        { id: "enjoyed", label: "enjoy → enjoyed", outcome: "progress", result: "We enjoyed running in the park last Saturday.", complete: true },
      ] },
    ],
  },
  eng_p48_a3_1: {
    type: "transform",
    initialState: "I want a bag.",
    goalState: "Ellen wants a bag.",
    hints: ["文の主語を確認しよう。", "Ellen は1人なので、現在形の動詞も主語に合わせます。"],
    steps: [
      { id: "subject", prompt: "バッグをほしがっている人に主語を変えましょう。", options: [
        { id: "ellen", label: "I → Ellen にする", outcome: "progress", result: "Ellen want a bag.", nextStep: "verb", highlight: "want" },
      ] },
      { id: "verb", prompt: "主語が Ellen になったので、動詞を確認しましょう。", options: [
        { id: "wants", label: "want → wants", outcome: "progress", result: "Ellen wants a bag.", complete: true },
      ] },
    ],
  },
  eng_p48_a3_3: {
    type: "transform",
    initialState: "I study Japanese on Sundays.",
    goalState: "Peter studies Japanese on Sundays.",
    hints: ["主語が Peter に変わります。", "study は子音字 + y で終わる動詞です。"],
    steps: [
      { id: "subject", prompt: "勉強する人を Peter に変えましょう。", options: [
        { id: "peter", label: "I → Peter にする", outcome: "progress", result: "Peter study Japanese on Sundays.", nextStep: "verb", highlight: "study" },
      ] },
      { id: "verb", prompt: "主語に合わせて、現在形の動詞を直しましょう。", options: [
        { id: "studies", label: "study → studies", outcome: "progress", result: "Peter studies Japanese on Sundays.", complete: true },
      ] },
    ],
  },
  eng_p49_b2_2: {
    type: "transform",
    initialState: "They watch rugby games often.",
    goalState: "He often watches rugby games.",
    hints: ["主語は He です。", "頻度を表す often の位置と、動詞の形を見直そう。"],
    steps: [
      { id: "subject-adverb", prompt: "文の情報に合わせて主語と often の位置を整えましょう。", options: [
        { id: "he-often", label: "主語を He にし、often を動詞の前へ", outcome: "progress", result: "He often watch rugby games.", nextStep: "verb", highlight: "watch" },
      ] },
      { id: "verb", prompt: "He に合わせて動詞を変えましょう。", options: [
        { id: "watches", label: "watch → watches", outcome: "progress", result: "He often watches rugby games.", complete: true },
      ] },
    ],
  },
  eng_p50_a3_2: {
    type: "transform",
    initialState: "My mother uses this computer.",
    goalState: "My mother does not use this computer.",
    hints: ["一般動詞の否定には do / does を使います。", "does が入ったあとの動詞は原形です。"],
    steps: [
      { id: "negative", prompt: "一般動詞の文を否定にしましょう。", options: [
        { id: "does-not", label: "does not を加える", outcome: "progress", result: "My mother does not uses this computer.", nextStep: "base", highlight: "uses", message: "does not が入りました。動詞にも変化が必要そうです。" },
      ] },
      { id: "base", prompt: "does not の後ろの動詞を確認しましょう。", options: [
        { id: "use", label: "uses → use", outcome: "progress", result: "My mother does not use this computer.", complete: true },
      ] },
    ],
  },
  eng_p50_a3_3: {
    type: "transform",
    initialState: "Tom has brothers.",
    goalState: "Does Tom have any brothers?",
    hints: ["Tom は1人です。一般動詞の疑問文の形を考えよう。", "Does を使うと、have / has の形はどうなるでしょう。"],
    steps: [
      { id: "question", prompt: "一般動詞の文を疑問文にしましょう。", options: [
        { id: "does", label: "Does を文頭に置く", outcome: "progress", result: "Does Tom has any brothers?", nextStep: "verb", highlight: "has" },
      ] },
      { id: "verb", prompt: "Does の後ろの動詞を整えましょう。", options: [
        { id: "have", label: "has → have", outcome: "progress", result: "Does Tom have any brothers?", complete: true },
      ] },
    ],
  },
  eng_p63_b2_1: {
    type: "transform",
    initialState: "I practice the piano on weekends.",
    goalState: "I am practicing the piano now.",
    hints: ["on weekends は習慣、now は今していることを表します。", "今している動作には be動詞と -ing 形を使います。"],
    steps: [
      { id: "now", prompt: "習慣の文を「今していること」に変えましょう。", options: [
        { id: "present-progressive", label: "今している形にする", outcome: "progress", result: "I am practice the piano now.", nextStep: "verb", highlight: "practice", message: "今のことを表す形になりました。動詞も見直してみよう。" },
      ] },
      { id: "verb", prompt: "be動詞の後ろの動詞を -ing 形にしましょう。", options: [
        { id: "practicing", label: "practice → practicing", outcome: "progress", result: "I am practicing the piano now.", complete: true },
      ] },
    ],
  },
  eng_p62_a2_1: {
    type: "transform",
    initialState: "Jim is use a computer now.",
    goalState: "Jim is using a computer now.",
    steps: [{ id: "ing-form", prompt: "now があるので、動作を進行中の形にしましょう。", options: [
      { id: "drop-e", label: "use の e を取って -ing を加える", outcome: "progress", result: "Jim is using a computer now.", complete: true },
    ] }],
  },
  eng_p62_a2_2: {
    type: "transform",
    initialState: "They are see a movie now.",
    goalState: "They are seeing a movie now.",
    steps: [{ id: "ing-form", prompt: "now があるので、動作を進行中の形にしましょう。", options: [
      { id: "add-ing", label: "see に -ing を加える", outcome: "progress", result: "They are seeing a movie now.", complete: true },
    ] }],
  },
  eng_p62_a3_1: {
    type: "transform",
    initialState: "I am swim now.",
    goalState: "I am swimming now.",
    steps: [{ id: "ing-form", prompt: "進行中の動作を表す形にしましょう。", options: [
      { id: "double-consonant", label: "最後の m を重ねて -ing を加える", outcome: "progress", result: "I am swimming now.", complete: true },
    ] }],
  },
  eng_p62_a3_2: {
    type: "transform",
    initialState: "They eat lunch now.",
    goalState: "They are eating lunch now.",
    hints: ["now は今している動作を表します。", "進行形には be動詞と動詞の -ing 形が必要です。"],
    steps: [
      { id: "be", prompt: "主語 They に合う be動詞を加えましょう。", options: [
        { id: "are", label: "are を加える", outcome: "progress", result: "They are eat lunch now.", nextStep: "verb", highlight: "eat" },
      ] },
      { id: "verb", prompt: "進行中の動作を表す形に変えましょう。", options: [
        { id: "eating", label: "eat → eating", outcome: "progress", result: "They are eating lunch now.", complete: true },
      ] },
    ],
  },
  eng_p62_a3_3: {
    type: "transform",
    initialState: "Eric write a letter now.",
    goalState: "Eric is writing a letter now.",
    hints: ["Eric は1人です。", "現在進行形は be動詞 + -ing 形です。"],
    steps: [
      { id: "be", prompt: "主語 Eric に合う be動詞を加えましょう。", options: [
        { id: "is", label: "is を加える", outcome: "progress", result: "Eric is write a letter now.", nextStep: "verb", highlight: "write" },
      ] },
      { id: "verb", prompt: "進行中の動作を表す形に変えましょう。", options: [
        { id: "writing", label: "write → writing", outcome: "progress", result: "Eric is writing a letter now.", complete: true },
      ] },
    ],
  },
  eng_p64_a2_1: {
    type: "transform",
    initialState: "You play the piano.",
    goalState: "Are you playing the piano?",
    hints: ["今しているかをたずねています。", "現在進行形の疑問文は be動詞を主語の前に置きます。"],
    steps: [
      { id: "question", prompt: "今していることをたずねる形にしましょう。", options: [
        { id: "are-front", label: "Are を主語の前に置く", outcome: "progress", result: "Are you play the piano?", nextStep: "ing", highlight: "play" },
      ] },
      { id: "ing", prompt: "進行中の動作を表す形に直しましょう。", options: [
        { id: "playing", label: "play → playing", outcome: "progress", result: "Are you playing the piano?", complete: true },
      ] },
    ],
  },
  eng_p64_a2_2: {
    type: "transform",
    initialState: "Kota drinks milk.",
    goalState: "Is Kota drinking milk?",
    hints: ["Kota は1人です。", "進行形の疑問文は be動詞を前に置き、動作を -ing 形にします。"],
    steps: [
      { id: "question", prompt: "今しているかをたずねる形にしましょう。", options: [
        { id: "is-front", label: "Is を文頭に置く", outcome: "progress", result: "Is Kota drink milk?", nextStep: "ing", highlight: "drink" },
      ] },
      { id: "ing", prompt: "進行中の動作を表す形に直しましょう。", options: [
        { id: "drinking", label: "drink → drinking", outcome: "progress", result: "Is Kota drinking milk?", complete: true },
      ] },
    ],
  },
  eng_p64_a2_3: {
    type: "transform",
    initialState: "Yuka and Mami watch TV.",
    goalState: "Are Yuka and Mami watching TV?",
    hints: ["主語は2人です。", "進行形の疑問文では be動詞を主語の前に置きます。"],
    steps: [
      { id: "question", prompt: "今しているかをたずねる形にしましょう。", options: [
        { id: "are-front", label: "Are を主語の前に置く", outcome: "progress", result: "Are Yuka and Mami watch TV?", nextStep: "ing", highlight: "watch" },
      ] },
      { id: "ing", prompt: "進行中の動作を表す形に直しましょう。", options: [
        { id: "watching", label: "watch → watching", outcome: "progress", result: "Are Yuka and Mami watching TV?", complete: true },
      ] },
    ],
  },
  eng_p59_4_1: {
    type: "repair",
    initialState: "My mother like animals very much.",
    goalState: "My mother likes animals very much.",
    repairTargets: [{ id: "like", token: "like", tokenIndex: 2, operations: [
      { id: "likes", label: "主語に合わせて現在形にする", replacement: "likes", outcome: "progress" },
    ] }],
    hints: ["主語が1人か複数か見てみよう。", "My mother は3人称単数です。", "動詞の形を見直してみよう。"],
  },
  eng_p59_4_2: {
    type: "repair",
    initialState: "My father often studys English.",
    goalState: "My father often studies English.",
    repairTargets: [{ id: "studys", token: "studys", tokenIndex: 3, operations: [
      { id: "studies", label: "主語に合う現在形へ直す", replacement: "studies", outcome: "progress" },
    ] }],
    hints: ["主語 My father に合わせると、動詞はどうなるでしょう。", "study は子音字 + y で終わります。", "語尾の y の変化を考えよう。"],
  },
  eng_p59_4_3: {
    type: "repair",
    initialState: "My brothers sometimes watches movies.",
    goalState: "My brothers sometimes watch movies.",
    repairTargets: [{ id: "watches", token: "watches", tokenIndex: 3, operations: [
      { id: "watch", label: "複数の主語に合う形へ直す", replacement: "watch", outcome: "progress" },
    ] }],
    hints: ["主語が何人か見てみよう。", "My brothers は複数です。", "複数の主語に合う動詞の形を考えよう。"],
  },
  eng_p57_5_1: {
    type: "repair",
    initialState: "Takeshi like rugby.",
    goalState: "Takeshi likes rugby.",
    repairTargets: [{ id: "like", token: "like", tokenIndex: 1, operations: [
      { id: "likes", label: "主語 Takeshi に合う現在形へ直す", replacement: "likes", outcome: "progress" },
    ] }],
    hints: ["主語はだれですか。", "Takeshi は1人なので3人称単数です。", "一般動詞の語尾を見直そう。"],
  },
  eng_p57_5_2: {
    type: "repair",
    initialState: "He study English every day.",
    goalState: "He studies English every day.",
    repairTargets: [{ id: "study", token: "study", tokenIndex: 1, operations: [
      { id: "studies", label: "He に合う現在形へ直す", replacement: "studies", outcome: "progress" },
    ] }],
    hints: ["主語 He は1人です。", "study は子音字 + y で終わります。", "現在形の語尾を整えよう。"],
  },
  eng_p55_1_2: {
    type: "role_change",
    initialState: "This is Ms. Sato’s bike.",
    goalState: "This is her bike.",
    steps: [{ id: "ownership-role", prompt: "bike の前で、持ち主との関係をどう表しますか。", options: [
      { id: "possessive-adjective", label: "名詞の前で「彼女の」と表す", outcome: "progress", result: "This is her bike.", complete: true },
      { id: "possessive-pronoun", label: "名詞なしで「彼女のもの」と表す", outcome: "invalid", message: "ここには bike が続くので、名詞の前に置く所有の形を使います。" },
    ] }],
  },
  eng_p55_1_3: {
    type: "role_change",
    initialState: "This bag is Mr. Green’s.",
    goalState: "This bag is his.",
    steps: [{ id: "ownership-role", prompt: "名詞をくり返さず、「彼のもの」を表しましょう。", options: [
      { id: "possessive-pronoun", label: "名詞なしで所有を表す", outcome: "progress", result: "This bag is his.", complete: true },
      { id: "possessive-adjective", label: "後ろに名詞を続ける所有の形を使う", outcome: "invalid", message: "この文では所有する名詞 bag がすでに示されています。「彼のもの」を単独で表します。" },
    ] }],
  },
  eng_p55_1_5: {
    type: "role_change",
    initialState: "Does Ichiro know Tomomi and me?",
    goalState: "Does Ichiro know us?",
    steps: [{ id: "object-role", prompt: "know の後ろにある Tomomi and me は、文の中でどんな役割ですか。", options: [
      { id: "object-plural", label: "知っている相手を、ひとまとまりで表す", outcome: "progress", result: "Does Ichiro know us?", complete: true },
      { id: "subject-plural", label: "動作する人として表す", outcome: "invalid", message: "Tomomi and me は know の後ろにあり、知っている相手を表しています。" },
    ] }],
  },
  eng_p34_1_2: {
    type: "conversation",
    initialState: "（質問を組み立てよう）",
    goalState: "What is this?",
    partnerLabel: "相手の返事",
    partnerReply: "It’s a park.",
    hints: ["相手は park について答えています。", "人ではなく、物・場所について聞いています。", "答えが It’s なので、be動詞を使います。"],
    steps: [
      { id: "intent", prompt: "この返事から、何について聞いたと考えられますか。", options: [
        { id: "place", label: "場所・物について聞く", outcome: "progress", result: "What ___ this?", nextStep: "be", highlight: "What" },
        { id: "person", label: "人がだれか聞く", outcome: "conversation_mismatch", message: "相手は park という場所について答えています。人の名前を聞く会話とはずれています。" },
      ] },
      { id: "be", prompt: "返事と同じ be動詞を使って質問を完成しましょう。", options: [
        { id: "is", label: "is", outcome: "progress", result: "What is this?", complete: true },
        { id: "does", label: "does", outcome: "grammar_invalid", message: "返事は be動詞 is を使っています。ここでは does ではなく is を使います。" },
      ] },
    ],
  },
  eng_p34_1_3: {
    type: "conversation",
    initialState: "（質問を組み立てよう）",
    goalState: "Who is that?",
    partnerLabel: "相手の返事",
    partnerReply: "That is my friend.",
    hints: ["返事の中に my friend とあります。", "相手は人について答えています。", "人について「だれ」と聞く疑問詞を考えよう。"],
    steps: [
      { id: "intent", prompt: "この返事から、何について聞いた会話でしょう。", options: [
        { id: "person", label: "人がだれか聞く", outcome: "progress", result: "Who ___ that?", nextStep: "be", highlight: "Who" },
        { id: "thing", label: "物の名前を聞く", outcome: "conversation_mismatch", message: "相手は物の名前ではなく、my friend と人について答えています。" },
      ] },
      { id: "be", prompt: "返事と同じ be動詞を使って質問を完成しましょう。", options: [
        { id: "is", label: "is", outcome: "progress", result: "Who is that?", complete: true },
        { id: "are", label: "are", outcome: "grammar_invalid", message: "that は1人を指しています。この文では are ではなく is を使います。" },
      ] },
    ],
  },
  eng_p45_3_2: {
    type: "conversation",
    initialState: "（注文して、値段をたずねよう）",
    goalState: "I want the ramen with corn. How much is it?",
    partnerLabel: "店員の返事",
    partnerReply: "It’s ten dollars.",
    hints: ["最初に、注文する品を伝えます。", "値段を聞くときは How much を使います。", "返事の it’s に対応する疑問文の語順を考えよう。"],
    steps: [
      { id: "order", prompt: "最初に何を伝えますか。", options: [
        { id: "order-food", label: "ラーメンを注文する", outcome: "progress", result: "I want the ramen with corn.", nextStep: "price" },
        { id: "ask-price-first", label: "先に値段を聞く", outcome: "conversation_mismatch", message: "相手の返事は値段を答えています。まず何を注文したいか伝える流れです。" },
      ] },
      { id: "price", prompt: "値段を聞く質問を続けましょう。", options: [
        { id: "how-much", label: "How much is it? とたずねる", outcome: "progress", result: "I want the ramen with corn. How much is it?", complete: true },
      ] },
    ],
  },
  eng_p50_a2_1: {
    type: "conversation",
    initialState: "（質問に短く答えよう）",
    goalState: "Yes, she does.",
    partnerLabel: "質問",
    partnerReply: "Does Maiko want the book?",
    hints: ["質問は Does で始まっています。", "肯定の返事なら Yes を使います。", "Does の質問には does で答えます。"],
    steps: [
      { id: "polarity", prompt: "Maiko は本をほしがっています。どのように答えますか。", options: [
        { id: "yes", label: "肯定して答える", outcome: "progress", result: "Yes, ___ ___.", nextStep: "short-answer" },
        { id: "no", label: "否定して答える", outcome: "conversation_mismatch", message: "問題の答えは肯定です。相手の質問に Yes で応じる形を考えよう。" },
      ] },
      { id: "short-answer", prompt: "主語と、質問を受ける語を入れましょう。", options: [
        { id: "she-does", label: "she does", outcome: "progress", result: "Yes, she does.", complete: true },
        { id: "she-is", label: "she is", outcome: "grammar_invalid", message: "質問は一般動詞 want を Does でたずねています。be動詞 is では受けません。" },
      ] },
    ],
  },
  eng_p66_a2_2: {
    type: "conversation",
    initialState: "（2つの食べ物から選ぶ質問を作ろう）",
    goalState: "Which does your brother eat, apples or oranges?",
    hints: ["apples と oranges の2つから選ぶ質問です。", "your brother は1人なので do / does を考えよう。", "does の後ろは動詞の原形です。"],
    steps: [
      { id: "intent", prompt: "2つの候補から選ぶ質問では、何を聞きますか。", options: [
        { id: "which", label: "どちらを選ぶか聞く", outcome: "progress", result: "Which ___ your brother eat, apples ___ oranges?", nextStep: "auxiliary" },
        { id: "where", label: "場所を聞く", outcome: "conversation_mismatch", message: "返答候補は食べ物2つです。場所ではなく、どちらを選ぶか尋ねます。" },
      ] },
      { id: "auxiliary", prompt: "主語 your brother に合う疑問文の形を整えましょう。", options: [
        { id: "does-or", label: "does と or を入れる", outcome: "progress", result: "Which does your brother eat, apples or oranges?", complete: true },
        { id: "do-and", label: "do と and を入れる", outcome: "grammar_invalid", message: "your brother は1人なので does を使います。2つから選ぶ関係は or で表します。" },
      ] },
    ],
  },
};
