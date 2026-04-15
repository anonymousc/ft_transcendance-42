const GATEWAY_ORIGIN = 'https://localhost';
const LOCAL_HTTP_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/;

export function resolveGatewayUrl(value?: string): string {
  const raw = (value ?? '').trim();
  if (!raw) return GATEWAY_ORIGIN;
  if (LOCAL_HTTP_RE.test(raw)) return GATEWAY_ORIGIN;
  return raw;
}

export const API_BASE_URL = resolveGatewayUrl(
  import.meta.env.VITE_API_URL as string | undefined,
);

export const PROFILES_BASE_URL = resolveGatewayUrl(
  import.meta.env.VITE_PROFILES_URL as string | undefined,
);

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
