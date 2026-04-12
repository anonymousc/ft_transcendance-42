/**
 * @typedef {{ summary: string, description?: string, location?: string, start: { dateTime: string }, end: { dateTime: string } }} GoogleCalendarEvent
 */

/**
 * @param {string} time
 * @returns {{ hour: number, minute: number }}
 */
function parseActivityTime(time) {
  const t = String(time || '').trim();
  const m24 = t.match(/^(\d{1,2}):(\d{2})/);
  if (m24) {
    const hour = Math.min(23, Math.max(0, parseInt(m24[1], 10)));
    const minute = Math.min(59, Math.max(0, parseInt(m24[2], 10)));
    return { hour, minute };
  }
  const m12 = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)\b/i);
  if (m12) {
    let hour = parseInt(m12[1], 10);
    const minute = parseInt(m12[2], 10);
    const ap = m12[3].toLowerCase();
    if (ap === 'pm' && hour < 12) hour += 12;
    if (ap === 'am' && hour === 12) hour = 0;
    return {
      hour: Math.min(23, Math.max(0, hour)),
      minute: Math.min(59, Math.max(0, minute)),
    };
  }
  return { hour: 9, minute: 0 };
}

/**
 * Midnight UTC for trip day N (1-based), anchored on createdAt's calendar date in UTC.
 * Avoids NaN when dayNumber is missing and avoids server-local TZ shifting the trip anchor.
 *
 * @param {string|Date} createdAt
 * @param {number} dayNumber1Based
 */
function tripDayBaseDate(createdAt, dayNumber1Based) {
  const n = Number(dayNumber1Based);
  const offsetDays = Number.isFinite(n) && n >= 1 ? Math.floor(n - 1) : 0;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    const now = new Date();
    const y = now.getUTCFullYear();
    const mo = now.getUTCMonth();
    const d = now.getUTCDate();
    return new Date(Date.UTC(y, mo, d + offsetDays, 0, 0, 0, 0));
  }

  const y = created.getUTCFullYear();
  const mo = created.getUTCMonth();
  const d = created.getUTCDate();
  return new Date(Date.UTC(y, mo, d + offsetDays, 0, 0, 0, 0));
}

/** Google Calendar summary max length (chars). */
const SUMMARY_MAX = 1024;
const DESCRIPTION_MAX = 8000;

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

/**
 * @param {object} planRow TripPlan Prisma row (plan JSON + city + createdAt)
 * @returns {GoogleCalendarEvent[]}
 */
function buildCalendarEvents(planRow) {
  /** @type {GoogleCalendarEvent[]} */
  const events = [];
  const city = (planRow.city && String(planRow.city).trim()) || '';

  let planPayload = planRow.plan;
  if (typeof planPayload === 'string') {
    try {
      planPayload = JSON.parse(planPayload);
    } catch {
      planPayload = null;
    }
  }
  const days = planPayload?.days;
  if (!Array.isArray(days)) return events;

  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex];
    if (!day) continue;
    const dn = Number(day.day);
    const effectiveDay1Based =
      Number.isFinite(dn) && dn >= 1 ? dn : dayIndex + 1;
    const base = tripDayBaseDate(planRow.createdAt, effectiveDay1Based);
    const activities = day.activities;
    if (!Array.isArray(activities)) continue;

    for (const act of activities) {
      if (!act) continue;
      const nameStr = (act.name && String(act.name).trim()) || '';
      const descStr = (act.description && String(act.description).trim()) || '';
      if (!nameStr && !descStr) continue;

      const { hour, minute } = parseActivityTime(act.time);
      const y = base.getUTCFullYear();
      const mo = base.getUTCMonth();
      const d = base.getUTCDate();
      const startDate = new Date(Date.UTC(y, mo, d, hour, minute, 0, 0));
      if (Number.isNaN(startDate.getTime())) continue;

      let durationMin = Number(act.duration_minutes);
      if (!Number.isFinite(durationMin) || durationMin <= 0) durationMin = 60;
      durationMin = Math.min(durationMin, 24 * 60);

      const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);
      if (Number.isNaN(endDate.getTime()) || endDate.getTime() <= startDate.getTime()) continue;

      const summary = truncate(nameStr || 'Stop', SUMMARY_MAX);
      const addr = act.address && String(act.address).trim();
      /** @type {GoogleCalendarEvent} */
      const ev = {
        summary,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
      };
      if (descStr) ev.description = truncate(descStr, DESCRIPTION_MAX);
      const location = addr || city;
      if (location) ev.location = truncate(location, 1024);
      events.push(ev);
    }
  }

  return events;
}

module.exports = { buildCalendarEvents };
