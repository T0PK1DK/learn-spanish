import { levenshtein, normalizeAnswer, tokens } from "./util.js";

export function tokenOverlap(expected, heard) {
  const left = new Set(tokens(expected));
  const right = tokens(heard);
  if (!left.size || !right.length) return 0;
  let hit = 0;
  for (const token of right) {
    if (left.has(token)) hit += 1;
  }
  return hit / Math.max(left.size, right.length);
}

export function scoreUtterance(expected, heard) {
  const foldedExpected = normalizeAnswer(expected, { fold: true });
  const foldedHeard = normalizeAnswer(heard, { fold: true });
  const exactExpected = normalizeAnswer(expected, { fold: false });
  const exactHeard = normalizeAnswer(heard, { fold: false });

  if (!foldedHeard) {
    return { ok: false, score: 0, accentOnly: false, empty: true };
  }
  if (exactHeard === exactExpected) {
    return { ok: true, score: 1, accentOnly: false, empty: false };
  }
  if (foldedHeard === foldedExpected) {
    return { ok: true, score: 0.96, accentOnly: true, empty: false };
  }

  const distance = levenshtein(foldedExpected, foldedHeard);
  const maxLen = Math.max(foldedExpected.length, foldedHeard.length, 1);
  const similarity = 1 - distance / maxLen;
  const overlap = tokenOverlap(expected, heard);
  const score = Number((similarity * 0.65 + overlap * 0.35).toFixed(3));
  return {
    ok: score >= 0.72,
    score,
    accentOnly: false,
    empty: false
  };
}

export function pickSpanishVoice(voices, preferred = /es-MX|es-US|es-419|es_MX/i) {
  const list = Array.isArray(voices) ? voices : [];
  return (
    list.find((voice) => preferred.test(voice.lang) || preferred.test(voice.name)) ||
    list.find((voice) => /^es/i.test(voice.lang)) ||
    null
  );
}
