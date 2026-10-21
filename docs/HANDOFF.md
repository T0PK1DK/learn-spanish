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
- `js/store.js` — load/sanitize/import, review log with undo snapshots, streak/XP, newer-tab persist
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
5. **Review undo** — done. `applyReview` writes `previous` + habit `snapshot`; `undoLastReview` restores them or refuses legacy events that lack `previous`. Do not recompute SM-2 backwards.
6. **i18n of the chrome** — UI is English; leave phrase content in Latin American Spanish.

## Done in this improvement pass

- Review undo in the header and via `Z` / `Ctrl+Z`. Tests cover restore, first-card delete, and legacy refusal.
- Due today includes mastered cards whose interval has elapsed. Stats match the deck.
- Persist adopts a newer `updatedAt` from another tab so a filter-only tab cannot wipe reviews. `sanitizeSave` keeps the stored timestamp.
- Plaza fallback markup is escaped. Mission grades refresh the header stats without remounting WebGL.
- Mobile chrome is shorter: scrolling set chips, segmented modes/filters, 44px targets, name field under Progress. Card stays the hero, same idea as compact study screens on [Quizlet](https://mobbin.com/screens/818753de-b0a1-4e66-b033-95298fa217c4) and [Ahead](https://mobbin.com/screens/8a7ef66b-d0d9-47fb-b50b-ab77d765eb61).

Remaining lanes: audio pack, more plaza missions, FSRS, typing items in Quiz, chrome i18n.

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
