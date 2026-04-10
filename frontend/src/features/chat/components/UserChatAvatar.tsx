import ChatAvatar from "./ChatAvatar";
import type { ChatUser } from "../types";

interface UserChatAvatarProps {
  currentUser: ChatUser;
}

function UserChatAvatar({ currentUser }: UserChatAvatarProps) {
  return (
    <div className="flex shrink-0 flex-col items-center border-b border-border/40 px-2 pb-2 pt-3">
      <ChatAvatar
        src={currentUser.avatar}
        name={currentUser.name}
        size="lg"
        isOnline={currentUser.isOnline}
      />
      <h2 className="mt-2 text-center text-sm font-bold text-foreground">
        {currentUser.name}
      </h2>
    </div>
  );
}

export default UserChatAvatar;
