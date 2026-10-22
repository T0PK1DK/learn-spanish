import test from "node:test";
import assert from "node:assert/strict";
import { GRADE } from "../js/srs.js";
import {
  applyReview,
  awardPlaza,
  canUndo,
  emptySave,
  migrateLegacy,
  parseImport,
  liveStreak,
  persistSave,
  sanitizeSave,
  statsFor,
  undoLastReview,
  weekMarks
} from "../js/store.js";

const NOW = Date.parse("2026-10-21T15:00:00Z");
const DAY = "2026-10-21";

function memoryStorage(start = {}) {
  const data = { ...start };
  return {
    getItem(key) { return Object.hasOwn(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = String(value); },
    data
  };
}

test("legacy known cards become scheduled SM-2 cards", () => {
  const save = migrateLegacy({
    name: "Traveler",
    set: "Café",
    i: 2,
    known: { "Café::Gracias": 1, "Greetings::Hola": 1 }
  }, NOW);
  assert.equal(save.displayName, "Traveler");
  assert.equal(save.set, "Café");
  assert.equal(save.cards["Greetings::Hola"].reps, 2);
  assert.equal(save.cards["Greetings::Hola"].learning, false);
  assert.ok(save.cards["Greetings::Hola"].due > NOW);
});

test("sanitizeSave drops unknown modes and bad dates", () => {
  const save = sanitizeSave({
    version: 2,
    mode: "hack",
    filter: "nope",
    lastStudyDay: "yesterday",
    cards: { bad: { ease: 9 }, "Café::Agua, por favor": { ease: 2.4, interval: 3, reps: 2, due: NOW, learning: false } }
  }, NOW);
  assert.equal(save.mode, "cards");
  assert.equal(save.filter, "due");
  assert.equal(save.lastStudyDay, "");
  assert.equal(save.cards.bad, undefined);
  assert.equal(save.cards["Café::Agua, por favor"].interval, 3);
});

test("parseImport rejects arrays and unknown versions", () => {
  assert.throws(() => parseImport("[]"), /object/);
  assert.throws(() => parseImport("{"), /JSON/);
  assert.throws(() => parseImport(JSON.stringify({ version: 99 })), /version/);
});

test("parseImport accepts a v1 dump", () => {
  const save = parseImport(JSON.stringify({ name: "", set: "Food", known: { "Food::El pan": 1 } }));
  assert.equal(save.set, "Food");
  assert.ok(save.cards["Food::El pan"]);
});

test("reviews increment streak across consecutive days", () => {
  let save = emptySave(NOW);
  save = applyReview(save, "Greetings::Hola", GRADE.good, NOW, "2026-10-20");
  save = applyReview(save, "Greetings::Gracias", GRADE.good, NOW, "2026-10-21");
  assert.equal(save.streak, 2);
  assert.equal(save.todayReviews, 1);
  save = applyReview(save, "Greetings::Adiós", GRADE.again, NOW, "2026-10-21");
  assert.equal(save.todayReviews, 2);
  assert.equal(save.streak, 2);
});

test("a skipped day resets the streak", () => {
  let save = emptySave(NOW);
  save = applyReview(save, "Greetings::Hola", GRADE.good, NOW, "2026-10-18");
  save = applyReview(save, "Greetings::Gracias", GRADE.good, NOW, "2026-10-21");
  assert.equal(save.streak, 1);
});

test("persist writes v2 JSON", () => {
  const storage = memoryStorage();
  persistSave(emptySave(NOW), storage, NOW);
  const stored = JSON.parse(storage.data["habla-v2"]);
  assert.equal(stored.version, 2);
  assert.equal(stored.displayName, "");
});

test("stats count mastered and due separately", () => {
  let save = emptySave(NOW);
  save = applyReview(save, "Greetings::Hola", GRADE.easy, NOW, DAY);
  const stats = statsFor(save, NOW, DAY);
  assert.equal(stats.today, 1);
  assert.ok(stats.total > 80);
  assert.ok(stats.learning >= 1);
});

test("awardPlaza reviews each object once", () => {
  const save = awardPlaza(emptySave(NOW), ["Café::Un café, por favor", "Café::Agua, por favor"], NOW, DAY);
  assert.equal(save.reviews.length, 2);
  assert.equal(save.todayReviews, 2);
});

test("applyReview stores a card snapshot so undo can restore ease", () => {
  let save = emptySave(NOW);
  save = applyReview(save, "Greetings::Hola", GRADE.good, NOW, DAY);
  const afterGood = save.cards["Greetings::Hola"];
  save = applyReview(save, "Greetings::Hola", GRADE.again, NOW + 1000, DAY);
  assert.equal(save.cards["Greetings::Hola"].reps, 0);
  assert.equal(save.cards["Greetings::Hola"].learning, true);
  assert.equal(canUndo(save), true);
  save = undoLastReview(save);
  assert.deepEqual(save.cards["Greetings::Hola"], afterGood);
  assert.equal(save.todayReviews, 1);
  assert.equal(save.reviews.length, 1);
});

test("undo of a first review removes the new card and habit counters", () => {
  let save = emptySave(NOW);
  save = applyReview(save, "Greetings::Hola", GRADE.easy, NOW, DAY);
  assert.equal(save.xp > 0, true);
  save = undoLastReview(save);
  assert.equal(save.cards["Greetings::Hola"], undefined);
  assert.equal(save.xp, 0);
  assert.equal(save.todayReviews, 0);
  assert.equal(save.streak, 0);
  assert.equal(save.lastStudyDay, "");
  assert.equal(canUndo(save), false);
});

test("legacy review events without a previous snapshot cannot undo", () => {
  const save = emptySave(NOW);
  save.cards["Greetings::Hola"] = { ease: 2.6, interval: 6, reps: 2, lapses: 0, due: NOW, learning: false };
  save.reviews = [{ id: "Greetings::Hola", quality: GRADE.good, at: NOW }];
  assert.equal(canUndo(save), false);
  const same = undoLastReview(save);
  assert.equal(same.cards["Greetings::Hola"].ease, 2.6);
});

test("sanitizeSave keeps a null previous snapshot", () => {
  const save = sanitizeSave({
    version: 2,
    updatedAt: NOW,
    reviews: [{ id: "Greetings::Hola", quality: 4, at: NOW, previous: null, snapshot: { xp: 0, todayXp: 0, todayReviews: 0, streak: 0, lastStudyDay: "", index: 0 } }]
  }, NOW);
  assert.equal(save.reviews[0].previous, null);
  assert.equal(canUndo(save), true);
});

test("a stale tab persist keeps newer reviews from the other tab", () => {
  const storage = memoryStorage();
  const first = persistSave(emptySave(NOW), storage, NOW);
  let reviewed = applyReview(first, "Greetings::Hola", GRADE.good, NOW, DAY);
  reviewed = persistSave(reviewed, storage, NOW + 1000);
  const stale = { ...first, filter: "all", updatedAt: NOW };
  const written = persistSave(stale, storage, NOW + 2000);
  assert.ok(written.cards["Greetings::Hola"]);
  assert.equal(written.filter, "all");
  assert.equal(written.reviews.length, 1);
});

test("live streak stays if yesterday was studied and dies after a gap", () => {
  const save = emptySave(NOW);
  save.streak = 4;
  save.lastStudyDay = "2026-10-20";
  assert.equal(liveStreak(save, "2026-10-21"), 4);
  save.lastStudyDay = "2026-10-18";
  assert.equal(liveStreak(save, "2026-10-21"), 0);
  assert.equal(statsFor(save, NOW, "2026-10-21").streak, 0);
  assert.equal(save.streak, 4);
});

test("weekMarks is seven days ending today and marks lastStudyDay", () => {
  const save = emptySave(NOW);
  save.lastStudyDay = "2026-10-21";
  const week = weekMarks(save, "2026-10-21");
  assert.equal(week.length, 7);
  assert.equal(week[0].day, "2026-10-15");
  assert.equal(week[6].day, "2026-10-21");
  assert.equal(week[6].done, true);
  assert.equal(week[6].today, true);
  assert.equal(week[5].done, false);
  assert.equal(week[6].label, "We");
});

test("best streak is kept when a later streak resets", () => {
  let save = emptySave(NOW);
  save = applyReview(save, "Greetings::Hola", GRADE.good, NOW, "2026-10-18");
  save = applyReview(save, "Greetings::Gracias", GRADE.good, NOW, "2026-10-19");
  assert.equal(save.streak, 2);
  assert.equal(save.bestStreak, 2);
  save = applyReview(save, "Greetings::Adiós", GRADE.good, NOW, "2026-10-21");
  assert.equal(save.streak, 1);
  assert.equal(save.bestStreak, 2);
});

test("sanitizeSave promotes a missing bestStreak from the current streak", () => {
  const save = sanitizeSave({
    version: 2,
    streak: 5,
    lastStudyDay: "2026-10-21",
    updatedAt: NOW
  }, NOW);
  assert.equal(save.bestStreak, 5);
});

test("undo restores bestStreak from the review snapshot", () => {
  let save = emptySave(NOW);
  save.streak = 3;
  save.bestStreak = 3;
  save.lastStudyDay = "2026-10-20";
  save = applyReview(save, "Greetings::Hola", GRADE.good, NOW, "2026-10-21");
  assert.equal(save.streak, 4);
  assert.equal(save.bestStreak, 4);
  save = undoLastReview(save);
  assert.equal(save.streak, 3);
  assert.equal(save.bestStreak, 3);
});

test("legacy undo snapshots without bestStreak keep the stored best", () => {
  const save = emptySave(NOW);
  save.bestStreak = 6;
  save.cards["Greetings::Hola"] = { ease: 2.6, interval: 6, reps: 2, lapses: 0, due: NOW, learning: false };
  save.reviews = [{
    id: "Greetings::Hola",
    quality: GRADE.good,
    at: NOW,
    previous: { ease: 2.5, interval: 1, reps: 1, lapses: 0, due: NOW, learning: false },
    snapshot: { lastStudyDay: "2026-10-21", streak: 1, todayReviews: 1, todayXp: 10, xp: 10, index: 0 }
  }];
  const undone = undoLastReview(save);
  assert.equal(undone.bestStreak, 6);
});

test("stats count a mastered card as due when its time has come", () => {
  const save = emptySave(NOW);
  save.cards["Greetings::Hola"] = {
    ease: 2.6,
    interval: 30,
    reps: 6,
    lapses: 0,
    due: NOW - 1000,
    learning: false
  };
  const stats = statsFor(save, NOW, DAY);
  assert.equal(stats.mastered, 1);
  assert.ok(stats.due >= 1);
});
