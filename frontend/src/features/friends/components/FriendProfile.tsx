import { memo } from "react";
import type { Friend } from "../types";

interface FriendProfileProps {
  friend: Friend;
}

function FriendProfile({ friend }: FriendProfileProps) {
  return (
    <div className="flex items-center justify-center h-full w-full px-6">
      <div className="w-full max-w-[720px] bg-white dark:bg-[#2C2C2E] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Header with avatar */}
        <div className="relative flex flex-col items-start px-8 pt-12 pb-4 border-b border-[#E5E5EA] dark:border-[#3A3A3C] bg-[url('@/assets/BigAtlass.png')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <img
              src={friend.avatar}
              alt={friend.name}
              className="w-[120px] h-[120px] rounded-full object-cover mb-4"
            />
            <h1 className="text-[1.75rem] font-bold text-white leading-tight">
              {friend.name}
            </h1>
            {friend.email && (
              <p className="text-[0.95rem] text-white/80 mt-1">{friend.email}</p>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-6 p-8 max-sm:grid-cols-1">
          <InfoItem label="Display Name" value={friend.name} />
          <InfoItem label="Username" value={friend.username} />
          <InfoItem label="Email" value={friend.email} />
          <InfoItem label="Bio" value={friend.bio} />
          <InfoItem label="Status" value={friend.status ?? (friend.isOnline ? "online" : "offline")} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#8E8E93]">
        {label}
      </span>
      <span className="text-base font-medium text-[#1C1C1E] dark:text-[#F5F5F7]">
        {value || "—"}
      </span>
    </div>
  );
}

export default memo(FriendProfile);
