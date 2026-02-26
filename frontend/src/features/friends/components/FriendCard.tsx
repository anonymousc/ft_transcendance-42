import { memo } from "react";
import { cn } from "@/lib/utils";
import ChatAvatar from "@/features/chat/components/ChatAvatar";
import type { Friend } from "../types";

interface FriendCardProps {
  friend: Friend;
  isActive: boolean;
  onClick: (id: string) => void;
}

function FriendCard({ friend, isActive, onClick }: FriendCardProps) {
  return (
    <button
      onClick={() => onClick(friend.id)}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 text-left",
        "rounded-xl border",
        "transition-all duration-200 cursor-pointer",
        "hover:bg-gray-50 dark:hover:bg-zinc-800/60",
        isActive
          ? "border-primary/60 bg-primary/5 dark:bg-primary/10 shadow-sm"
          : "border-border/40 bg-white dark:bg-zinc-900"
      )}
    >
      <ChatAvatar
        src={friend.avatar}
        name={friend.name}
        size="md"
        isOnline={friend.isOnline}
      />
      <span
        className={cn(
          "font-medium text-sm truncate",
          isActive
            ? "text-foreground"
            : "text-foreground/80"
        )}
      >
        {friend.name}
      </span>
    </button>
  );
}

export default memo(FriendCard);
