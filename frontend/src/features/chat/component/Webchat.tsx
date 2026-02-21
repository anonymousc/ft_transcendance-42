import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassNavBar from "@/components/shared/GlassNavBar";
import ChatSidebar from "../components/ChatSidebar";
import ChatArea from "../components/ChatArea";
import ChatWelcome from "../components/ChatWelcome";
import ContactPanel from "../components/ContactPanel";
import type { ChatUser, Conversation, Message } from "../types";

const NAV_ID_TO_PATH: Record<string, string> = {
  home: "/home",
  messages: "/webchat",
  friends: "/friends",
  notifications: "/notifications",
};

const PATH_TO_NAV_ID: Record<string, string> = {
  "/home": "home",
  "/webchat": "messages",
  "/friends": "friends",
  "/notifications": "notifications",
};

// TODO: Replace with real user data from auth context
const CURRENT_USER: ChatUser = {
  id: "me",
  name: "Ilyass Ouhsseine",
  isOnline: true,
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    participant: { id: "salma", name: "Salma", isOnline: true },
    lastMessage: "Hey How are you doing :> ?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 1,
  },
  {
    id: "2",
    participant: { id: "walid", name: "Walid", isOnline: false },
    lastMessage: "I'm free this weekend, ...",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
  },
  {
    id: "3",
    participant: { id: "mounia", name: "Mounia", isOnline: true },
    lastMessage: "See You later",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
  },
  {
    id: "4",
    participant: { id: "khtek1", name: "Khtek", isOnline: false },
    lastMessage: "Thank youu",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    unreadCount: 0,
  },
  {
    id: "5",
    participant: { id: "khtek2", name: "Khtek", isOnline: false },
    lastMessage: "Thank youu",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "3": [
    {
      id: "m1",
      conversationId: "3",
      senderId: "mounia",
      content: "Heyy i just wanna ask you, how was The Trip",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: "read",
    },
    {
      id: "m2",
      conversationId: "3",
      senderId: "me",
      content:
        "BLA Bla blalall aaaa BLA Bla blalall aaaa BLA Bla blalall aaaa",
      timestamp: new Date(Date.now() - 1000 * 60 * 55),
      status: "read",
    },
    {
      id: "m3",
      conversationId: "3",
      senderId: "mounia",
      content: "Suurue",
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      status: "read",
    },
    {
      id: "m4",
      conversationId: "3",
      senderId: "me",
      content:
        "BLA Bla blalall aaaa BLA Bla blalall aaaa BLA Bla blalall aaaa",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: "read",
    },
    {
      id: "m5",
      conversationId: "3",
      senderId: "mounia",
      content:
        "BLA Bla blalall aaaa BLA Bla blalall aaaa BLA Bla blalall aaaa BLA Bla blalall aaaa BLA Bla blalall aaaa BLA Bla blalall aaaa",
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
      status: "read",
    },
    {
      id: "m6",
      conversationId: "3",
      senderId: "me",
      content: "See You later",
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      status: "read",
    },
  ],
};

function Webchat() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = PATH_TO_NAV_ID[location.pathname] ?? "home";

  const [activeConversationId, setActiveConversationId] = useState<
    string | undefined
  >();
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleNavigation = useCallback(
    (id: string) => {
      const path = NAV_ID_TO_PATH[id];
      if (path) navigate(path);
    },
    [navigate]
  );

  const activeConversation = MOCK_CONVERSATIONS.find(
    (c) => c.id === activeConversationId
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

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: CURRENT_USER.id,
        content,
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: [
          ...(prev[activeConversationId] ?? []),
          optimisticMessage,
        ],
      }));

      // TODO: Replace with WebSocket/API call, then reconcile status
      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [activeConversationId]: (prev[activeConversationId] ?? []).map((m) =>
            m.id === optimisticMessage.id
              ? { ...m, status: "sent" as const }
              : m
          ),
        }));
      }, 500);
    },
    [activeConversationId]
  );

  const handleBack = useCallback(() => {
    setShowSidebar(true);
    setActiveConversationId(undefined);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <GlassNavBar activeId={activeId} handleNavigation={handleNavigation} />

      <div className="flex flex-1 overflow-hidden pt-24">
        {/* Left Sidebar */}
        <ChatSidebar
          currentUser={CURRENT_USER}
          conversations={MOCK_CONVERSATIONS}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          className={cn(
            "w-full md:w-80 lg:w-72 xl:w-80 shrink-0",
            showSidebar ? "flex" : "hidden md:flex"
          )}
        />

        {/* Center: Chat or Welcome */}
        <div
          className={cn(
            "flex-1 min-w-0",
            !showSidebar ? "flex" : "hidden md:flex"
          )}
        >
          {activeConversation ? (
            <ChatArea
              messages={currentMessages}
              currentUserId={CURRENT_USER.id}
              contactName={activeConversation.participant.name}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              className="h-full w-full"
            />
          ) : (
            <ChatWelcome />
          )}
        </div>

        {/* Right Panel: Contact Info */}
        {activeConversation && (
          <ContactPanel
            contact={activeConversation.participant}
            onRemoveFriend={() => {
              /* TODO: API call */
            }}
            className="hidden lg:flex w-72 xl:w-80 shrink-0"
          />
        )}
      </div>
    </div>
  );
}

export default Webchat;
