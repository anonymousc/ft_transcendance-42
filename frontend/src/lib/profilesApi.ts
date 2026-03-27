import { PROFILES_BASE_URL, ensureCsrfToken } from "./api";

export interface Profile {
  id: string;
  userId: string;
  username: string | null;
  displayName?: string | null;
  avatar: string | null;
  bio: string | null;
  status?: string | null;
}

export async function fetchMyProfile(): Promise<Profile> {
  const res = await fetch(`${PROFILES_BASE_URL}/profiles/me`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load profile");
  return (await res.json()) as Profile;
}

export async function updateMyProfile(input: {
  name: string;
  description: string;
}): Promise<Profile> {
  const csrf = await ensureCsrfToken();
  const res = await fetch(`${PROFILES_BASE_URL}/profiles/me`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || "Failed to update profile");
  }
  return (await res.json()) as Profile;
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const csrf = await ensureCsrfToken();
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${PROFILES_BASE_URL}/uploads/avatar`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": csrf },
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

