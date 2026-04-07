import { memo } from "react";
import { cn } from "@/lib/utils";
import type { ChatUser, Conversation, ConnectionState } from "../types";
import ChatAvatar from "./ChatAvatar";
import ConversationItem from "./ConversationItem";
import UserChatAvatar from "./UserChatAvatar";

interface ChatSidebarProps {
  currentUser: ChatUser;
  conversations: Conversation[];
  activeConversationId?: string | undefined;
  onSelectConversation: (id: string) => void;
  connectionState?: ConnectionState | undefined;
  className?: string | undefined;
}

const CONNECTION_BADGE: Record<
  ConnectionState,
  { label: string; className: string }
> = {
  connected:    { label: "● Connected",       className: "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400"  },
  connecting:   { label: "○ Connecting…",     className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  disconnected: { label: "○ Disconnected",    className: "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400"    },
  error:        { label: "○ Connection error",className: "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400"    },
};

function ChatSidebar({
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  connectionState,
  className,
}: ChatSidebarProps) {
  const badge = connectionState ? CONNECTION_BADGE[connectionState] : null;

  return (
    <aside
      className={cn(
        "flex flex-col bg-white dark:bg-zinc-900 border-r border-border/40 h-full",
        className,
      )}
    >
      <div style={{ paddingTop: "4rem" }} className="shrink-0">
        <UserChatAvatar currentUser={currentUser} />
      </div>

      {/* Connection status badge — always visible so teammates can verify their backend */}
      {badge && (
        <div
          className={cn(
            "mx-4 mt-2 mb-1 text-[11px] text-center px-2 py-0.5 rounded-full select-none",
            badge.className,
          )}
        >
          {badge.label}
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto scrollbar-thin min-h-0"
        style={{
          paddingLeft: "0.5rem",
          paddingRight: "0.5rem",
          paddingTop: "1rem",
          paddingBottom: "1rem",
        }}
      >
        {conversations.map((conv) => (
          <div key={conv.id} style={{ marginBottom: "1rem" }}>
            <ConversationItem
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onClick={onSelectConversation}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

export default memo(ChatSidebar);
