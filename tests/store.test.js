import test from "node:test";
import assert from "node:assert/strict";
import { GRADE } from "../js/srs.js";
import {
  applyReview,
  awardPlaza,
  emptySave,
  migrateLegacy,
  parseImport,
  persistSave,
  sanitizeSave,
  statsFor
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
