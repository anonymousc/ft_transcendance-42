import { memo } from "react";
import { cn } from "@/lib/utils";
import type { ChatUser, Conversation } from "../types";
import ChatAvatar from "./ChatAvatar";
import ConversationItem from "./ConversationItem";
import { User } from "lucide-react";
import UserChatAvatar from "./UserChatAvatar";

interface ChatSidebarProps {
  currentUser: ChatUser;
  conversations: Conversation[];
  activeConversationId?: string | undefined;
  onSelectConversation: (id: string) => void;
  className?: string | undefined;
}

function ChatSidebar({
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  className,
}: ChatSidebarProps) {
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
