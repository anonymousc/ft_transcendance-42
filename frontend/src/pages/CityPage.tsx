import { useEffect, useRef, useState } from "react";
import HomeNavBar from "@/components/shared/HomeNavBar";
import CityBackground from "@/assets/marrakech_japanese_ink_20260221_014526 2.png";
import {
  ChevronDown,
  MapPin,
  Star,
  Flame,
  TreePine,
  ShoppingBag,
  Landmark,
  Building2,
  BookOpen,
  Bot,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";

const AI_PLACES_URL =
  (import.meta.env.VITE_AI_PLACES_URL as string) || "http://localhost:4000";

interface Place {
  name: string;
  category: string;
  rating: number;
  description: string;
  address: string;
  must_visit: boolean;
  image_query: string;
  image: string | null;
}

function usePlaces(city: string) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city.trim()) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setPlaces([]);

    fetch(`${AI_PLACES_URL}/places?city=${encodeURIComponent(city.trim())}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data: Place[]) => {
        if (!cancelled) setPlaces(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  return { places, loading, error };
}

interface CategoryStyle {
  icon: React.ReactNode;
  bg: string;
  text: string;
  border: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Park: {
    icon: <TreePine size={13} />,
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  Market: {
    icon: <ShoppingBag size={13} />,
    bg: "bg-orange-50 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
  },
  "Historical Site": {
    icon: <Landmark size={13} />,
    bg: "bg-stone-100 dark:bg-stone-800/50",
    text: "text-stone-600 dark:text-stone-300",
    border: "border-stone-200 dark:border-stone-700",
  },
  Monument: {
    icon: <Building2 size={13} />,
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
  },
  Museum: {
    icon: <BookOpen size={13} />,
    bg: "bg-violet-50 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
  },
  Restaurant: {
    icon: <ShoppingBag size={13} />,
    bg: "bg-rose-50 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
  },
  Beach: {
    icon: <MapPin size={13} />,
    bg: "bg-cyan-50 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
  },
};

function getCategoryStyle(category: string): CategoryStyle {
  return (
    CATEGORY_STYLES[category] ?? {
      icon: <Landmark size={13} />,
      bg: "bg-stone-100 dark:bg-stone-800/50",
      text: "text-stone-600 dark:text-stone-300",
      border: "border-stone-200 dark:border-stone-700",
    }
  );
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={13}
            className={
              i < full
                ? "fill-orange-400 text-orange-400"
                : i === full && hasHalf
                  ? "fill-orange-200 text-orange-400"
                  : "fill-stone-200 text-stone-200 dark:fill-stone-700 dark:text-stone-700"
            }
          />
        ))}
      </div>
      <span className="text-xs font-bold text-orange-500 dark:text-orange-400 tabular-nums">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function PlaceCard({ place, index }: { place: Place; index: number }) {
  const style = getCategoryStyle(place.category);
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${index * 60}ms` : "0ms" }}
      className={`group relative flex flex-row overflow-hidden rounded-2xl h-[200px]
        bg-white dark:bg-white/[0.04]
        border ${place.must_visit ? "border-orange-300/70 dark:border-orange-500/30" : "border-stone-200/80 dark:border-white/[0.07]"}
        ${place.must_visit ? "ring-1 ring-orange-200/60 dark:ring-orange-500/10" : ""}
        shadow-sm hover:shadow-md
        transition-all duration-500 ease-out
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {place.must_visit && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange-400 rounded-l-2xl" />
      )}

      <div className="flex flex-col justify-between flex-1 min-w-0 px-5 py-4 pl-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}
          >
            {style.icon}
            {place.category}
          </span>
          {place.must_visit && (
            <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <Flame size={9} />
              Must Visit
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <h3 className="font-bold text-[17px] leading-snug text-stone-900 dark:text-white truncate">
            {place.name}
          </h3>
          <StarRating rating={place.rating} />
        </div>

        <p className="text-[12.5px] leading-relaxed text-stone-500 dark:text-stone-400 line-clamp-2 mt-2">
          {place.description}
        </p>

        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100 dark:border-white/[0.06]">
          <MapPin size={11} className="shrink-0 text-orange-400" />
          <span className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
            {place.address}
          </span>
        </div>
      </div>

      <div className="relative w-[38%] shrink-0">
        {place.image ? (
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-stone-100 dark:bg-stone-800/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#0e0d0b] via-white/30 dark:via-[#0e0d0b]/30 to-transparent" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-row overflow-hidden rounded-2xl h-[200px] bg-white dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/[0.07] shadow-sm animate-pulse">
      <div className="flex flex-col justify-between flex-1 min-w-0 px-5 py-4 pl-6 gap-3">
        <div className="h-6 w-28 rounded-full bg-stone-100 dark:bg-stone-800" />
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-stone-100 dark:bg-stone-800" />
          <div className="h-3.5 w-20 rounded bg-stone-100 dark:bg-stone-800" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-stone-100 dark:bg-stone-800" />
          <div className="h-3 w-4/5 rounded bg-stone-100 dark:bg-stone-800" />
        </div>
        <div className="h-3 w-40 rounded bg-stone-100 dark:bg-stone-800 mt-1" />
      </div>
      <div className="w-[38%] shrink-0 bg-stone-100 dark:bg-stone-800" />
    </div>
  );
}

function CityPage() {
  const [cityInput, setCityInput] = useState("Marrakesh");
  const [activeCity, setActiveCity] = useState("Marrakesh");
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: headerRef, inView: headerInView } = useInView(0.2);

  const { places, loading, error } = usePlaces(activeCity);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = cityInput.trim();
    if (!trimmed || trimmed === activeCity) return;
    setActiveCity(trimmed);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  return (
    <div>
      <div
        className="bg-cover bg-bottom h-screen w-full relative flex flex-col"
        style={{ backgroundImage: `url(${CityBackground})` }}
      >
        <HomeNavBar />

        {/* Search bar — centered in hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex items-center gap-2 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-2xl px-4 py-3 shadow-lg"
          >
            <Search size={16} className="shrink-0 text-stone-400" />
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter a city…"
              className="flex-1 bg-transparent text-sm text-stone-800 dark:text-white placeholder:text-stone-400 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !cityInput.trim()}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors duration-200"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Search size={13} />
              )}
              Explore
            </button>
          </form>
        </div>

        {/* Scroll prompt */}
        <div className="pb-10 flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500">
            Scroll to explore
          </span>
          <ChevronDown
            size={30}
            strokeWidth={1.5}
            className="animate-bounce text-stone-600"
          />
        </div>
      </div>

      {/* ── AI Recommendations ────────────────────────────────────────── */}
      <section
        ref={sectionRef}
        className="bg-[#faf9f7] dark:bg-[#0e0d0b] py-20 px-4 sm:px-8 lg:px-16"
      >
        {/* Section header */}
        <div ref={headerRef} className="max-w-3xl mx-auto mb-12 text-center">
          <div
            className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full
              bg-stone-100 dark:bg-white/[0.06] border border-stone-200 dark:border-white/[0.08]
              transition-all duration-500 ease-out
              ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Bot size={13} className="text-orange-500" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-stone-500 dark:text-stone-400">
              Curated by Gemini AI
            </span>
          </div>

          <h2
            className={`text-4xl sm:text-5xl font-bold text-stone-900 dark:text-white tracking-tight mb-4
              transition-all duration-600 ease-out delay-100
              ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Discover{" "}
            <span className="text-orange-500">{activeCity}</span>
          </h2>

          <p
            className={`text-[15px] text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed
              transition-all duration-500 ease-out delay-200
              ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            AI-powered picks to help you experience the very best of{" "}
            {activeCity} — from hidden gems to iconic landmarks.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 flex items-center gap-3 px-5 py-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
            <AlertCircle size={16} className="shrink-0" />
            <p className="text-sm">
              Could not load places for <strong>{activeCity}</strong>: {error}
            </p>
          </div>
        )}

        {/* Cards list */}
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : places.map((place, i) => (
                <PlaceCard key={place.name} place={place} index={i} />
              ))}
        </div>

        {!loading && !error && places.length === 0 && (
          <p className="text-center text-stone-400 dark:text-stone-600 mt-8 text-sm">
            No places found. Try a different city.
          </p>
        )}

        <p className="mt-12 text-center text-[11px] text-stone-400 dark:text-stone-600 tracking-wide">
          Recommendations generated by Google Gemini Flash · Images from Unsplash
        </p>
      </section>
    </div>
  );
}

export default CityPage;
