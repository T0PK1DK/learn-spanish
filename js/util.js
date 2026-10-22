const ACCENT_MAP = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ü: "u",
  ñ: "n",
  Á: "a",
  É: "e",
  Í: "i",
  Ó: "o",
  Ú: "u",
  Ü: "u",
  Ñ: "n"
};

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function fillName(text, displayName) {
  const name = String(displayName || "").trim();
  return String(text).replaceAll("{name}", name || "…");
}

export function shuffle(list, random = Math.random) {
  const next = list.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function foldAccents(text) {
  return String(text).replace(/[áéíóúüñÁÉÍÓÚÜÑ]/g, (ch) => ACCENT_MAP[ch] || ch);
}

export function normalizeAnswer(text, { fold = true } = {}) {
  let value = String(text || "").toLowerCase().trim();
  value = value.replace(/[¿¡.,;:!?'"`]/g, " ");
  value = value.replace(/[—–-]/g, " ");
  if (fold) value = foldAccents(value);
  return value.replace(/\s+/g, " ").trim();
}

export function tokens(text, options) {
  const normalized = normalizeAnswer(text, options);
  return normalized ? normalized.split(" ") : [];
}

export function levenshtein(a, b) {
  const left = String(a);
  const right = String(b);
  const rows = left.length + 1;
  const cols = right.length + 1;
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) grid[i][0] = i;
  for (let j = 0; j < cols; j += 1) grid[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      grid[i][j] = Math.min(
        grid[i - 1][j] + 1,
        grid[i][j - 1] + 1,
        grid[i - 1][j - 1] + cost
      );
    }
  }
  return grid[left.length][right.length];
}

export function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(dayKey, days) {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return localDayKey(date);
}

export function weekdayShort(dayKey) {
  const [year, month, day] = String(dayKey).split("-").map(Number);
  if (!year || !month || !day) return "";
  return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][new Date(year, month - 1, day).getDay()];
}

export function wordId(setName, es) {
  return `${setName}::${es}`;
}

export function uniqueBy(list, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
