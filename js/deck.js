import { phrasesIn } from "./data/sets.js";
import { isDue, isMastered } from "./srs.js";

export function decorate(phrases, save, now = Date.now()) {
  return phrases.map((word) => ({
    ...word,
    card: save.cards[word.id] || null,
    due: isDue(save.cards[word.id], now),
    mastered: isMastered(save.cards[word.id])
  }));
}

export function buildDeck(save, now = Date.now()) {
  const phrases = decorate(phrasesIn(save.set), save, now);
  if (save.filter === "all") return phrases;
  if (save.filter === "learning") {
    const weak = phrases.filter((word) => !word.mastered);
    return weak.length ? weak : phrases;
  }
  const reviews = phrases
    .filter((word) => word.card && word.due && !word.mastered)
    .sort((a, b) => a.card.due - b.card.due);
  const unseen = phrases.filter((word) => !word.card);
  const pile = reviews.concat(unseen);
  return pile.length ? pile : phrases;
}

export function clampIndex(index, length) {
  if (length <= 0) return 0;
  if (!Number.isFinite(index) || index < 0) return 0;
  if (index >= length) return 0;
  return index;
}

export function afterRemove(index, nextLength) {
  if (nextLength <= 0) return 0;
  return Math.min(index, nextLength - 1);
}
