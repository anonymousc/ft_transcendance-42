import { useState, useCallback, useRef, type KeyboardEvent } from "react";
import { Smile, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean | undefined;
  className?: string | undefined;
}

function MessageInput({ onSend, disabled, className }: MessageInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  }, [value, onSend, disabled]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className={cn(
        "px-6 md:px-10 pt-4 pb-6 border-t border-border/30",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl px-5 py-3.5",
          "bg-white dark:bg-zinc-800",
          "border border-border/60 shadow-sm",
          "transition-shadow duration-200",
          "focus-within:shadow-md focus-within:border-border"
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent text-sm text-foreground",
            "placeholder:text-muted-foreground outline-none"
          )}
        />

        <button
          type="button"
          className={cn(
            "shrink-0 p-1.5 rounded-full",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-gray-100 dark:hover:bg-zinc-700",
            "transition-colors duration-200"
          )}
          aria-label="Emoji"
        >
          <Smile className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "shrink-0 p-1.5 rounded-full transition-colors duration-200",
            canSend
              ? "text-primary hover:bg-primary/10 cursor-pointer"
              : "text-muted-foreground/50 cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;
