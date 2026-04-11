import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeNavBar from "@/components/shared/HomeNavBar";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Star,
  BookmarkX,
  Flame,
  TreePine,
  ShoppingBag,
  Landmark,
  Building2,
  BookOpen,
  AlertCircle,
  ChevronLeft,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

const FAV_PLACES_URL =
  (import.meta.env.VITE_FAV_PLACES_URL as string) || "http://localhost:4002";

const PLANNER_URL =
  (import.meta.env.VITE_PLANNER_URL as string) || "http://localhost:7000";

// ── Types ──────────────────────────────────────────────────────────────────

interface SavedPlace {
  id: string;
  userId: string;
  placeName: string;
  city: string;
  category: string;
  address: string;
  image: string | null;
  rating: number | null;
  savedAt: string;
}

interface FavEnvelope {
  ok: boolean;
  data?: SavedPlace[];
  error?: { code: string; message: string };
}

interface TripPlanSummary {
  id: string;
  city: string;
  days: number;
  preferences: string[];
  createdAt: string;
  updatedAt: string;
}

interface PlansEnvelope {
  ok: boolean;
  data?: TripPlanSummary[];
  error?: { message?: string };
}

function formatTripDateRange(createdAt: string, days: number): string {
  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) return `${days} day${days === 1 ? "" : "s"}`;
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(0, days - 1));
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

function tripThumbColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 62% 46%)`;
}

// ── Category icon map ──────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    Park:            <TreePine size={13} />,
    Market:          <ShoppingBag size={13} />,
    "Historical Site": <Landmark size={13} />,
    Monument:        <Building2 size={13} />,
    Museum:          <BookOpen size={13} />,
    Restaurant:      <ShoppingBag size={13} />,
    Beach:           <MapPin size={13} />,
  };
  return <>{icons[category] ?? <Landmark size={13} />}</>;
}

const CATEGORY_BG: Record<string, string> = {
  Park:            "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  Market:          "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  "Historical Site": "bg-stone-100 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700",
  Monument:        "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  Museum:          "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  Restaurant:      "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  Beach:           "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
};

function categoryClass(category: string) {
  return CATEGORY_BG[category] ?? "bg-stone-100 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700";
}

// ── SavedPlaceCard ─────────────────────────────────────────────────────────

function SavedPlaceCard({
  place,
  onUnsave,
}: {
  place: SavedPlace;
  onUnsave: (id: string) => void;
}) {
  const [removing, setRemoving] = useState(false);

  const handleUnsave = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      const res = await fetch(
        `${FAV_PLACES_URL}/fav-places/${place.id}?userId=${encodeURIComponent(place.userId)}`,
        { method: "DELETE", credentials: "include" },
      );
      const env = await res.json();
      if (env.ok) onUnsave(place.id);
    } catch { /* silent */ } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl
      bg-white dark:bg-white/[0.04]
      border border-stone-200/80 dark:border-white/[0.07]
      shadow-sm hover:shadow-md transition-all duration-300">

      {/* Image */}
      <div className="relative h-40 bg-stone-100 dark:bg-stone-800/50 overflow-hidden">
        {place.image ? (
          <img
            src={place.image}
            alt={place.placeName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Landmark size={32} className="text-stone-300 dark:text-stone-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Unsave button */}
        <button
          onClick={handleUnsave}
          disabled={removing}
          aria-label="Remove from saved"
          className="absolute top-2.5 right-2.5 flex items-center gap-1
            bg-white/90 dark:bg-black/60 backdrop-blur-sm
            text-rose-500 hover:text-rose-600
            text-[11px] font-medium px-2 py-1 rounded-full
            shadow-sm transition-all duration-200 disabled:opacity-50"
        >
          <BookmarkX size={12} />
          {removing ? "Removing…" : "Unsave"}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${categoryClass(place.category)}`}>
            <CategoryIcon category={place.category} />
            {place.category}
          </span>
          {place.rating !== null && place.rating >= 4.5 && (
            <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <Flame size={9} />
              Must Visit
            </span>
          )}
        </div>

        <h3 className="font-bold text-[16px] leading-snug text-stone-900 dark:text-white truncate">
          {place.placeName}
        </h3>

        <div className="flex items-center gap-2 text-[11px] text-stone-400 dark:text-stone-500">
          <MapPin size={11} className="shrink-0 text-orange-400" />
          <span className="truncate">{place.address}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-white/[0.06]">
          <span className="text-[11px] font-semibold text-orange-500 dark:text-orange-400">
            {place.city}
          </span>
          {place.rating !== null && (
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-orange-400 text-orange-400" />
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 tabular-nums">
                {place.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SavedTripRow ────────────────────────────────────────────────────────────

function SavedTripCard({
  trip,
  onOpen,
}: {
  trip: TripPlanSummary;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(trip.id)}
      className="group w-full flex items-stretch text-left rounded-2xl overflow-hidden
        bg-white dark:bg-white/[0.04]
        border border-stone-200/80 dark:border-white/[0.07]
        shadow-sm hover:shadow-md hover:border-orange-200/80 dark:hover:border-orange-500/25
        transition-all duration-300 min-h-[unset] min-w-[unset]"
    >
      <span
        className="w-1.5 shrink-0 self-stretch"
        style={{ background: tripThumbColor(trip.id) }}
        aria-hidden
      />
      <div className="flex-1 min-w-0 flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-semibold text-[15px] text-stone-900 dark:text-white truncate">
            {trip.city}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-stone-500 dark:text-stone-400">
            <CalendarDays size={12} className="shrink-0 text-orange-400" />
            <span className="truncate">
              {formatTripDateRange(trip.createdAt, trip.days)} · {trip.days} day
              {trip.days === 1 ? "" : "s"}
            </span>
          </p>
        </div>
        <ChevronRight
          size={18}
          className="shrink-0 text-stone-300 dark:text-stone-600 group-hover:text-orange-500 transition-colors"
        />
      </div>
    </button>
  );
}

// ── SavedPlacesPage ────────────────────────────────────────────────────────

function SavedPlacesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trips, setTrips] = useState<TripPlanSummary[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    fetch(`${FAV_PLACES_URL}/fav-places?userId=${encodeURIComponent(user.id)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((env: FavEnvelope) => {
        if (!env.ok) throw new Error(env.error?.message ?? "Failed to load saved places");
        setPlaces(env.data ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setTripsLoading(true);
    setTripsError(null);
    fetch(`${PLANNER_URL}/plans`, { credentials: "include" })
      .then((r) => r.json())
      .then((env: PlansEnvelope) => {
        if (!env.ok) throw new Error(env.error?.message ?? "Failed to load saved trips");
        setTrips(env.data ?? []);
      })
      .catch((err: Error) => setTripsError(err.message))
      .finally(() => setTripsLoading(false));
  }, [user?.id]);

  const handleUnsave = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0e0d0b]">
      <HomeNavBar />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-24 pb-20">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-stone-700
              dark:text-stone-500 dark:hover:text-stone-300 transition-colors mb-6"
          >
            <ChevronLeft size={14} />
            Back
          </button>

          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
            Saved <span className="text-orange-500">Places</span>
          </h1>
          <p className="mt-2 text-[14px] text-stone-500 dark:text-stone-400">
            Your bookmarked spots and AI trip plans in one place.
          </p>
        </div>

        {/* Saved trips */}
        <section className="mb-14" aria-labelledby="saved-trips-heading">
          <div className="flex items-end justify-between gap-4 mb-4">
            <h2
              id="saved-trips-heading"
              className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight"
            >
              Saved trips
            </h2>
            {!tripsLoading && trips.length > 0 ? (
              <span className="text-[12px] text-stone-500 dark:text-stone-400 tabular-nums">
                {trips.length} trip{trips.length !== 1 ? "s" : ""}
              </span>
            ) : null}
          </div>

          {tripsError && (
            <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl
              bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800
              text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle size={14} className="shrink-0" />
              {tripsError}
            </div>
          )}

          {tripsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] rounded-2xl bg-stone-100 dark:bg-stone-800/50 animate-pulse border border-stone-200/60 dark:border-white/[0.06]"
                />
              ))}
            </div>
          )}

          {!tripsLoading && !tripsError && trips.length === 0 && (
            <p className="text-[13px] text-stone-500 dark:text-stone-400 py-2">
              No saved trips yet.{" "}
              <button
                type="button"
                onClick={() => navigate("/home", { state: { openPlanTab: true } })}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Plan a trip
              </button>
            </p>
          )}

          {!tripsLoading && trips.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trips.map((trip) => (
                <SavedTripCard
                  key={trip.id}
                  trip={trip}
                  onOpen={(id) => navigate(`/planner?id=${id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Saved places */}
        <section className="mb-6" aria-labelledby="saved-places-heading">
          <h2
            id="saved-places-heading"
            className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white tracking-tight mb-4"
          >
            Saved places
          </h2>
          <p className="text-[13px] text-stone-500 dark:text-stone-400 mb-6 -mt-2">
            {loading
              ? "Loading your saved places…"
              : places.length === 0
                ? "No saved places yet — start exploring and bookmark places you love."
                : `${places.length} place${places.length !== 1 ? "s" : ""} saved`}
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 mb-8 rounded-2xl
            bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800
            text-rose-700 dark:text-rose-300">
            <AlertCircle size={16} className="shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Skeleton grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-white/[0.04]
                border border-stone-200/80 dark:border-white/[0.07] shadow-sm animate-pulse">
                <div className="h-40 bg-stone-100 dark:bg-stone-800" />
                <div className="p-4 space-y-2.5">
                  <div className="h-5 w-24 rounded-full bg-stone-100 dark:bg-stone-800" />
                  <div className="h-5 w-40 rounded bg-stone-100 dark:bg-stone-800" />
                  <div className="h-3.5 w-32 rounded bg-stone-100 dark:bg-stone-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cards grid */}
        {!loading && places.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {places.map((place) => (
              <SavedPlaceCard key={place.id} place={place} onUnsave={handleUnsave} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && places.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full
              bg-stone-100 dark:bg-white/[0.05] mb-4">
              <Landmark size={28} className="text-stone-300 dark:text-stone-600" />
            </div>
            <p className="text-stone-400 dark:text-stone-600 text-sm">
              No saved places yet.{" "}
              <button
                onClick={() => navigate("/city")}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Explore cities
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default SavedPlacesPage;
