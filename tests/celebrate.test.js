import test from "node:test";
import assert from "node:assert/strict";
import { celebrationFor } from "../js/celebrate.js";
import { GRADE } from "../js/srs.js";

test("a clean recall gets a light cheer", () => {
  const note = celebrationFor({
    quality: GRADE.good,
    today: 1,
    previousToday: 0,
    goal: 12,
    streak: 1,
    previousStreak: 0
  });
  assert.equal(note.kind, "ok");
  assert.equal(note.text, "Nice");
});

test("a missed card stays quiet", () => {
  assert.equal(celebrationFor({
    quality: GRADE.again,
    today: 1,
    previousToday: 0,
    goal: 12,
    streak: 1,
    previousStreak: 0
  }), null);
});

test("Hard is recalled but does not throw a party", () => {
  assert.equal(celebrationFor({
    quality: GRADE.hard,
    today: 2,
    previousToday: 1,
    goal: 12,
    streak: 1,
    previousStreak: 1
  }), null);
});

test("quiz correctness is enough even without a grade", () => {
  assert.equal(celebrationFor({
    correct: true,
    today: 3,
    previousToday: 2,
    goal: 12,
    streak: 1,
    previousStreak: 1
  }).kind, "ok");
});

test("finishing the daily goal wins over a generic cheer", () => {
  const note = celebrationFor({
    quality: GRADE.easy,
    today: 12,
    previousToday: 11,
    goal: 12,
    streak: 3,
    previousStreak: 3
  });
  assert.equal(note.kind, "goal");
  assert.match(note.text, /goal/i);
});

test("the first review of a continued streak is called out", () => {
  const note = celebrationFor({
    quality: GRADE.good,
    today: 1,
    previousToday: 0,
    goal: 12,
    streak: 3,
    previousStreak: 2
  });
  assert.equal(note.kind, "streak");
  assert.equal(note.text, "3-day streak");
});

test("later reviews the same day do not repeat the streak cheer", () => {
  assert.equal(celebrationFor({
    quality: GRADE.good,
    today: 2,
    previousToday: 1,
    goal: 12,
    streak: 3,
    previousStreak: 3
  }).kind, "ok");
});
