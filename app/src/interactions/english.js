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
};
