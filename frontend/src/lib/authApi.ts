import { API_BASE_URL } from "./api";

function readErrorMessage(body: unknown, fallback: string): string {
  const o = body as {
    message?: string | string[];
    error?: { message?: string };
  };
  let m = o.message ?? o.error?.message;
  if (Array.isArray(m)) m = m.join(" ");
  if (typeof m === "string" && m.trim()) return m;
  return fallback;
}

export async function changeMyPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(readErrorMessage(err, "Could not change password"));
  }
}
