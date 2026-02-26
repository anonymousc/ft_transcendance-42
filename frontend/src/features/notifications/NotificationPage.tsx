import { useState, useCallback } from "react";
import HomeNavBar from "@/components/shared/HomeNavBar";
import NotificationCard from "./components/NotificationCard";
import EmptyState from "./components/EmptyState";
import type { Notification } from "./types";

const MOCK_NOTIFICATIONS: Notification[] = [
  // Empty for now — matches the Figma empty-state cards.
  // Uncomment below to preview populated state:
  // {
  //   id: "1",
  //   type: "friend_request",
  //   title: "Ali smayka",
  //   body: "Sent you a friend request",
  //   timestamp: new Date(Date.now() - 1000 * 60 * 5),
  //   read: false,
  //   avatar: undefined,
  // },
];

function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const handleNotificationClick = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const placeholderCount = 7;

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7] dark:bg-[#1C1C1E] transition-colors duration-300">
      <HomeNavBar />

      <div className="flex-1 overflow-y-auto pt-20">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Header */}
          <h2 className="text-base font-bold text-foreground">
            Notification Center:
          </h2>
          <div className="h-px bg-border/60 mt-2 mb-6" />

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: placeholderCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-14 rounded-2xl border border-border/30 bg-white dark:bg-zinc-900"
                />
              ))}
              <EmptyState />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPage;
