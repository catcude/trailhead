/**
 * Habit streak — consecutive days ending at today (or yesterday, so a streak
 * isn't "broken" the moment a new day starts before the user checks in). This
 * is the gentle-reset spirit (CLAUDE.md Streak System: "no shame messaging"):
 * we compute a number; the UI never scolds a reset to zero.
 *
 * `checkedOn` is a list of YYYY-MM-DD strings; `today` defaults to today (UTC).
 */
export function computeStreak(
  checkedOn: string[],
  today: string = new Date().toISOString().slice(0, 10),
): number {
  const days = new Set(checkedOn);
  const cursor = new Date(`${today}T00:00:00Z`);

  // Anchor at today if checked, else yesterday if checked, else no streak.
  if (!days.has(iso(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(iso(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(iso(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
