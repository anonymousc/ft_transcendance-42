import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import HomeNavBar from "@/components/shared/HomeNavBar";
import FriendCard from "./FriendCard";
import FriendProfile from "./FriendProfile";
import type { Friend } from "../types";
import pdp1 from "@/assets/pdp1.jpg";
import pdp1Png from "@/assets/pdp1.png";
import pdp2 from "@/assets/pdp2.jpg";
import pdp3 from "@/assets/pdp3.jpg";

const MOCK_FRIENDS: Friend[] = [
  { id: "1", name: "Ali smayka", avatar: pdp1, isOnline: true, username: "ali_smayka", email: "ali@rihla.app", bio: "Traveler & explorer", status: "online" },
  { id: "2", name: "hamada lah 3lik", avatar: pdp1Png, isOnline: false, username: "ali_s2", email: "ali2@rihla.app", bio: "Adventure seeker", status: "offline" },
  { id: "3", name: "cesar lhacker", avatar: pdp2, isOnline: true, username: "ali_s3", email: "ali3@rihla.app", bio: "World wanderer" },
  { id: "4", name: "your mom lol", avatar: pdp3, isOnline: false, username: "ali_s4", email: "ali4@rihla.app" },
  { id: "5", name: "Example 1", avatar: pdp1, isOnline: true, username: "ali_s5" },
  { id: "6", name: "Example 2", avatar: pdp1Png, isOnline: false, username: "ali_s6" },
];

function FriendsPage() {
  const [activeFriendId, setActiveFriendId] = useState<string | undefined>();
  const [showSidebar, setShowSidebar] = useState(true);

  const activeFriend = MOCK_FRIENDS.find((f) => f.id === activeFriendId);

  const handleSelectFriend = useCallback((id: string) => {
    setActiveFriendId(id);
    setShowSidebar(false);
  }, []);

  const handleBack = useCallback(() => {
    setShowSidebar(true);
    setActiveFriendId(undefined);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <HomeNavBar />

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            "flex flex-col bg-white dark:bg-zinc-900 border-r border-border/40 h-full",
            "w-full md:w-80 lg:w-72 xl:w-80 shrink-0",
            showSidebar ? "flex" : "hidden md:flex"
          )}
        >
          <div className="px-6 pt-20 pb-4 border-b border-border/40 shrink-0">
            {/* <h2 className="text-base font-bold text-foreground">
              Friends :
            </h2> */}
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-3 min-h-0">
            {MOCK_FRIENDS.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                isActive={friend.id === activeFriendId}
                onClick={handleSelectFriend}
              />
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div
          className={cn(
            "flex-1 min-w-0",
            !showSidebar ? "flex" : "hidden md:flex"
          )}
        >
          {activeFriend ? (
            <FriendProfile friend={activeFriend} />
          ) : (
            <div className="flex items-center justify-center h-full w-full px-12 bg-gray-50 dark:bg-zinc-950">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight select-none">
                <span className="text-primary">Rihla</span> Community
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendsPage;
