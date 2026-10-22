# Habla

A Latin American Spanish trainer that lives in the browser. Cards use spaced repetition. There is also a quiz, listening, speaking or typing, cloze sentences, and a 3D plaza where objects teach the words you need to order food or ask for directions.

Progress stays on the device. The same link can be shared; each person keeps their own reviews. There is no account and no passcode.

**Live site:** https://t0pk1dk.github.io/learn-spanish/

**Source:** https://github.com/T0PK1DK/learn-spanish

## Use it

Open the live link, or run `npm start` and visit `http://localhost:4173`. On iPhone: Share → Add to Home Screen.

- **Cards** — Spanish first. Flip, then rate Again / Hard / Good / Easy. The next due time is honest SM-2, not a binary “known” flag.
- **Undo** — take back the last review. Ease, interval, streak, and XP go back to the snapshot from before that tap, so a mis-tap cannot corrupt the scheduler.
- **Quiz / Listen / Cloze** — mixed recognition with better distractors.
- **Speak** — say or type the Spanish. Accents can be off and still count.
- **Plaza** — a small WebGL café, market, and street. Drag to look, tap objects, finish a three-step mission.
- **Due today / Still learning / All** — study the pile that is actually due. Mastered cards still return when SM-2 says they are due.
- **Streak** — a seven-day strip of study days. The count stays live through yesterday, then drops after a gap. Best streak is kept in the save.
- **Daily goal** — a short review target (default 12, from 4 to 40). The bar shows how many are left today.
- **Export / Import** — move a JSON file to another device. The name field lives here too, so the study screen stays short on a phone.

Sets: Greetings, Basics, Café, Food, Market, Around, Hotel, Family, Time, Numbers, Weather, Feelings.

## Why it is built this way

Comparable apps and 3D language games were reviewed first. Ideas were borrowed as product patterns only. See [docs/RESEARCH.md](docs/RESEARCH.md).

| Habla feature | Pattern taken from |
|---|---|
| Again / Hard / Good / Easy + intervals | [Anki / SM-2](https://docs.ankiweb.net/background.html) |
| Streak, XP, daily goal | [Duolingo habit loop](https://blog.duolingo.com/product-highlights/) |
| Scenario phrases | [Babbel-style dialogues](https://www.olesentuition.co.uk/single-post/which-app-should-i-use-to-learn-a-language-duolingo-memrise-babbel-quizlet-busuu) |
| Listen then choose | [Memrise / Pimsleur](https://www.langoly.com/memrise-vs-duolingo/) |
| Cloze in a sentence | [Clozemaster](https://www.clozemaster.com/l/spa-eng/intermediate-spanish-resources) |
| Object–word plaza missions | [Roblox language worlds](https://insiderbits.com/best-games/learn-spanish-on-roblox/) |

The next agent prompt lives in [docs/HANDOFF.md](docs/HANDOFF.md).

## Develop

```bash
npm test
npm start
```

`npm test` is the CI check. It runs Node’s built-in test runner against the scheduler, store migration, review undo, quiz generator, speech scorer, deck filters, and plaza quests.

The GitHub Pages workflow still publishes `main`. This project should not be deployed from a feature branch.

## Keyboard

On cards: Space flips, `1`–`4` rate, arrows move. `Z` or `Ctrl+Z` undoes the last review.
