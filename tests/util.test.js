import test from "node:test";
import assert from "node:assert/strict";
import {
  addCalendarDays,
  escapeHtml,
  fillName,
  foldAccents,
  levenshtein,
  localDayKey,
  normalizeAnswer,
  shuffle,
  uniqueBy,
  weekdayShort
} from "../js/util.js";

test("escapeHtml encodes markup", () => {
  assert.equal(escapeHtml(`<img src=x onerror="alert(1)">`), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
});

test("fillName never invents a personal name", () => {
  assert.equal(fillName("Me llamo {name}.", ""), "Me llamo ….");
  assert.equal(fillName("Me llamo {name}.", "Sam"), "Me llamo Sam.");
});

test("normalizeAnswer folds punctuation and accents when asked", () => {
  assert.equal(normalizeAnswer("¿Dónde está?"), "donde esta");
  assert.equal(normalizeAnswer("¿Dónde está?", { fold: false }), "dónde está");
});

test("levenshtein measures edits", () => {
  assert.equal(levenshtein("hola", "hola"), 0);
  assert.equal(levenshtein("hola", "holaa"), 1);
  assert.equal(levenshtein("", "ab"), 2);
});

test("shuffle is a permutation of the input", () => {
  const source = [1, 2, 3, 4, 5];
  const mixed = shuffle(source, () => 0.2);
  assert.deepEqual([...mixed].sort(), source);
  assert.notEqual(mixed, source);
});

test("uniqueBy keeps first of each key", () => {
  assert.deepEqual(uniqueBy(["aa", "bb", "aa", "cc"], (item) => item), ["aa", "bb", "cc"]);
});

test("local day math stays on calendar dates", () => {
  const day = localDayKey(new Date(2026, 9, 21));
  assert.equal(day, "2026-10-21");
  assert.equal(addCalendarDays("2026-10-21", -1), "2026-10-20");
  assert.equal(addCalendarDays("2026-01-01", -1), "2025-12-31");
  assert.equal(weekdayShort("2026-10-21"), "We");
});

test("foldAccents keeps n from ñ", () => {
  assert.equal(foldAccents("baño"), "bano");
});
