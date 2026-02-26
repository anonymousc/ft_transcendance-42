export type NotificationType = "friend_request" | "message" | "achievement" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
}
