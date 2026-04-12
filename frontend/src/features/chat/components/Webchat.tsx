import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import HomeNavBar from "@/components/shared/HomeNavBar";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import ChatWelcome from "./ChatWelcome";
import ContactPanel from "./ContactPanel";
import type { ChatUser } from "../types";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "../hooks/useWebSocket";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from "../mocks/chatMocks";

function Webchat() {
  const { user } = useAuth();

  const currentUser: ChatUser = useMemo(() => {
    if (user) {
      const u: ChatUser = {
        id: user.id,
        name: user.displayName || user.username || user.email,
        isOnline: user.status === "online",
      };
      if (user.avatar) u.avatar = user.avatar;
      return u;
    }
    return { id: "me", name: "Me", isOnline: false };
  }, [user]);

  const { connectionState, messages, conversations, sendMessage } = useWebSocket({
    userId: currentUser.id,
    initialMessages: MOCK_MESSAGES,
    initialConversations: MOCK_CONVERSATIONS,
  });

  const [activeConversationId, setActiveConversationId] = useState<
    string | undefined
  >();
  const [showSidebar, setShowSidebar] = useState(true);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const currentMessages = activeConversationId
    ? (messages[activeConversationId] ?? [])
    : [];

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setShowSidebar(false);
  }, []);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!activeConversationId) return;
      sendMessage(activeConversationId, content);
    },
    [activeConversationId, sendMessage],
  );

  const handleBack = useCallback(() => {
    setShowSidebar(true);
    setActiveConversationId(undefined);
  }, []);

  return (
    <div className="flex min-h-0 flex-col h-dvh overflow-hidden bg-background">
      <HomeNavBar hideMobileGlassNav={Boolean(activeConversation)} />
      <div className="home-nav-main-offset flex min-h-0 flex-1 overflow-hidden">
        <ChatSidebar
          currentUser={currentUser}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          connectionState={connectionState}
          className={cn(
            "w-full md:w-80 lg:w-72 xl:w-80 shrink-0",
            showSidebar ? "flex" : "hidden md:flex",
          )}
        />

        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col",
            !showSidebar ? "flex" : "hidden md:flex",
          )}
        >
          {activeConversation ? (
            <ChatArea
              messages={currentMessages}
              currentUserId={currentUser.id}
              contactName={activeConversation.participant.name}
              onSendMessage={handleSendMessage}
              isDisabled={connectionState !== "connected"}
              onBack={handleBack}
            />
          ) : (
            <ChatWelcome />
          )}
        </div>

        {activeConversation && (
          <ContactPanel
            contact={activeConversation.participant}
            onRemoveFriend={() => {
              /* TODO: call DELETE /friends/:id when friends-service is ready */
            }}
            className="hidden lg:flex w-72 xl:w-80 shrink-0"
          />
        )}
      </div>
    </div>
  );
}

export default Webchat;
