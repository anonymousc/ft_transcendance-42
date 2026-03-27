/**
 * useWebSocket
 *
 * Manages the full WebSocket lifecycle for the chat feature.
 *
 * MOCK MODE (default — no backend needed):
 *   Leave VITE_WS_URL unset. The hook sets connectionState to "connected"
 *   immediately and simulates ACKs with a short setTimeout.
 *
 * REAL MODE:
 *   Set VITE_WS_URL=ws://localhost:8000 (or your websocket-service address).
 *   The hook connects, reconnects with exponential back-off, and processes
 *   WsServerEnvelope messages from the server.
 *
 * The message contract lives in features/chat/types.ts:
 *   WsServerEnvelope — what the backend must send
 *   WsClientSend     — what the frontend sends
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  ConnectionState,
  Conversation,
  Message,
  WsClientSend,
  WsServerEnvelope,
} from "../types";

// ── Config ────────────────────────────────────────────────────────────────────

const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) ?? "";
const MOCK_MODE = !WS_URL;
const MAX_RECONNECT_DELAY_MS = 30_000;
const MOCK_ACK_DELAY_MS = 400;

// ── Type guard ────────────────────────────────────────────────────────────────

function isWsEnvelope(raw: unknown): raw is WsServerEnvelope {
  if (typeof raw !== "object" || raw === null) return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.type === "string" &&
    typeof r.payload === "object" &&
    r.payload !== null &&
    typeof r.timestamp === "string"
  );
}

// ── Hook interface ────────────────────────────────────────────────────────────

interface UseWebSocketOptions {
  userId: string;
  initialMessages?: Record<string, Message[]>;
  initialConversations?: Conversation[];
}

interface UseWebSocketReturn {
  connectionState: ConnectionState;
  messages: Record<string, Message[]>;
  conversations: Conversation[];
  sendMessage: (conversationId: string, content: string) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWebSocket({
  userId,
  initialMessages = {},
  initialConversations = [],
}: UseWebSocketOptions): UseWebSocketReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    // In mock mode we are always "connected" — no real socket needed
    MOCK_MODE ? "connected" : "disconnected",
  );
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(initialMessages);
  const [conversations] = useState<Conversation[]>(initialConversations);

  // Keep a stable ref to the live socket so sendMessage can reach it
  const wsRef = useRef<WebSocket | null>(null);
  // Track whether the component that owns this hook is still mounted
  const isMountedRef = useRef(true);

  // ── WebSocket lifecycle (real mode only) ──────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;

    if (MOCK_MODE || !userId) return;

    let attempts = 0;
    let destroyed = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (destroyed) return;
      setConnectionState("connecting");

      let ws: WebSocket;
      try {
        ws = new WebSocket(`${WS_URL}?userId=${encodeURIComponent(userId)}`);
      } catch {
        // WebSocket constructor can throw synchronously on bad URLs
        setConnectionState("error");
        scheduleReconnect();
        return;
      }

      wsRef.current = ws;

      ws.onopen = () => {
        if (destroyed) return;
        setConnectionState("connected");
        attempts = 0;
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        if (destroyed) return;

        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          return; // ignore non-JSON frames
        }

        if (!isWsEnvelope(parsed)) return; // drop malformed envelopes

        switch (parsed.type) {
          case "message": {
            const p = parsed.payload;
            // Hydrate the ISO timestamp string into a real Date object
            const incomingMsg: Message = {
              id: p.id,
              conversationId: p.conversationId,
              senderId: p.senderId,
              content: p.content,
              timestamp: new Date(p.timestamp),
              status: p.status,
            };
            setMessages((prev) => ({
              ...prev,
              [p.conversationId]: [
                ...(prev[p.conversationId] ?? []),
                incomingMsg,
              ],
            }));
            break;
          }

          case "message_ack": {
            const { tempId, id, status } = parsed.payload;
            // Swap the optimistic message (tempId) for the server-confirmed one
            setMessages((prev) => {
              const next = { ...prev };
              for (const cid of Object.keys(next)) {
                next[cid] = (next[cid] ?? []).map((m) =>
                  m.id === tempId ? { ...m, id, status } : m,
                );
              }
              return next;
            });
            break;
          }

          // "typing" and "error" envelopes are handled here in future iterations
          default:
            break;
        }
      };

      ws.onclose = () => {
        if (destroyed) return;
        wsRef.current = null;
        setConnectionState("disconnected");
        scheduleReconnect();
      };

      ws.onerror = () => {
        if (destroyed) return;
        setConnectionState("error");
        // ws.close() fires onclose which schedules the reconnect
      };
    }

    function scheduleReconnect() {
      if (destroyed) return;
      const delay = Math.min(1_000 * 2 ** attempts, MAX_RECONNECT_DELAY_MS);
      attempts++;
      timeoutId = setTimeout(connect, delay);
    }

    connect();

    return () => {
      destroyed = true;
      isMountedRef.current = false;
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (wsRef.current) {
        // Null out handlers before closing to suppress the onclose reconnect
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId]);

  // ── Send ──────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const tempId = `temp-${Date.now()}`;

      // Optimistic update — message appears immediately as "sending"
      const optimistic: Message = {
        id: tempId,
        conversationId,
        senderId: userId,
        content,
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), optimistic],
      }));

      if (MOCK_MODE) {
        // Simulate a server ACK so the bubble transitions from "sending" to "sent"
        setTimeout(() => {
          setMessages((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] ?? []).map((m) =>
              m.id === tempId ? { ...m, status: "sent" as const } : m,
            ),
          }));
        }, MOCK_ACK_DELAY_MS);
        return;
      }

      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        // Socket not open — mark message as failed so the user can retry
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).map((m) =>
            m.id === tempId ? { ...m, status: "failed" as const } : m,
          ),
        }));
        return;
      }

      const frame: WsClientSend = {
        type: "send_message",
        payload: { conversationId, content, tempId },
      };
      ws.send(JSON.stringify(frame));
    },
    [userId],
  );

  return { connectionState, messages, conversations, sendMessage };
}
