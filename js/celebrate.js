import { GRADE } from "./srs.js";

export function celebrationFor({
  quality,
  correct,
  today,
  previousToday,
  goal,
  streak,
  previousStreak
} = {}) {
  const ok = correct === true || (Number.isFinite(quality) && quality >= GRADE.good);
  const prevToday = Math.max(0, Math.floor(Number(previousToday) || 0));
  const nextToday = Math.max(0, Math.floor(Number(today) || 0));
  const target = Math.max(0, Math.floor(Number(goal) || 0));
  const nextStreak = Math.max(0, Math.floor(Number(streak) || 0));
  const prevStreak = Math.max(0, Math.floor(Number(previousStreak) || 0));
  const goalJustMet = target > 0 && nextToday >= target && prevToday < target;
  const streakGrew = nextStreak > prevStreak && nextStreak > 1 && prevToday === 0;

  if (goalJustMet) return { kind: "goal", text: "Daily goal done" };
  if (streakGrew) return { kind: "streak", text: `${nextStreak}-day streak` };
  if (ok) return { kind: "ok", text: "Nice" };
  return null;
}
