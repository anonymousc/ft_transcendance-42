const PROFILES_URL = process.env.PROFILES_URL || 'http://profiles:3002';

async function fetchUserInterests(userId) {
  try {
    const url = `${PROFILES_URL}/profiles/internal/${encodeURIComponent(userId)}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`[fetchUserInterests] profiles returned ${res.status} for userId=${userId}`);
      return null;
    }

    const json = await res.json();
    return json?.interests ?? null;
  } catch (err) {
    console.warn(`[fetchUserInterests] failed for userId=${userId}:`, err.message);
    return null;
  }
}

module.exports = { fetchUserInterests };
