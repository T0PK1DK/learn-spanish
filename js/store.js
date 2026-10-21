import { SET_ORDER, SETS, allPhrases } from "./data/sets.js";
import { GRADE, isMastered, newCardState, review, xpForGrade } from "./srs.js";
import { addCalendarDays, localDayKey } from "./util.js";

export const STORAGE_KEY = "habla-v2";
export const LEGACY_KEY = "habla-v1";
export const CURRENT_VERSION = 2;

export function emptySave(now = Date.now()) {
  return {
    version: CURRENT_VERSION,
    displayName: "",
    set: SET_ORDER[0],
    index: 0,
    mode: "cards",
    filter: "due",
    cards: {},
    xp: 0,
    streak: 0,
    lastStudyDay: "",
    dailyGoal: 12,
    todayReviews: 0,
    todayXp: 0,
    reviews: [],
    updatedAt: now
  };
}

export function migrateLegacy(legacy, now = Date.now()) {
  const save = emptySave(now);
  if (!legacy || typeof legacy !== "object") return save;
  save.displayName = String(legacy.name || "").trim();
  if (legacy.set && SET_ORDER.includes(legacy.set)) save.set = legacy.set;
  save.index = Number.isInteger(legacy.i) && legacy.i >= 0 ? legacy.i : 0;
  const known = legacy.known && typeof legacy.known === "object" ? legacy.known : {};
  for (const phrase of allPhrases()) {
    const legacyId = `${phrase.set}::${phrase.es}`;
    if (!known[phrase.id] && !known[legacyId]) continue;
    save.cards[phrase.id] = {
      ease: 2.6,
      interval: 6,
      reps: 2,
      lapses: 0,
      due: now + 6 * 24 * 60 * 60 * 1000,
      learning: false
    };
  }
  return save;
}

export function snapshotCard(card) {
  if (!card || typeof card !== "object") return null;
  return {
    ease: Number(card.ease) > 0 ? Number(card.ease) : 2.5,
    interval: Math.max(0, Number(card.interval) || 0),
    reps: Math.max(0, Math.floor(Number(card.reps) || 0)),
    lapses: Math.max(0, Math.floor(Number(card.lapses) || 0)),
    due: Number.isFinite(Number(card.due)) ? Number(card.due) : 0,
    learning: Boolean(card.learning)
  };
}

function sanitizeReviewEvent(event) {
  if (!event || typeof event.id !== "string" || !Number.isFinite(Number(event.at))) return null;
  const next = {
    id: event.id,
    quality: Number.isFinite(Number(event.quality)) ? Number(event.quality) : GRADE.good,
    at: Number(event.at)
  };
  if (Object.hasOwn(event, "previous")) {
    next.previous = event.previous === null ? null : snapshotCard(event.previous);
  }
  if (event.snapshot && typeof event.snapshot === "object") {
    next.snapshot = {
      lastStudyDay: /^\d{4}-\d{2}-\d{2}$/.test(event.snapshot.lastStudyDay || "") ? event.snapshot.lastStudyDay : "",
      streak: Math.max(0, Math.floor(Number(event.snapshot.streak) || 0)),
      todayReviews: Math.max(0, Math.floor(Number(event.snapshot.todayReviews) || 0)),
      todayXp: Math.max(0, Math.floor(Number(event.snapshot.todayXp) || 0)),
      xp: Math.max(0, Math.floor(Number(event.snapshot.xp) || 0)),
      index: Math.max(0, Math.floor(Number(event.snapshot.index) || 0))
    };
  }
  return next;
}

export function sanitizeSave(raw, now = Date.now()) {
  const base = emptySave(now);
  if (!raw || typeof raw !== "object") return base;
  const incoming = raw.version === CURRENT_VERSION
    ? raw
    : migrateLegacy(raw, now);
  const save = {
    ...base,
    displayName: String(incoming.displayName || incoming.name || "").trim(),
    set: SET_ORDER.includes(incoming.set) ? incoming.set : SET_ORDER[0],
    index: Number.isFinite(incoming.index) ? Math.max(0, Math.floor(incoming.index)) : 0,
    mode: ["cards", "quiz", "listen", "speak", "cloze", "plaza"].includes(incoming.mode)
      ? incoming.mode
      : "cards",
    filter: ["due", "learning", "all"].includes(incoming.filter) ? incoming.filter : "due",
    xp: Math.max(0, Math.floor(Number(incoming.xp) || 0)),
    streak: Math.max(0, Math.floor(Number(incoming.streak) || 0)),
    lastStudyDay: /^\d{4}-\d{2}-\d{2}$/.test(incoming.lastStudyDay || "") ? incoming.lastStudyDay : "",
    dailyGoal: Math.min(40, Math.max(4, Math.floor(Number(incoming.dailyGoal) || 12))),
    todayReviews: Math.max(0, Math.floor(Number(incoming.todayReviews) || 0)),
    todayXp: Math.max(0, Math.floor(Number(incoming.todayXp) || 0)),
    cards: {},
    reviews: [],
    version: CURRENT_VERSION,
    updatedAt: Number.isFinite(Number(incoming.updatedAt)) ? Number(incoming.updatedAt) : now
  };
  const cards = incoming.cards && typeof incoming.cards === "object" ? incoming.cards : {};
  for (const [id, card] of Object.entries(cards)) {
    if (typeof id !== "string" || !id.includes("::") || !card || typeof card !== "object") continue;
    save.cards[id] = snapshotCard(card);
  }
  if (Array.isArray(incoming.reviews)) {
    save.reviews = incoming.reviews.map(sanitizeReviewEvent).filter(Boolean).slice(-400);
  }
  return save;
}

export function loadSave(storage = globalThis.localStorage, now = Date.now()) {
  try {
    const fresh = storage?.getItem(STORAGE_KEY);
    if (fresh) return sanitizeSave(JSON.parse(fresh), now);
    const legacy = storage?.getItem(LEGACY_KEY);
    if (legacy) return sanitizeSave(JSON.parse(legacy), now);
  } catch {
    return emptySave(now);
  }
  return emptySave(now);
}

export function readStoredSave(storage = globalThis.localStorage, now = Date.now()) {
  try {
    const fresh = storage?.getItem(STORAGE_KEY);
    if (fresh) return sanitizeSave(JSON.parse(fresh), now);
  } catch {
    return null;
  }
  return null;
}

export function takeRemoteIfNewer(local, storage = globalThis.localStorage, now = Date.now()) {
  const stored = readStoredSave(storage, now);
  if (!stored || Number(stored.updatedAt || 0) <= Number(local.updatedAt || 0)) return local;
  return {
    ...stored,
    displayName: local.displayName,
    set: local.set,
    index: local.index,
    mode: local.mode,
    filter: local.filter
  };
}

export function persistSave(save, storage = globalThis.localStorage, now = Date.now()) {
  const incoming = takeRemoteIfNewer(save, storage, now);
  const next = { ...incoming, version: CURRENT_VERSION, updatedAt: now };
  storage?.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function parseImport(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Not valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Progress file must be an object");
  }
  if (parsed.version && parsed.version !== 1 && parsed.version !== 2) {
    throw new Error("Unknown progress version");
  }
  return sanitizeSave(parsed);
}

export function cardFor(save, id, now = Date.now()) {
  return save.cards[id] || newCardState(now);
}

export function applyReview(save, id, quality, now = Date.now(), day = localDayKey()) {
  const gained = xpForGrade(quality);
  const previous = save.cards[id] ? snapshotCard(save.cards[id]) : null;
  const snapshot = {
    lastStudyDay: save.lastStudyDay,
    streak: save.streak,
    todayReviews: save.todayReviews,
    todayXp: save.todayXp,
    xp: save.xp,
    index: save.index
  };
  const nextCard = review(cardFor(save, id, now), quality, now);
  return stampStudyDay({
    ...save,
    cards: { ...save.cards, [id]: nextCard },
    xp: save.xp + gained,
    todayXp: (save.lastStudyDay === day ? save.todayXp : 0) + gained,
    reviews: [...save.reviews, { id, quality, at: now, previous, snapshot }].slice(-400),
    updatedAt: now
  }, day);
}

export function canUndo(save) {
  const event = save?.reviews?.[save.reviews.length - 1];
  return Boolean(event && Object.hasOwn(event, "previous"));
}

export function undoLastReview(save) {
  if (!canUndo(save)) return save;
  const event = save.reviews[save.reviews.length - 1];
  const cards = { ...save.cards };
  if (event.previous) cards[event.id] = snapshotCard(event.previous);
  else delete cards[event.id];
  const snap = event.snapshot || {};
  return {
    ...save,
    cards,
    xp: Number.isFinite(snap.xp) ? snap.xp : save.xp,
    todayXp: Number.isFinite(snap.todayXp) ? snap.todayXp : save.todayXp,
    todayReviews: Number.isFinite(snap.todayReviews) ? snap.todayReviews : save.todayReviews,
    lastStudyDay: typeof snap.lastStudyDay === "string" ? snap.lastStudyDay : save.lastStudyDay,
    streak: Number.isFinite(snap.streak) ? snap.streak : save.streak,
    index: Number.isFinite(snap.index) ? snap.index : save.index,
    reviews: save.reviews.slice(0, -1)
  };
}

export function stampStudyDay(save, day = localDayKey()) {
  if (save.lastStudyDay === day) {
    return { ...save, todayReviews: save.todayReviews + 1 };
  }
  const yesterday = addCalendarDays(day, -1);
  const streak = !save.lastStudyDay
    ? 1
    : save.lastStudyDay === yesterday
      ? save.streak + 1
      : 1;
  return {
    ...save,
    lastStudyDay: day,
    streak,
    todayReviews: 1
  };
}

export function statsFor(save, now = Date.now(), day = localDayKey()) {
  const phrases = allPhrases();
  const bySet = {};
  for (const name of SET_ORDER) {
    bySet[name] = { total: (SETS[name] || []).length, mastered: 0, due: 0 };
  }
  let due = 0;
  let learning = 0;
  let mastered = 0;
  for (const phrase of phrases) {
    const card = save.cards[phrase.id];
    const bucket = bySet[phrase.set];
    if (!card || card.learning || card.reps === 0) {
      learning += 1;
      if (!card || card.due <= now) {
        due += 1;
        bucket.due += 1;
      }
      continue;
    }
    if (isMastered(card)) {
      mastered += 1;
      bucket.mastered += 1;
      if (card.due <= now) {
        due += 1;
        bucket.due += 1;
      }
      continue;
    }
    if (card.due <= now) {
      due += 1;
      bucket.due += 1;
    }
  }
  return {
    total: phrases.length,
    due,
    learning,
    mastered,
    bySet,
    goal: save.dailyGoal,
    today: save.lastStudyDay === day ? save.todayReviews : 0,
    todayXp: save.lastStudyDay === day ? save.todayXp : 0,
    streak: save.streak,
    xp: save.xp
  };
}

export function awardPlaza(save, ids, now = Date.now(), day = localDayKey()) {
  return ids.reduce((next, id) => applyReview(next, id, GRADE.good, now, day), save);
}
