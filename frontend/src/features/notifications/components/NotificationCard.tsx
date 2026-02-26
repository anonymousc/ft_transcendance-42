import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Notification } from "../types";
import ChatAvatar from "@/features/chat/components/ChatAvatar";

interface NotificationCardProps {
  notification: Notification;
  onClick?: (id: string) => void;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function NotificationCard({ notification, onClick }: NotificationCardProps) {
  return (
    <button
      onClick={() => onClick?.(notification.id)}
      className={cn(
        "w-full flex items-center gap-4 px-5 py-4 text-left",
        "rounded-2xl border transition-all duration-200 cursor-pointer",
        "hover:shadow-sm",
        notification.read
          ? "border-border/30 bg-white dark:bg-zinc-900"
          : "border-primary/30 bg-primary/5 dark:bg-primary/10"
      )}
    >
      {notification.avatar ? (
        <ChatAvatar src={notification.avatar} name={notification.title} size="md" />
      ) : (
        <div className="h-11 w-11 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-primary text-lg font-bold">
            {notification.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-sm truncate",
            notification.read ? "font-medium text-foreground/80" : "font-semibold text-foreground"
          )}>
            {notification.title}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(notification.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {notification.body}
        </p>
      </div>

      {!notification.read && (
        <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}

export default memo(NotificationCard);
