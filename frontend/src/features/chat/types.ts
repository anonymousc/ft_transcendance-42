export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  coverImage?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  participant: ChatUser;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}
