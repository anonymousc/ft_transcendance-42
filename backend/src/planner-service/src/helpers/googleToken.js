const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

function extractAuthErrorMessage(data) {
  if (!data || typeof data !== 'object') return null;
  if (typeof data.error?.message === 'string') return data.error.message;
  // Nest sometimes nests the custom body
  if (data.message && typeof data.message === 'object' && data.message.error?.message) {
    return String(data.message.error.message);
  }
  if (typeof data.message === 'string' && !data.message.startsWith('{')) return data.message;
  return null;
}

/**
 * @param {import('express').Request} req
 * @returns {Promise<string>}
 */
async function getValidGoogleAccessToken(req) {
  const headers = {};
  const cookie = req.headers.cookie || '';
  if (cookie) headers.cookie = cookie;
  const sessionJwt = req.cookies?.access_token;
  if (sessionJwt) headers.authorization = `Bearer ${sessionJwt}`;

  const res = await fetch(`${AUTH_SERVICE_URL}/auth/internal/google-token`, {
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok || !data.ok || !data.data?.accessToken) {
    const msg =
      extractAuthErrorMessage(data) ||
      (res.status === 401
        ? 'Please sign in again to export to Google Calendar.'
        : 'No Google account linked. Please sign in with Google to use calendar export.');
    throw new Error(msg);
  }

  return data.data.accessToken;
}

module.exports = { getValidGoogleAccessToken };
