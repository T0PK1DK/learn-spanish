import { clamp } from "./util.js";

export const MINUTE = 60 * 1000;
export const DAY = 24 * 60 * 60 * 1000;
export const MIN_EASE = 1.3;
export const START_EASE = 2.5;
export const MASTERED_INTERVAL_DAYS = 21;
export const AGAIN_STEP_MS = 10 * MINUTE;

export const GRADE = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5
};

export const GRADE_LABELS = [
  { id: "again", label: "Again", hint: "Missed it", quality: GRADE.again },
  { id: "hard", label: "Hard", hint: "Recalled with effort", quality: GRADE.hard },
  { id: "good", label: "Good", hint: "Recalled cleanly", quality: GRADE.good },
  { id: "easy", label: "Easy", hint: "Too easy", quality: GRADE.easy }
];

export function newCardState(now = 0) {
  return {
    ease: START_EASE,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: now,
    learning: true
  };
}

export function easeDelta(quality) {
  const q = clamp(quality, 0, 5);
  return 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
}

export function nextEase(ease, quality) {
  return Math.max(MIN_EASE, Number((ease + easeDelta(quality)).toFixed(4)));
}

export function review(card, quality, now = Date.now()) {
  const current = {
    ease: START_EASE,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: now,
    learning: true,
    ...card
  };
  const ease = nextEase(current.ease, quality);

  if (quality < 3) {
    return {
      ease,
      interval: 0,
      reps: 0,
      lapses: current.lapses + 1,
      due: now + AGAIN_STEP_MS,
      learning: true
    };
  }

  let interval;
  let reps = current.reps + 1;
  if (current.learning || current.reps === 0) {
    interval = quality === GRADE.easy ? 4 : quality === GRADE.hard ? 1 : 1;
    if (current.reps >= 1) interval = quality === GRADE.easy ? 6 : 4;
  } else if (current.reps === 1) {
    interval = quality === GRADE.hard ? 3 : quality === GRADE.easy ? 8 : 6;
  } else {
    const factor = quality === GRADE.hard ? 1.2 : quality === GRADE.easy ? ease * 1.3 : ease;
    interval = Math.max(1, Math.round(current.interval * factor));
  }

  return {
    ease,
    interval,
    reps,
    lapses: current.lapses,
    due: now + interval * DAY,
    learning: false
  };
}

export function isDue(card, now = Date.now()) {
  if (!card) return true;
  return Number(card.due || 0) <= now;
}

export function isMastered(card) {
  return Boolean(card && !card.learning && card.interval >= MASTERED_INTERVAL_DAYS);
}

export function intervalLabel(card, now = Date.now()) {
  if (!card) return "new";
  if (card.learning && card.interval === 0) {
    const wait = Math.max(0, card.due - now);
    if (wait <= AGAIN_STEP_MS) return "in a few minutes";
    return "learning";
  }
  if (card.interval <= 1) return "tomorrow";
  if (card.interval < 7) return `in ${card.interval} days`;
  if (card.interval < 30) return `in ${Math.round(card.interval / 7)} weeks`;
  return `in ${Math.round(card.interval / 30)} months`;
}

export function qualityFromChoice(correct) {
  return correct ? GRADE.good : GRADE.again;
}

export function xpForGrade(quality) {
  if (quality >= GRADE.easy) return 12;
  if (quality >= GRADE.good) return 10;
  if (quality >= GRADE.hard) return 6;
  return 2;
}
