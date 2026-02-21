import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] px-5 py-3 rounded-2xl",
          "transition-opacity duration-200",
          isOwn
            ? "bg-zinc-200 dark:bg-zinc-700 rounded-br-sm"
            : "bg-white dark:bg-zinc-800 rounded-bl-sm shadow-sm",
          message.status === "sending" && "opacity-60"
        )}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground">
          {message.content}
        </p>
      </div>
    </div>
  );
}

export default memo(MessageBubble);
