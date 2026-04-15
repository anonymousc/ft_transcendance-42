## 1. REST API Endpoints Needed

### Messaging

| Endpoint | Method | Purpose | Request | Response |
|---|---|---|---|---|
| `/api/chat/conversations` | GET | List conversations for current user | `Authorization: Bearer <token>` | `Conversation[]` |
| `/api/chat/conversations/:id/messages` | GET | Fetch message history | `?limit=N&before=<cursor>` | `Message[]` |
| `/api/chat/conversations/:id/messages` | POST | Send a message | `{ content: string }` | `Message` (server-assigned `id`, `timestamp`, `status: "sent"`) |

### Friends

| Endpoint | Method | Purpose | Request | Response |
|---|---|---|---|---|
| `/api/friends` | GET | List current user's friends | `Authorization: Bearer <token>` | `Friend[]` |
| `/api/friends/:id` | GET | Get single friend profile | — | `Friend` |
| `/api/friends/:id` | DELETE | Remove friend | — | `204` |

### Notifications

| Endpoint | Method | Purpose | Request | Response |
|---|---|---|---|---|
| `/api/notifications` | GET | List all notifications | `Authorization: Bearer <token>` | `Notification[]` |
| `/api/notifications/read?id=` | PATCH | Mark single notification as read | — | `204` |
| `/api/notifications/readAll` | PATCH | Mark all as read | — | `204` |

---

## 2. Data Shapes (TypeScript)

### Conversation

```typescript
{
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;     // URL
    isOnline: boolean;
    coverImage?: string; // URL
  };
  lastMessage?: string;
  lastMessageTime?: string;  // ISO 8601
  unreadCount: number;
}
```

### Message

```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;  // ISO 8601
  status: "sending" | "sent" | "delivered" | "read";
}
```

### Friend

```typescript
{
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  username?: string;
  email?: string;
  bio?: string;
  status?: string;  // "online" | "offline"
}
```

### Notification

```typescript
{
  id: string;
  type: "friend_request" | "message" | "achievement" | "system";
  title: string;
  body: string;
  timestamp: string;  // ISO 8601
  read: boolean;
  avatar?: string;
  actionUrl?: string;
}
```

---


## 3. Mock Data to Replace

| File | What | Replace With |
|---|---|---|
| `features/chat/components/Webchat.tsx` lines 34–69 | `MOCK_CONVERSATIONS` | `GET /api/chat/conversations` |
| `features/chat/components/Webchat.tsx` lines 72–331 | `MOCK_MESSAGES` | `GET /api/chat/conversations/:id/messages` |
| `features/chat/components/Webchat.tsx` lines 407–416 | `setTimeout` faking delivery | WebSocket `message:send` + `message:status` |
| `features/friends/components/FriendsPage.tsx` lines 12–19 | `MOCK_FRIENDS` | `GET /api/friends` |
| `features/notifications/NotificationPage.tsx` lines 7–19 | `MOCK_NOTIFICATIONS` | `GET /api/notifications` |
| `features/chat/components/ContactPanel.tsx` line 65 | `onRemoveFriend` empty callback | `DELETE /api/friends/:id` |

---


