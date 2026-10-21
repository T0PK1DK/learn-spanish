# Handoff prompt

Copy everything under the line into a new Claude / Cursor session.

---

You are continuing work on **Habla**, a static Latin American Spanish trainer PWA in this repo.

## What this app is

Offline-first. No accounts. No passcode or PIN gate. Progress is `localStorage` key `habla-v2` (legacy `habla-v1` is migrated). Do not put personal names in UI copy, sample phrases, commits, or docs.

Live site (only after someone deploys `main`): https://t0pk1dk.github.io/learn-spanish/

## Current architecture

- `index.html` — shell + import map for Three.js
- `css/app.css` — warm dark UI
- `js/data/sets.js` — phrase bank (objects with `es`, `en`, `hint`, `exampleEs`, `exampleEn`)
- `js/srs.js` — SM-2-style scheduler (Again/Hard/Good/Easy, ease floor 1.3, 10-minute relearn)
- `js/store.js` — load/sanitize/import, review log, streak/XP
- `js/quiz.js` — same-set, similar-length unique distractors
- `js/speech.js` — Levenshtein + token overlap; accent-only differences pass
- `js/deck.js` — due / learning / all
- `js/scene.js` — WebGL plaza (café, market, street) with SVG-style fallback
- `js/app.js` — modes: cards, quiz, listen, speak, cloze, plaza
- `tests/*.test.js` — Node test runner (`npm test`)
- `docs/RESEARCH.md` — comparable apps and sources
- `.github/workflows/ci.yml` — tests only
- `.github/workflows/pages.yml` — deploys `main` only. **Do not deploy** unless a human explicitly asks.

## Product constraints

1. Borrow ideas, never copy code, assets, audio, or copy from Duolingo, Anki, Babbel, Roblox, etc.
2. Prefer the better learning algorithm even if it is slower (full SM-2, full edit-distance scoring, ranked distractors).
3. Keep the app usable as static files. No build step is required for GitHub Pages.
4. Three.js is loaded from jsDelivr via import map. Plaza must keep a non-WebGL fallback.

## Known next improvements

Pick one lane and finish it with tests:

1. **Audio pack** — optional recorded Latin American voices per phrase, still falling back to `speechSynthesis`. Cache in the service worker. Do not scrape commercial apps.
2. **More plaza missions** — hotel desk and weather street; wire missed objects into the due queue with the scene name on the card back.
3. **FSRS option** — keep SM-2 as default (small deck). Add FSRS only if you can test it against a fixture of reviews.
4. **Typing production in quiz** — a “type the Spanish” item type with the same scorer as Speak.
5. **Review undo** — the store already appends a review log; add an undo that reverts the last event without corrupting ease.
6. **i18n of the chrome** — UI is English; leave phrase content in Latin American Spanish.

## How to verify

```bash
npm test
npm start
```

Then click every mode, rate a card each way, import a bad file (must toast an error), finish a plaza mission, and check that a second tab does not wipe progress if you only read. If you change scheduling, add a unit test before the UI.

## Do not

- Deploy Pages from a feature branch
- Add hearts, energy, leagues, or anything that blocks study
- Add a PIN, passcode, or lock screen
- Put real people’s names in the phrase bank or examples
- Commit `node_modules` or secrets
