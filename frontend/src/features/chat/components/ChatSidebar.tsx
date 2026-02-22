import { memo } from "react";
import { cn } from "@/lib/utils";
import type { ChatUser, Conversation } from "../types";
import ChatAvatar from "./ChatAvatar";
import ConversationItem from "./ConversationItem";

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
        "flex flex-col bg-white dark:bg-zinc-900 border-r border-border/40 h-full ",
        className
      )}
    >
      <div className="flex flex-col items-center px-6 py-8 border-b border-border/40 shrink-0">
        <div className="mt-10">
          <ChatAvatar
            src={currentUser.avatar}
            name={currentUser.name}
            size="xl"
            isOnline={currentUser.isOnline}
          />
        </div>
        <div className="flex items-center gap-1 mt-10">
          <h2 className="font-bold text-foreground text-sm">
            {currentUser.name}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-5 min-h-0">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onClick={onSelectConversation}
          />
        ))}
      </div>
    </aside>
  );
}

export default memo(ChatSidebar);
