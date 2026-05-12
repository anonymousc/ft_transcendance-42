const GATEWAY_ORIGIN = 'https://rihla.tech';
const LOCAL_HTTP_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/;
const LOCAL_WS_RE = /^wss?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/;

export function resolveGatewayUrl(value?: string): string {
  const raw = (value ?? '').trim();
  if (!raw) return GATEWAY_ORIGIN;
  if (LOCAL_HTTP_RE.test(raw)) return GATEWAY_ORIGIN;
  return raw;
}

export function resolveGatewayWebSocketUrl(
  value?: string,
  path = '/ws',
): string {
  const raw = (value ?? '').trim();
  if (!raw) return `wss://137.184.159.183${path}`;
  if (LOCAL_WS_RE.test(raw)) return `wss://137.184.159.183${path}`;
  return raw;
}

export const API_BASE_URL = resolveGatewayUrl(
  import.meta.env.VITE_API_URL as string | undefined,
);

export const PROFILES_BASE_URL = resolveGatewayUrl(
  import.meta.env.VITE_PROFILES_URL as string | undefined,
);

/**
 * Read response body as text and parse JSON. Avoids `res.json()` throwing
 * `Unexpected token '<'` when nginx/upstream returns an HTML error page.
 */
export async function parseApiJson(res: Response): Promise<unknown> {
  const text = await res.text();
  const t = text.trim();
  if (!t) return null;
  const looksHtml = /^<!DOCTYPE/i.test(t) || /^<html/i.test(t) || t.startsWith('<h');
  if (looksHtml) {
    const hint =
      res.status >= 500
        ? ' Planner may be down or the gateway returned an error page.'
        : ' Check that the URL hits the API (e.g. /plan/... under https://rihla.tech), not the SPA.';
    throw new Error(
      `Server returned HTML instead of JSON (HTTP ${res.status}).${hint}`,
    );
  }
  try {
    return JSON.parse(t);
  } catch {
    throw new Error(
      `Invalid JSON (HTTP ${res.status}): ${t.slice(0, 180)}${t.length > 180 ? '…' : ''}`,
    );
  }
}
