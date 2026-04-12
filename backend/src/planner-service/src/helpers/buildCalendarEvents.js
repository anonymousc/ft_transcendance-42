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
 * @param {string} createdAt
 * @param {number} dayNumber
 */
function tripDayBaseDate(createdAt, dayNumber) {
  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + Math.max(0, dayNumber - 1));
    return d;
  }
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + Math.max(0, dayNumber - 1));
  return start;
}

/**
 * @param {object} planRow TripPlan Prisma row (plan JSON + city + createdAt)
 * @returns {GoogleCalendarEvent[]}
 */
function buildCalendarEvents(planRow) {
  /** @type {GoogleCalendarEvent[]} */
  const events = [];
  const city = (planRow.city && String(planRow.city).trim()) || '';
  const days = planRow.plan?.days;
  if (!Array.isArray(days)) return events;

  for (const day of days) {
    if (!day) continue;
    const base = tripDayBaseDate(planRow.createdAt, day.day);
    const activities = day.activities;
    if (!Array.isArray(activities)) continue;

    for (const act of activities) {
      if (!act) continue;
      const nameStr = (act.name && String(act.name).trim()) || '';
      const descStr = (act.description && String(act.description).trim()) || '';
      if (!nameStr && !descStr) continue;

      const { hour, minute } = parseActivityTime(act.time);
      const startDate = new Date(base);
      startDate.setHours(hour, minute, 0, 0);
      const durationMin =
        act.duration_minutes && act.duration_minutes > 0 ? act.duration_minutes : 60;
      const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);

      const summary = nameStr || 'Stop';
      const addr = act.address && String(act.address).trim();
      /** @type {GoogleCalendarEvent} */
      const ev = {
        summary,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
      };
      if (descStr) ev.description = descStr;
      const location = addr || city;
      if (location) ev.location = location;
      events.push(ev);
    }
  }

  return events;
}

module.exports = { buildCalendarEvents };
