import { toProfileAvatarUrl, type Profile } from "@/lib/profilesApi";
import type { ChatConversationRow, ChatMessageRow } from "@/lib/friendsApi";
import type { ChatUser, Conversation, Message } from "../types";

export function apiMessageToMessage(row: ChatMessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    content: row.content,
    timestamp: new Date(row.createdAt),
    status: "sent",
  };
}

export function profileToChatUser(peerId: string, profile: Profile | null): ChatUser {
  if (!profile) {
    return {
      id: peerId,
      name: peerId ? `User ${peerId.slice(0, 8)}` : "Unknown",
      isOnline: false,
    };
  }
  const name =
    profile.displayName?.trim() || profile.username?.trim() || "User";
  const u: ChatUser = {
    id: peerId,
    name,
    isOnline: profile.status === "online",
  };
  const avatarUrl = toProfileAvatarUrl(profile.avatar);
  if (avatarUrl) u.avatar = avatarUrl;
  return u;
}

export async function conversationRowToConversation(
  row: ChatConversationRow,
  getProfile: (id: string) => Promise<Profile | null>,
): Promise<Conversation> {
  const peerId = row.peerUserId ?? "";
  const profile = peerId ? await getProfile(peerId) : null;
  const participant = profileToChatUser(peerId || "unknown", profile);
  return {
    id: row.id,
    participant,
    lastMessage: row.lastMessage?.content,
    lastMessageTime: row.lastMessage
      ? new Date(row.lastMessage.createdAt)
      : undefined,
    unreadCount: 0,
  };
}
