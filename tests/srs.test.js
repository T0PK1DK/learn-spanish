import test from "node:test";
import assert from "node:assert/strict";
import {
  AGAIN_STEP_MS,
  DAY,
  GRADE,
  MIN_EASE,
  START_EASE,
  intervalLabel,
  isDue,
  isMastered,
  newCardState,
  nextEase,
  review,
  xpForGrade
} from "../js/srs.js";

const NOW = Date.parse("2026-10-21T12:00:00Z");

test("new cards start due and learning", () => {
  const card = newCardState(NOW);
  assert.equal(card.ease, START_EASE);
  assert.equal(card.reps, 0);
  assert.equal(isDue(card, NOW), true);
  assert.equal(isMastered(card), false);
});

test("Again resets reps and returns in minutes", () => {
  const learned = review(newCardState(NOW), GRADE.good, NOW);
  const failed = review(learned, GRADE.again, NOW + DAY);
  assert.equal(failed.reps, 0);
  assert.equal(failed.learning, true);
  assert.equal(failed.interval, 0);
  assert.equal(failed.lapses, 1);
  assert.equal(failed.due, NOW + DAY + AGAIN_STEP_MS);
  assert.ok(failed.ease >= MIN_EASE);
});

test("Good graduates through 1 day then 6 days", () => {
  const first = review(newCardState(NOW), GRADE.good, NOW);
  assert.equal(first.interval, 1);
  assert.equal(first.due, NOW + DAY);
  const second = review(first, GRADE.good, NOW + DAY);
  assert.equal(second.interval, 6);
  const third = review({ ...second, learning: false, reps: 2, interval: 6, ease: 2.5 }, GRADE.good, NOW);
  assert.equal(third.interval, Math.round(6 * 2.5));
});

test("ease never drops below 1.3", () => {
  let card = { ...newCardState(NOW), ease: 1.32 };
  for (let i = 0; i < 8; i += 1) card = review(card, GRADE.again, NOW);
  assert.equal(card.ease, MIN_EASE);
});

test("Easy stretches faster than Good", () => {
  const mature = { ease: 2.5, interval: 10, reps: 4, lapses: 0, due: NOW, learning: false };
  const good = review(mature, GRADE.good, NOW);
  const easy = review(mature, GRADE.easy, NOW);
  assert.ok(easy.interval > good.interval);
});

test("Hard uses a 1.2 factor on mature cards", () => {
  const mature = { ease: 2.5, interval: 10, reps: 4, lapses: 0, due: NOW, learning: false };
  const hard = review(mature, GRADE.hard, NOW);
  assert.equal(hard.interval, 12);
});

test("mastered means a long interval", () => {
  assert.equal(isMastered({ learning: false, interval: 21, reps: 5 }), true);
  assert.equal(isMastered({ learning: false, interval: 6, reps: 3 }), false);
});

test("interval labels stay human", () => {
  assert.equal(intervalLabel(null), "new");
  assert.equal(intervalLabel({ interval: 1, learning: false }, NOW), "tomorrow");
  assert.match(intervalLabel({ interval: 0, learning: true, due: NOW + 1000 }, NOW), /minutes|learning/);
});

test("ease formula matches SuperMemo SM-2", () => {
  assert.equal(nextEase(2.5, 5), 2.6);
  assert.equal(nextEase(2.5, 4), 2.5);
  assert.equal(nextEase(2.5, 3), 2.36);
});

test("XP rewards honest ratings", () => {
  assert.ok(xpForGrade(GRADE.easy) > xpForGrade(GRADE.good));
  assert.ok(xpForGrade(GRADE.again) > 0);
});
