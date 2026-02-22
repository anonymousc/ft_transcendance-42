import { memo } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "../types";
import { useChatScroll } from "../hooks/useChatScroll";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

interface ChatAreaProps {
  messages: Message[];
  currentUserId: string;
  contactName: string;
  onSendMessage: (content: string) => void;
  onBack?: (() => void) | undefined;
  className?: string | undefined;
}

function ChatArea({
  messages,
  currentUserId,
  contactName,
  onSendMessage,
  onBack,
  className,
}: ChatAreaProps) {
  const { containerRef, handleScroll } = useChatScroll(messages.length);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-gray-50 dark:bg-zinc-950",
        className
      )}
    >
      {/* Mobile-only header */}
      <div className="flex items-center gap-4 px-6 py-4 md:hidden border-b border-border/40 bg-white dark:bg-zinc-900 shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <span className="font-semibold text-sm text-foreground">
          {contactName}
        </span>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-end scrollbar-thin min-h-0"
      >
        <div className="space-y-3 mt-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))}
        </div>
      </div>

      {/* Input */}
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}

export default memo(ChatArea);
