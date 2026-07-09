/**
 * The Monday (ISO week start) for a given date, as a YYYY-MM-DD string in UTC.
 * Weekly Horizon rows are keyed by this (weekly_horizons.week_start, unique
 * per user + week).
 */
export function currentWeekStart(date: Date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}
