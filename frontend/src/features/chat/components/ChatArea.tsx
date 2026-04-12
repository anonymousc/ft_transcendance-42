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
  isDisabled?: boolean | undefined;
  onBack?: (() => void) | undefined;
  className?: string | undefined;
}

function ChatArea({
  messages,
  currentUserId,
  contactName,
  onSendMessage,
  isDisabled = false,
  onBack,
  className,
}: ChatAreaProps) {
  const { containerRef, handleScroll } = useChatScroll(messages.length);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-900 md:bg-gray-50 md:dark:bg-zinc-950",
        className
      )}
    >
      {/* Mobile-only header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/40 bg-white px-4 py-3 dark:bg-zinc-900 md:hidden">
        <button
          onClick={onBack}
          className="-ml-2 rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {contactName}
        </span>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-4 scrollbar-thin md:px-6 md:py-6"
      >
        <div className="mt-auto space-y-3">
          {messages.length === 0 ? (
            <p className="select-none py-8 text-center text-sm text-muted-foreground">
              No messages yet — say hi!
            </p>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))
          )}
        </div>
      </div>

      <MessageInput onSend={onSendMessage} disabled={isDisabled} />
    </div>
  );
}

export default memo(ChatArea);
