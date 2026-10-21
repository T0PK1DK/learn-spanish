import { allPhrases, clozeFrom, phrasesIn } from "./data/sets.js";
import { shuffle, uniqueBy } from "./util.js";

export function lengthScore(a, b) {
  return Math.abs(String(a).length - String(b).length);
}

export function pickDistractors(item, pool, field, count, random = Math.random) {
  const answer = item[field];
  const candidates = uniqueBy(
    pool.filter((other) => other.id !== item.id && other[field] && other[field] !== answer),
    (other) => other[field]
  );
  const ranked = candidates.slice().sort((left, right) => {
    const sameSet = Number(right.set === item.set) - Number(left.set === item.set);
    if (sameSet) return sameSet;
    return lengthScore(left[field], answer) - lengthScore(right[field], answer);
  });
  const closest = ranked.slice(0, Math.max(count * 2, count));
  return shuffle(closest, random).slice(0, count);
}

export function makeQuestion(item, pool, kind, random = Math.random) {
  if (kind === "cloze") {
    const cloze = clozeFrom(item);
    const options = shuffle(
      [cloze.answer, ...pickDistractors(item, pool, "es", 3, random).map((word) => {
        const other = clozeFrom(word);
        return other.answer;
      })],
      random
    );
    return {
      id: item.id,
      set: item.set,
      kind,
      prompt: cloze.prompt,
      say: item.es,
      answer: cloze.answer,
      extra: cloze.full,
      options: uniqueBy(options, (value) => value).slice(0, 4)
    };
  }

  const toMeaning = kind === "listen" ? true : (kind === "produce" || kind === "speak") ? false : random() < 0.55;
  const promptField = toMeaning ? "es" : "en";
  const answerField = toMeaning ? "en" : "es";
  const options = [
    item[answerField],
    ...pickDistractors(item, pool, answerField, 3, random).map((word) => word[answerField])
  ];
  return {
    id: item.id,
    set: item.set,
    kind,
    prompt: item[promptField],
    say: item.es,
    answer: item[answerField],
    extra: item.hint,
    options: uniqueBy(shuffle(options, random), (value) => value).slice(0, 4)
  };
}

export function makeSession(phrases, { kind = "quiz", limit = 8, setName = "", random = Math.random } = {}) {
  const local = setName ? phrasesIn(setName) : phrases;
  const pool = local.length >= 4 ? local : allPhrases();
  const source = shuffle(pool, random).slice(0, Math.min(limit, pool.length));
  return source.map((item) => makeQuestion(item, pool, kind, random));
}

export function gradeChoice(question, choice) {
  return String(choice) === String(question.answer);
}
