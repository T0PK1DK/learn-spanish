import test from "node:test";
import assert from "node:assert/strict";
import { allPhrases } from "../js/data/sets.js";
import { gradeChoice, makeQuestion, makeSession, pickDistractors } from "../js/quiz.js";

const pool = allPhrases();
const coffee = pool.find((word) => word.id === "Café::Un café, por favor");

test("phrase bank has stable ids and no empty fields", () => {
  assert.ok(pool.length >= 90);
  for (const word of pool) {
    assert.ok(word.es && word.en && word.hint && word.exampleEs && word.exampleEn);
    assert.equal(word.id, `${word.set}::${word.es}`);
  }
});

test("distractors stay unique and prefer the same set", () => {
  const picks = pickDistractors(coffee, pool, "en", 3, () => 0.1);
  assert.equal(new Set(picks.map((word) => word.en)).size, picks.length);
  assert.ok(picks.every((word) => word.id !== coffee.id));
  assert.ok(picks.filter((word) => word.set === "Café").length >= 1);
});

test("quiz options include the answer exactly once", () => {
  const question = makeQuestion(coffee, pool, "quiz", () => 0.3);
  assert.equal(question.options.filter((option) => option === question.answer).length, 1);
  assert.ok(question.options.length >= 2);
  assert.equal(gradeChoice(question, question.answer), true);
  assert.equal(gradeChoice(question, "nope"), false);
});

test("listen questions prompt with Spanish and answer in English", () => {
  const question = makeQuestion(coffee, pool, "listen", () => 0.2);
  assert.equal(question.prompt, coffee.es);
  assert.equal(question.answer, coffee.en);
});

test("cloze hides part of the example", () => {
  const question = makeQuestion(coffee, pool, "cloze", () => 0.4);
  assert.match(question.prompt, /____/);
  assert.ok(question.answer.length > 1);
});

test("sessions honor the limit and stay inside the set when possible", () => {
  const session = makeSession(pool, { kind: "quiz", limit: 5, setName: "Numbers", random: () => 0.5 });
  assert.equal(session.length, 5);
  assert.ok(session.every((item) => item.set === "Numbers"));
});
