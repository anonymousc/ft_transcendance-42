import { memo } from "react";
import { cn } from "@/lib/utils";
import type { ChatUser } from "../types";
import ChatAvatar from "./ChatAvatar";

interface ContactPanelProps {
  contact: ChatUser;
  onRemoveFriend?: (() => void) | undefined;
  className?: string | undefined;
}

function ContactPanel({ contact, onRemoveFriend, className }: ContactPanelProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-white dark:bg-zinc-900 border-l border-border h-full",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-orange-50 dark:from-primary/15 dark:via-zinc-800 dark:to-zinc-900">
        {contact.coverImage ? (
          <img
            src={contact.coverImage}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 via-amber-100/40 to-orange-50 dark:from-primary/15 dark:via-zinc-800 dark:to-zinc-900" />
        )}
      </div>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center -mt-10 px-6 pb-6 border-b border-border/30">
        <ChatAvatar
          src={contact.avatar}
          name={contact.name}
          size="xl"
          className="ring-4 ring-white dark:ring-zinc-900"
        />
        <h3 className="mt-4 text-lg font-bold text-foreground">
          {contact.name}
        </h3>
      </div>

      {/* Last Activities */}
      <div className="flex-1 px-6 pt-8">
        <h4 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          Last Activities
        </h4>
      </div>

      {/* Remove Friend */}
      {onRemoveFriend && (
        <div className="p-6">
          <button
            onClick={onRemoveFriend}
            className={cn(
              "w-full py-3 px-4 rounded-xl",
              "bg-red-500 hover:bg-red-600 active:bg-red-700",
              "text-white text-sm font-semibold",
              "transition-colors duration-200 cursor-pointer"
            )}
          >
            Remove Friends
          </button>
        </div>
      )}
    </aside>
  );
}

export default memo(ContactPanel);
