import { memo } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatAvatarProps {
  src?: string | undefined;
  name: string;
  size?: "sm" | "md" | "lg" | "xl" | undefined;
  isOnline?: boolean | undefined;
  className?: string | undefined;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
} as const;

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
} as const;

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-9 w-9",
} as const;

const indicatorClasses = {
  sm: "h-2 w-2 border",
  md: "h-2.5 w-2.5 border-[1.5px]",
  lg: "h-3 w-3 border-2",
  xl: "h-4 w-4 border-2",
} as const;

function ChatAvatar({
  src,
  name,
  size = "md",
  isOnline,
  className,
}: ChatAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden bg-purple-100 dark:bg-zinc-700",
          "flex items-center justify-center",
          sizeClasses[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span
            className={cn(
              "font-semibold text-purple-500 dark:text-purple-300",
              textSizeClasses[size]
            )}
          >
            {initials || <User className={iconSizeClasses[size]} />}
          </span>
        )}
      </div>

      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-white dark:border-zinc-900",
            indicatorClasses[size],
            isOnline ? "bg-green-500" : "bg-gray-400 dark:bg-zinc-500"
          )}
        />
      )}
    </div>
  );
}

export default memo(ChatAvatar);
