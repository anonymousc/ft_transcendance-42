const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

/**
 * @param {import('express').Request} req
 * @returns {Promise<string>}
 */
async function getValidGoogleAccessToken(req) {
  const cookie = req.headers.cookie || '';
  const res = await fetch(`${AUTH_SERVICE_URL}/auth/internal/google-token`, {
    headers: { cookie },
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok || !data.ok || !data.data?.accessToken) {
    const msg =
      data?.error?.message ||
      (res.status === 401
        ? 'Please sign in again to export to Google Calendar.'
        : 'No Google account linked. Please sign in with Google to use calendar export.');
    throw new Error(msg);
  }

  return data.data.accessToken;
}

module.exports = { getValidGoogleAccessToken };
