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
        "flex flex-col bg-white dark:bg-zinc-900 border-r border-border h-full",
        className
      )}
    >
      {/* Current User Profile */}
      <div className="flex flex-col items-center px-6 pt-10 pb-8 border-b border-border/40">
        <ChatAvatar
          src={currentUser.avatar}
          name={currentUser.name}
          size="xl"
          isOnline={currentUser.isOnline}
        />
        <div className="flex items-center gap-2 mt-4">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <h2 className="font-bold text-foreground text-sm">
            {currentUser.name}
          </h2>
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
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
