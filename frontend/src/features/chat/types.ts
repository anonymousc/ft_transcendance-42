// ── Domain models (in-memory state) ──────────────────────────────────────────

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
  status: "sending" | "sent" | "delivered" | "read" | "failed";
}

export interface Conversation {
  id: string;
  participant: ChatUser;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

// ── WebSocket connection state ────────────────────────────────────────────────

export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

// ── WebSocket wire format — CONTRACT FOR THE BACKEND DEVELOPER ────────────────
//
// The websocket-service MUST send messages that conform to WsServerEnvelope.
// The frontend sends messages that conform to WsClientSend.
//
// Env: VITE_WS_URL=ws://localhost:8181 (friends-service WebSocket port).
//
// Connection: GET /chat/ws-token → ws://<host>?token=<JWT> (see friends-service)

// ── Server → Client ───────────────────────────────────────────────────────────

export interface WsMessagePayload {
  id: string;            // server-assigned permanent message ID
  conversationId: string;
  senderId: string;
  content: string;
  status: "sent" | "delivered" | "read";
  timestamp: string;     // ISO 8601 — JSON cannot carry Date objects
}

export interface WsAckPayload {
  tempId: string;        // echoes the client-generated tempId
  id: string;            // server-assigned permanent ID
  status: "sent";
}

export interface WsTypingPayload {
  conversationId: string;
  senderId: string;
  isTyping: boolean;
}

export interface WsErrorPayload {
  code: string;
  message: string;
}

export type WsServerEnvelope =
  | { type: "message";     payload: WsMessagePayload; timestamp: string }
  | { type: "message_ack"; payload: WsAckPayload;     timestamp: string }
  | { type: "typing";      payload: WsTypingPayload;  timestamp: string }
  | { type: "error";       payload: WsErrorPayload;   timestamp: string };

// ── Client → Server ───────────────────────────────────────────────────────────

/** Client → server (friends-service WebSocket); optional tempId → `message_ack`. */
export interface WsClientSend {
  type: "message";
  conversationId: string;
  content: string;
  tempId?: string;
}
