export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001';

export const PROFILES_BASE_URL =
  (import.meta.env.VITE_PROFILES_URL as string) || 'http://localhost:3002';

let cachedCsrfToken: string | null = null;

export async function ensureCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;
  const res = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: 'include' });
  const data = (await res.json().catch(() => ({}))) as { csrfToken?: string };
  if (!res.ok || !data.csrfToken) throw new Error('Failed to get CSRF token');
  cachedCsrfToken = data.csrfToken;
  return cachedCsrfToken;
}

export function clearCachedCsrfToken() {
  cachedCsrfToken = null;
}
