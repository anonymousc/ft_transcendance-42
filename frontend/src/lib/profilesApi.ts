import type { SuggestedStudent } from "@/features/friends/types";
import { flattenUserInterests } from "@/features/friends/utils";
import { PROFILES_BASE_URL } from "./api";
import type { InterestsProfile } from "./interestsOnboarding";

const ACCESS_TOKEN_STORAGE_KEY = "access_token";

function readAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(encodedName)) {
      return decodeURIComponent(part.slice(encodedName.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`;
}

function createCsrfToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

function ensureCsrfToken(): string {
  const existing = readCookie("csrf_token");
  if (existing) return existing;
  const created = createCsrfToken();
  writeCookie("csrf_token", created);
  return created;
}

function buildCsrfHeaders(extra?: HeadersInit): HeadersInit {
  const csrfToken = ensureCsrfToken();
  const accessToken = readAccessToken();
  return {
    ...(extra ?? {}),
    "X-CSRF-Token": csrfToken,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function buildAuthHeaders(extra?: HeadersInit): HeadersInit {
  const accessToken = readAccessToken();
  return {
    ...(extra ?? {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export interface Profile {
  id: string;
  userId: string;
  username: string | null;
  displayName?: string | null;
  avatar: string | null;
  bio: string | null;
  status?: string | null;
  interests?: InterestsProfile | null;
}

export async function fetchMyProfile(fallbackUserId?: string): Promise<Profile> {
  const res = await fetch(`${PROFILES_BASE_URL}/profiles/me`, {
    credentials: "include",
    headers: buildAuthHeaders(
      fallbackUserId ? { "X-User-Id": fallbackUserId } : undefined,
    ),
  });
  if (!res.ok) throw new Error("Failed to load profile");
  return (await res.json()) as Profile;
}

export async function patchMyInterests(
  profile: InterestsProfile,
  fallbackUserId?: string,
): Promise<Profile> {
  const res = await fetch(`${PROFILES_BASE_URL}/profiles/me`, {
    method: "PATCH",
    credentials: "include",
    headers: buildCsrfHeaders({
      "Content-Type": "application/json",
      ...(fallbackUserId ? { "X-User-Id": fallbackUserId } : {}),
    }),
    body: JSON.stringify({ interests: profile }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || "Failed to save interests");
  }
  return (await res.json()) as Profile;
}

export async function updateMyProfile(input: {
  name: string;
  description: string;
}): Promise<Profile> {
  const res = await fetch(`${PROFILES_BASE_URL}/profiles/me`, {
    method: "PUT",
    credentials: "include",
    headers: buildCsrfHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || "Failed to update profile");
  }
  return (await res.json()) as Profile;
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${PROFILES_BASE_URL}/uploads/avatar`, {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || "Failed to upload avatar");
  }

  const data = (await res.json()) as { avatarUrl?: string };
  return { avatarUrl: data.avatarUrl || "" };
}

export function toProfileAvatarUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) return null;
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) return avatarPath;
  return `${PROFILES_BASE_URL}${avatarPath}`;
}

/** Row from GET /profiles/search (JWT). */
export interface ProfileSearchHit {
  userId: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  interests: InterestsProfile | null;
}

export async function searchUsers(q: string): Promise<SuggestedStudent[]> {
  const trimmed = q.trim();
  const params = new URLSearchParams({ q: trimmed });
  const res = await fetch(`${PROFILES_BASE_URL}/profiles/search?${params}`, {
    credentials: "include",
    headers: buildAuthHeaders(),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const msg = Array.isArray(err.message) ? err.message.join(", ") : err.message;
    throw new Error(msg || "Search failed");
  }
  const rows = (await res.json()) as ProfileSearchHit[];
  return rows.map((row) => {
    const student: SuggestedStudent = {
      id: row.userId,
      name: row.displayName?.trim() || row.username,
      username: row.username,
      interests: flattenUserInterests(row.interests ?? undefined),
    };
    const url = toProfileAvatarUrl(row.avatar);
    if (url) student.avatar = url;
    return student;
  });
}
