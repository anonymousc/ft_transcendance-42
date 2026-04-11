import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Tabs } from "radix-ui";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Search,
  UserPlus,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import HomeNavBar from "@/components/shared/HomeNavBar";
import { useAuth } from "@/context/AuthContext";
import FriendCard from "./FriendCard";
import FriendProfile from "./FriendProfile";
import SuggestedCard from "./SuggestedCard";
import type { Friend, PendingFriendRequest, SuggestedStudent } from "../types";
import {
  countSharedInterests,
  flattenUserInterests,
  getSharedInterests,
} from "../utils";
import pdp1 from "@/assets/pdp1.jpg";
import pdp1Png from "@/assets/pdp1.png";
import pdp2 from "@/assets/pdp2.jpg";
import pdp3 from "@/assets/pdp3.jpg";

const SEARCH_LIMIT = 10;

const MOCK_FRIENDS: Friend[] = [
  {
    id: "1",
    name: "Yasmine El Idrissi",
    username: "yasmine_e",
    avatar: pdp1,
    isOnline: true,
    bio: "Architecture student · weekend hikes, riads, and slow travel across the Maghreb.",
    city: "Fez",
    email: "yasmine@rihla.app",
    placesVisited: 34,
    friendsCount: 128,
    lastVisited: {
      name: "Bou Inania Madrasa",
      city: "Meknes",
    },
    interests: [
      "Photography",
      "Museum",
      "Slow travel",
      "Pastries & bakery",
      "History",
    ],
  },
  {
    id: "2",
    name: "Hamza Benkirane",
    username: "hamza_bk",
    avatar: pdp1Png,
    isOnline: false,
    bio: "Food-first trips · always hunting the best tagine and street sweets.",
    city: "Casablanca",
    email: "hamza@rihla.app",
    placesVisited: 52,
    friendsCount: 210,
    lastVisited: { name: "Hassan II Mosque", city: "Casablanca" },
    interests: [
      "Cooking",
      "Food-first trips",
      "Exploring cities",
      "Photography",
      "Middle Eastern",
    ],
  },
  {
    id: "3",
    name: "César Martins",
    username: "cesar_codes",
    avatar: pdp2,
    isOnline: true,
    bio: "42 student · maps APIs by day, night trains by weekend.",
    city: "Lisbon",
    email: "cesar@rihla.app",
    placesVisited: 19,
    friendsCount: 64,
    lastVisited: { name: "Oceanário de Lisboa", city: "Lisbon" },
    interests: [
      "Technology",
      "Travelling",
      "Packed itinerary",
      "Museum",
      "Surfing",
    ],
  },
  {
    id: "4",
    name: "Nour Haddad",
    username: "nour_explores",
    avatar: pdp3,
    isOnline: false,
    bio: "Marine bio · diving spots & coastal towns on my saved list.",
    city: "Agadir",
    placesVisited: 41,
    friendsCount: 95,
    lastVisited: { name: "Paradise Valley", city: "Agadir" },
    interests: ["Swimming", "Nature & outdoors", "Photography", "Beach"],
  },
  {
    id: "5",
    name: "Amine Tazi",
    username: "amine_tz",
    avatar: pdp1,
    isOnline: true,
    bio: "Hostels & social travel — the lobby is half the adventure.",
    city: "Rabat",
    placesVisited: 27,
    friendsCount: 302,
    lastVisited: { name: "Kasbah of the Udayas", city: "Rabat" },
    interests: [
      "Hostels & social",
      "Going to concerts",
      "Exploring cities",
      "Music",
      "Budget-friendly",
    ],
  },
  {
    id: "6",
    name: "Lina Okamoto",
    username: "lina_ok",
    avatar: pdp1Png,
    isOnline: false,
    bio: "Design & typography · sketching façades in every medina I visit.",
    city: "Tokyo",
    placesVisited: 61,
    friendsCount: 156,
    lastVisited: { name: "TeamLab Borderless", city: "Tokyo" },
    interests: [
      "Art & Design",
      "Museum",
      "Culture & arts",
      "Boutique stays",
      "Pastries & bakery",
    ],
  },
  {
    id: "7",
    name: "Omar Rahmouni",
    username: "omar_r",
    avatar: pdp2,
    isOnline: true,
    bio: "Desert trips, starry skies, and too many rolls of film.",
    city: "Ouarzazate",
    placesVisited: 22,
    friendsCount: 88,
    lastVisited: { name: "Aït Benhaddou", city: "Ouarzazate" },
    interests: ["Camping", "Photography", "Nature & outdoors", "History"],
  },
  {
    id: "8",
    name: "Sara Mehenni",
    username: "sara_m",
    avatar: pdp3,
    isOnline: false,
    bio: "Weekend micro-adventures · trains, playlists, and one good café.",
    city: "Algiers",
    placesVisited: 15,
    friendsCount: 72,
    lastVisited: { name: "Casbah of Algiers", city: "Algiers" },
    interests: [
      "Travelling",
      "Listening to podcasts",
      "Exploring cities",
      "Reading",
    ],
  },
];

const MOCK_PENDING: PendingFriendRequest[] = [
  {
    id: "req-1",
    name: "Karim Alaoui",
    username: "karim_explorer",
    avatar: pdp2,
  },
  {
    id: "req-2",
    name: "Inès Bensaid",
    username: "ines_b",
    avatar: pdp3,
  },
];

/** Everyone you can find in Discover (not yet friends); filtered client-side until search API exists. */
const MOCK_DISCOVER_USERS: SuggestedStudent[] = [
  {
    id: "s1",
    name: "Mehdi Cherkaoui",
    username: "mehdi_ck",
    avatar: pdp1,
    city: "Marrakech",
    interests: [
      "Photography",
      "Museum",
      "Food-first trips",
      "History",
      "Spicy food",
    ],
  },
  {
    id: "s2",
    name: "Julia Vogt",
    username: "julia_v",
    avatar: pdp1Png,
    city: "Berlin",
    interests: [
      "Technology",
      "Startups & business",
      "Travelling",
      "Packed itinerary",
      "Museum",
    ],
  },
  {
    id: "s3",
    name: "Houda Filali",
    username: "houda_f",
    avatar: pdp2,
    city: "Tangier",
    interests: [
      "Writing",
      "Reading",
      "Slow travel",
      "Culture & arts",
      "Pastries & bakery",
    ],
  },
  {
    id: "s4",
    name: "Tom Andersen",
    username: "tom_a",
    avatar: pdp3,
    city: "Copenhagen",
    interests: [
      "Cycling",
      "Sustainability",
      "Museum",
      "Budget-friendly",
      "Nature & outdoors",
    ],
  },
  {
    id: "s5",
    name: "Aya Mansouri",
    username: "aya_m",
    avatar: pdp2,
    city: "Tunis",
    interests: ["Travelling", "Photography", "Museum", "Cooking"],
  },
  {
    id: "s6",
    name: "Leo Fernández",
    username: "leo_fz",
    avatar: pdp1,
    city: "Barcelona",
    interests: ["Surfing", "Exploring cities", "Music", "Budget-friendly"],
  },
  {
    id: "s7",
    name: "Fatima Zahra Idrissi",
    username: "fz_idrissi",
    avatar: pdp3,
    city: "Chefchaouen",
    interests: ["Art & Design", "Photography", "Slow travel", "Fitness"],
  },
  {
    id: "s8",
    name: "Noah Schmidt",
    username: "noah_s",
    avatar: pdp1Png,
    city: "Munich",
    interests: ["Technology", "Museum", "Cycling", "Reading"],
  },
  {
    id: "s9",
    name: "Imane Boukhris",
    username: "imane_bk",
    avatar: pdp2,
    city: "Essaouira",
    interests: ["Swimming", "Photography", "Yoga", "Healthy & clean eating"],
  },
  {
    id: "s10",
    name: "Priya Nair",
    username: "priya_n",
    avatar: pdp3,
    city: "London",
    interests: ["Education", "Museum", "Theatre", "Travelling"],
  },
  {
    id: "s11",
    name: "Youssef El Amrani",
    username: "youssef_ea",
    avatar: pdp1,
    city: "Erfoud",
    interests: ["Camping", "Nature & outdoors", "Photography", "History"],
  },
  {
    id: "s12",
    name: "Chloé Martin",
    username: "chloe_m",
    avatar: pdp1Png,
    city: "Lyon",
    interests: ["Cooking", "Food-first trips", "Ice cream", "Museum"],
  },
];

/** Template when accepting a request (until friends-service returns full profile). */
function pendingToFriend(p: PendingFriendRequest): Friend {
  const base: Friend = {
    id: `friend-${p.id}`,
    name: p.name,
    username: p.username,
    isOnline: false,
    bio: "New connection — say hi and swap travel tips.",
    placesVisited: 0,
    friendsCount: 0,
    interests: ["Travelling", "Exploring cities"],
  };
  if (p.avatar) base.avatar = p.avatar;
  return base;
}

function FriendsPage() {
  const { user } = useAuth();
  const myInterestLabels = useMemo(
    () => flattenUserInterests(user?.interests ?? undefined),
    [user?.interests],
  );

  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [pending, setPending] = useState<PendingFriendRequest[]>(MOCK_PENDING);
  const [pendingExpanded, setPendingExpanded] = useState(true);
  const [search, setSearch] = useState("");
  const [discoverSearch, setDiscoverSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [profileFriend, setProfileFriend] = useState<Friend | null>(null);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(
    () => new Set(),
  );

  const onlineFriends = useMemo(
    () => friends.filter((f) => f.isOnline),
    [friends],
  );

  const filteredAllFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = friends;
    if (q) {
      list = friends.filter((f) => {
        const u = (f.username ?? "").toLowerCase();
        const n = f.name.toLowerCase();
        const c = (f.city ?? "").toLowerCase();
        return u.includes(q) || n.includes(q) || c.includes(q);
      });
    }
    return list.slice(0, SEARCH_LIMIT);
  }, [friends, search]);

  const friendUsernames = useMemo(
    () => new Set(friends.map((f) => f.username)),
    [friends],
  );

  /** Discover: full directory minus current friends; search by name, @handle, city, or any interest tag. */
  const discoverResults = useMemo(() => {
    const pool = MOCK_DISCOVER_USERS.filter((s) => !friendUsernames.has(s.username));
    const q = discoverSearch.trim().toLowerCase();
    let list = pool;
    if (q) {
      list = pool.filter((s) => {
        const name = s.name.toLowerCase();
        const handle = s.username.toLowerCase();
        const city = (s.city ?? "").toLowerCase();
        const tags = s.interests.join(" ").toLowerCase();
        return (
          name.includes(q) ||
          handle.includes(q) ||
          city.includes(q) ||
          tags.includes(q)
        );
      });
    }
    const sorted = [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    return sorted.slice(0, SEARCH_LIMIT).map((student) => ({
      student,
      shared: countSharedInterests(myInterestLabels, student.interests),
    }));
  }, [friendUsernames, discoverSearch, myInterestLabels]);

  const handleRemoveFriend = useCallback((id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
    setProfileFriend((p) => (p?.id === id ? null : p));
  }, []);

  const handleShareProfile = useCallback((friend: Friend) => {
    const handle = friend.username ?? friend.id;
    const url = `${window.location.origin}/profile/${encodeURIComponent(handle)}`;
    void navigator.clipboard.writeText(url).catch(() => {
      /* ignore */
    });
  }, []);

  const handleAccept = useCallback((req: PendingFriendRequest) => {
    setPending((prev) => prev.filter((p) => p.id !== req.id));
    setFriends((prev) => {
      if (prev.some((f) => f.username === req.username)) return prev;
      return [pendingToFriend(req), ...prev];
    });
  }, []);

  const handleDecline = useCallback((requestId: string) => {
    setPending((prev) => prev.filter((p) => p.id !== requestId));
  }, []);

  const handleAddSuggested = useCallback((studentId: string) => {
    setSentRequestIds((prev) => new Set(prev).add(studentId));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      <HomeNavBar />

      {profileFriend && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#faf9f7] dark:bg-[#0e0d0b]">
          <FriendProfile
            friend={profileFriend}
            onBack={() => setProfileFriend(null)}
          />
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-8">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-4xl">
           Friends
          </h1>
        </header>

        {pending.length > 0 && (
          <section
            className={cn(
              "mb-8 overflow-hidden rounded-2xl border",
              "bg-linear-gradient(to bottom, #ff6b00, #ff8c00)",
              "shadow-sm",
            )}
          >
            <button
              type="button"
              onClick={() => setPendingExpanded((e) => !e)}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left sm:px-5"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[15px] font-bold text-stone-900 dark:text-white">
                   You have {pending.length} pending request
                    {pending.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {pendingExpanded ? (
                <ChevronUp className="shrink-0 text-stone-400" size={20} />
              ) : (
                <ChevronDown className="shrink-0 text-stone-400" size={20} />
              )}
            </button>
            {pendingExpanded && (
              <ul className="space-y-2  px-3 py-3 sm:px-4">
                {pending.map((req) => (
                  <li
                    key={req.id}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-xl border border-stone-200/60",
                      "bg-white/80 px-3 py-3 dark:border-white/8 dark:bg-white/5",
                    )}
                  >
                    <img
                      src={req.avatar}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-stone-900 dark:text-white">
                        {req.name}
                      </p>
                      <p className="truncate text-[12px] text-orange-500 dark:text-orange-400">
                        @{req.username}
                      </p>
                    </div>
                    <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleAccept(req)}
                        className={cn(
                          "flex-1 rounded-xl bg-orange-500 px-4 py-2 text-[13px] font-semibold text-white",
                          "shadow-sm transition-colors hover:bg-orange-400 sm:flex-none",
                        )}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecline(req.id)}
                        className={cn(
                          "flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2 text-[13px] font-semibold",
                          "text-stone-700 transition-colors hover:bg-stone-50",
                          "dark:border-white/15 dark:bg-transparent dark:text-stone-200 dark:hover:bg-white/10 sm:flex-none",
                        )}
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <Tabs.Root value={tab} onValueChange={setTab} className="w-full">
          <Tabs.List
            className={cn(
              "mb-3 flex w-full gap-0.5 rounded-2xl border border-stone-200/80",
              "bg-white/80 dark:border-white/8 dark:bg-white/5 backdrop-blur-sm",
              "sm:inline-flex sm:w-auto",
            )}
          >
            {/* <Tabs.Trigger
              value="online"
              className={cn(
                "group flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-semibold",
                "text-stone-500 outline-none transition-all dark:text-white",
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:hover:bg-stone-100 dark:data-[state=inactive]:hover:bg-white/6",
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Online
              <span
                className={cn(
                  "rounded-full bg-stone-200/90 px-2 py-0.5 text-[11px] tabular-nums dark:bg-white/10",
                  "group-data-[state=active]:bg-white/25",
                )}
              >
                {onlineFriends.length}
              </span>
            </Tabs.Trigger> */}
            <Tabs.Trigger
              value="all"
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-1 text-[13px] font-semibold",
                "text-stone-500 outline-none transition-all dark:text-white",
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:hover:bg-stone-100 dark:data-[state=inactive]:hover:bg-white/6",
              )}
            >
              All
            </Tabs.Trigger>
            <Tabs.Trigger
              value="discover"
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold",
                "text-stone-500 outline-none transition-all dark:text-white",
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:hover:bg-stone-100 dark:data-[state=inactive]:hover:bg-white/6",
              )}
            >
              Discover
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="online" className="outline-none">
            {onlineFriends.length === 0 ? (
              <EmptyBlock
                icon={<Wifi className="text-stone-300 dark:text-stone-600" />}
                title="No one online"
                subtitle="Check back later or browse all friends."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {onlineFriends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    sharedInterests={getSharedInterests(
                      myInterestLabels,
                      friend.interests,
                    )}
                    onViewProfile={() => setProfileFriend(friend)}
                    onShareProfile={() => handleShareProfile(friend)}
                    onRemoveFriend={() => handleRemoveFriend(friend.id)}
                  />
                ))}
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="all" className="outline-none">
            <div
              className={cn(
                "mb-5 flex items-center gap-2 rounded-2xl border border-stone-200/80 bg-white/90 px-3 py-2",
                "dark:border-white/[0.07] dark:bg-white/4 backdrop-blur-sm",
              )}
            >
              <Search size={18} className="shrink-0 text-orange-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username"
                className={cn(
                  "min-w-0 flex-1 bg-transparent py-2 text-[14px] text-stone-900 outline-none",
                  "placeholder:text-stone-400 dark:text-white dark:placeholder:text-stone-500",
                )}
                aria-label="Search friends"
              />
            </div>
            <p className="text-[12px] text-dark-500 text-bold dark:text-white mb-3">
              You have : {filteredAllFriends.length} friends
            </p>
            {filteredAllFriends.length === 0 ? (
              <EmptyBlock
                icon={
                  <Search className="text-stone-300 dark:text-stone-600" />
                }
                title="No matches"
                subtitle="Try another name, handle, or city."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAllFriends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    sharedInterests={getSharedInterests(
                      myInterestLabels,
                      friend.interests,
                    )}
                    onViewProfile={() => setProfileFriend(friend)}
                    onShareProfile={() => handleShareProfile(friend)}
                    onRemoveFriend={() => handleRemoveFriend(friend.id)}
                  />
                ))}
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="discover" className="outline-none">
            <div
              className={cn(
                "mb-5 flex items-center gap-2 rounded-2xl border border-stone-200/80 bg-white/90 px-3 py-2",
                "dark:border-white/[0.07] dark:bg-white/4 backdrop-blur-sm",
              )}
            >
              <Search size={18} className="shrink-0 text-orange-400" />
              <input
                type="search"
                value={discoverSearch}
                onChange={(e) => setDiscoverSearch(e.target.value)}
                placeholder="Search anyone by name"
                className={cn(
                  "min-w-0 flex-1 bg-transparent py-2 text-[14px] text-stone-900 outline-none",
                  "placeholder:text-stone-400 dark:text-white dark:placeholder:text-stone-500",
                )}
                aria-label="Search people to add as friends"
              />
            </div>
            {discoverResults.length === 0 ? (
              <EmptyBlock
                icon={
                  <Compass className="text-stone-300 dark:text-stone-600" />
                }
                title={discoverSearch.trim() ? "No matches" : "No one to show"}
                subtitle={
                  discoverSearch.trim()
                    ? "Try another name, handle, city, or interest keyword."
                    : "Everyone in the sample directory is already in your friends list."
                }
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {discoverResults.map(({ student, shared }) => (
                  <SuggestedCard
                    key={student.id}
                    student={student}
                    sharedInterestCount={shared}
                    requestSent={sentRequestIds.has(student.id)}
                    onAddFriend={() => handleAddSuggested(student.id)}
                  />
                ))}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </main>
    </div>
  );
}

function EmptyBlock({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200/90",
        "bg-white/50 px-8 py-16 text-center dark:border-white/8 dark:bg-white/2",
      )}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-white/5">
        {icon}
      </div>
      <p className="font-semibold text-stone-800 dark:text-stone-100">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-[13px] text-stone-500 dark:text-stone-400">
        {subtitle}
      </p>
    </div>
  );
}

export default FriendsPage;
