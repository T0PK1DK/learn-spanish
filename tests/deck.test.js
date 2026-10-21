import test from "node:test";
import assert from "node:assert/strict";
import { afterRemove, buildDeck, clampIndex } from "../js/deck.js";
import { emptySave } from "../js/store.js";
import { AGAIN_STEP_MS } from "../js/srs.js";

const NOW = Date.parse("2026-10-21T12:00:00Z");

test("due filter prefers unseen cards in a fresh save", () => {
  const save = { ...emptySave(NOW), set: "Greetings", filter: "due" };
  const deck = buildDeck(save, NOW);
  assert.ok(deck.length > 0);
  assert.ok(deck.every((word) => word.set === "Greetings"));
});

test("learning filter hides mastered cards", () => {
  const save = emptySave(NOW);
  save.set = "Greetings";
  save.filter = "learning";
  save.cards["Greetings::Hola"] = {
    ease: 2.6,
    interval: 30,
    reps: 6,
    lapses: 0,
    due: NOW + 40 * 24 * 60 * 60 * 1000,
    learning: false
  };
  const deck = buildDeck(save, NOW);
  assert.ok(deck.every((word) => word.es !== "Hola"));
});

test("due filter orders soonest first", () => {
  const save = emptySave(NOW);
  save.set = "Greetings";
  save.filter = "due";
  save.cards["Greetings::Hola"] = {
    ease: 2.5, interval: 1, reps: 2, lapses: 0, due: NOW - 1000, learning: false
  };
  save.cards["Greetings::Gracias"] = {
    ease: 2.5, interval: 0, reps: 0, lapses: 1, due: NOW - AGAIN_STEP_MS, learning: true
  };
  const deck = buildDeck(save, NOW);
  assert.ok(deck.length >= 2);
  assert.ok(deck[0].card.due <= deck[1].card.due);
});

test("clampIndex wraps a spent pile back to the start", () => {
  assert.equal(clampIndex(9, 4), 0);
  assert.equal(clampIndex(-2, 4), 0);
  assert.equal(afterRemove(3, 3), 2);
  assert.equal(afterRemove(0, 0), 0);
});
