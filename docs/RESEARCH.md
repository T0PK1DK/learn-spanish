# Habla research notes

Comparable Spanish trainers, flashcard apps, and 3D language games reviewed before this upgrade. Ideas below were **borrowed as product patterns only**. No third-party code, art, audio, copy, or assets were copied.

Habla stays a small offline-first PWA: Latin American Spanish phrases, on-device progress, no account, no passcode gate.

## What Habla already had

Cards, a short multiple-choice quiz, device text-to-speech, binary “known / again,” set tabs, and local export/import. That covers recognition, not retention, listening, speaking, or context.

## Product direction taken from research

| Pattern | Source of the idea | What Habla implements (original) |
|---|---|---|
| Spaced repetition with Again / Hard / Good / Easy | Anki / SuperMemo SM-2 | Per-card ease, interval, reps, lapses, and due time. Failed cards return in minutes, then rebuild. |
| Daily streak, XP, and a small daily route | Duolingo habit loop | Optional streak + XP + “reviews today” goal. No leagues, hearts, or mascot path. |
| Scenario-first travel Spanish | Babbel dialogues | Café, market, street, hotel, and similar phrase sets tied to real tasks. |
| Listening before reading | Memrise / Pimsleur | Listen mode: hear Spanish, then choose the meaning. |
| Production, not only taps | Babbel / Pimsleur | Speak or type the Spanish from English. Fuzzy scoring, not a lock. |
| Cloze in a real sentence | Clozemaster / Anki | Hide one word in the example and ask for it. |
| Object–word scenes and quests | Roblox language worlds, LingoVerse, Crystallize | WebGL “Plaza” with a café, market, and street. Tap objects, hear Spanish, finish a short mission. |
| Due queue, not a binary known pile | Anki session UX | Due today / still learning / all. Show next interval in plain language. |
| Immediate feedback, answer hidden until flip | Flashcard research | Cards stay Spanish-first. Ratings appear only after the reveal. |
| Better distractors | Common quiz-trainer bugs | Same-set, similar-length unique options. No duplicate answers. |

## App-by-app notes

### Duolingo

Short mixed drills, streaks, XP, Stories, and speaking extras. Strong at getting people to open the app; weaker at durable recall and real conversation.

- Sources: [Duolingo product highlights](https://blog.duolingo.com/product-highlights/), [Spanish app roundup](https://www.polychatapp.com/blog/best-app-for-learning-spanish), [Mobbin Duolingo home / streak](https://mobbin.com/screens/b7578a37-b5f0-4921-a9c2-3b42bad94eb9)

### Babbel

Levelled lessons around practical dialogues, grammar tips, and speech recognition. Content is situational (order food, ask directions) rather than “the turtle eats the apple.”

- Sources: [Babbel vs Duolingo vs Memrise](https://www.olesentuition.co.uk/single-post/which-app-should-i-use-to-learn-a-language-duolingo-memrise-babbel-quizlet-busuu), [Android Authority on Babbel](https://www.androidauthority.com/goodbye-duolingo-i-found-much-better-language-learning-app-3653981/)

### Anki (SM-2 / FSRS)

Active recall, self-rating, expanding intervals. Ease starts at 2.5 and never drops below 1.3. First successes use short fixed intervals; later reviews multiply by ease. FSRS needs fewer reviews on large decks; SM-2 is transparent and works from day one on a small phrasebook.

- Sources: [Anki background](https://docs.ankiweb.net/background.html), [Anki deck options](https://docs.ankiweb.net/deck-options.html), [SM-2 explained](https://wordholder.com/blog/how-sm2-spaced-repetition-works), [RemNote SM-2 notes](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm), [FSRS vs SM-2](https://studyglen.com/guides/best-spaced-repetition-apps)

Habla uses a documented SM-2 core plus a short relearn step. That is the better scheduler for a small deck: predictable, testable, and needs no training data.

### Memrise, Drops, Clozemaster, Mondly

Memrise: native-speaker clips and SRS vocabulary. Drops: five-minute visual matching. Clozemaster: frequency sentences with a blank. Mondly: chatbot / AR experiments.

- Sources: [FluentU app comparison](https://www.fluentu.com/blog/learn/best-language-learning-apps/), [Memrise vs Duolingo](https://www.langoly.com/memrise-vs-duolingo/), [Clozemaster Spanish](https://www.clozemaster.com/l/spa-eng/intermediate-spanish-resources)

### Busuu, SpanishDict, LingQ, HelloTalk, Pimsleur

Busuu: CEFR units and community corrections. SpanishDict: lookup → example → optional SRS. LingQ: authentic text with tap-to-save words. HelloTalk: human partners. Pimsleur: listen–pause–speak audio.

- Sources: [Langoly Busuu review](https://www.langoly.com/busuu-review/), [SpanishDict](https://www.spanishdict.com/), [Pimsleur](https://www.pimsleur.com/), [Lingopie app list](https://lingopie.com/blog/best-language-learning-apps/)

### Roblox and 3D language games

Roblox experiences such as *Learn Spanish English* and “Spanish with Friends” put labels on objects, ask for typed Spanish to unlock progress, and run social missions in a café or plaza. Quality varies; the reusable idea is **language as a requirement for action**.

Immersive research (LingoVerse, Crystallize, VR language reviews) finds that NPC talk, object–word links, and short missions help more than visual realism.

- Sources: [Roblox Learn Spanish English](https://www.roblox.com/games/4506971721/learn-spanish-english-aprende-espa-ol-e-ingles), [Insiderbits: Spanish on Roblox](https://insiderbits.com/best-games/learn-spanish-on-roblox/), [Roblox multilingual education thread](https://devforum.roblox.com/t/roblox-the-multilingual-metaverse/1911348), [LingoVerse](https://link.springer.com/article/10.1007/s10055-025-01250-w), [Crystallize CHI 2017](https://www.cs.cornell.edu/~eland/papers/chi2017_vr.pdf), [VR language-learning review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10067892/), [Point-and-click Spanish games](https://lingtuitive.com/blog/6-best-spanish-point-and-click-games)

## Flashcard UX that actually sticks

- Hide the answer until the learner tries to recall it. Early reveal becomes rereading.
- One idea per card. Keep gender, region, and examples on the back.
- Mix directions: ES→EN, EN→ES, audio→meaning, sentence→blank.
- Rate after the reveal. “Hard” means recalled with effort, not wrong.
- Cap new cards. Show a due count and the next interval in words.
- Prefer production (type / speak) over four-option recognition when possible.

Sources: [Flashcard effectiveness overview](https://simplyputpsych.co.uk/psych-101-1/exploring-the-effectiveness-of-flashcards-for-learning-and-retention), [FLT Mag on SRS apps](https://fltmag.com/spaced-repetition-flashcard-apps/), [Card design notes](https://learnpathhub.org/posts/spaced-repetition-flashcards/)

## Bugs this upgrade specifically targets

Found in the previous Habla build or called out in trainer writeups:

1. Binary known/unknown threw away difficulty. Replaced with SM-2.
2. Default example name was a personal name. Examples now use an ellipsis until the learner types a display name.
3. “Still learning” + “Got it” could leave the index past the end of a shrinking deck.
4. Quiz options could collide or starve when the pool was tiny.
5. Import accepted any JSON and merged blindly.
6. Service worker cached failed or cross-origin responses.
7. Full re-render on every tap stole focus from the name field.
8. Timezone-naive “due” math. Due times are UTC milliseconds; the day key for streaks is a local calendar date only for the habit counter.

## UI references (patterns, not copies)

- [Duolingo streak calendar](https://mobbin.com/screens/b7578a37-b5f0-4921-a9c2-3b42bad94eb9)
- [Duolingo unit path](https://mobbin.com/screens/fac0e197-2364-48f1-bc26-be8ddf392179)
- [Quizlet multiple-choice drill](https://mobbin.com/screens/2c70f24d-ad39-4ca6-9c05-2c4c8f9539ec)
- [Ahead cloze / fill-in](https://mobbin.com/screens/ac375a0d-8dd0-49cb-9951-a7ba87f1a014)

## What we did not take

Hearts or energy that block study. Competitive leagues. A copied mascot or path map. Community chat. PIN or passcode gates. Scraped dictionaries. Third-party audio or 3D packs. Personal names in sample copy.
