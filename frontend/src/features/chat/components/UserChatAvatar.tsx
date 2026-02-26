import ChatAvatar from "./ChatAvatar";
import type { ChatUser } from "../types";

interface UserChatAvatarProps {
  currentUser: ChatUser;
}

function UserChatAvatar({ currentUser }: UserChatAvatarProps) {
  return (
    <div className="flex flex-col items-center border-b border-border/40 shrink-0 pt-5 pb-4 h-20">
      <div>
        <ChatAvatar
          src={currentUser.avatar}
          name={currentUser.name}
          size="xl"
          isOnline={currentUser.isOnline}
        />
      </div>
      <div className="flex items-center gap-1" style={{ marginTop: "0.75rem" }}>
        <h2 className="font-bold text-foreground text-sm">
          {currentUser.name}
        </h2>
      </div>
    </div>
  );
}


export default UserChatAvatar;
