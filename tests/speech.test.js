import test from "node:test";
import assert from "node:assert/strict";
import { pickSpanishVoice, scoreUtterance } from "../js/speech.js";

test("exact speech matches", () => {
  const result = scoreUtterance("Un café, por favor", "Un café, por favor");
  assert.equal(result.ok, true);
  assert.equal(result.score, 1);
});

test("accent-only differences still pass", () => {
  const result = scoreUtterance("¿Dónde está el baño?", "Donde esta el bano");
  assert.equal(result.ok, true);
  assert.equal(result.accentOnly, true);
});

test("empty speech fails", () => {
  const result = scoreUtterance("Hola", "   ");
  assert.equal(result.ok, false);
  assert.equal(result.empty, true);
});

test("unrelated speech fails", () => {
  const result = scoreUtterance("Un café, por favor", "I would like a sandwich");
  assert.equal(result.ok, false);
});

test("small typos still pass with the slower full edit distance", () => {
  const result = scoreUtterance("Buenos días", "Buenos dias");
  assert.equal(result.ok, true);
});

test("voice picker prefers Latin American Spanish", () => {
  const voice = pickSpanishVoice([
    { lang: "en-US", name: "English" },
    { lang: "es-ES", name: "Spain" },
    { lang: "es-MX", name: "Mexico" }
  ]);
  assert.equal(voice.lang, "es-MX");
});
