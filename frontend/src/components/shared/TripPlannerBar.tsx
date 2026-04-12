import { useState } from "react";
import { CalendarDays, Sparkles, MapPin, Minus, Plus } from "lucide-react";
import TripPlanModal from "./TripPlanModal";
import { useAuth } from "../../context/AuthContext";
import "./TripPlannerBar.css";

const PLANNER_URL =
  (import.meta.env.VITE_PLANNER_URL as string) || "http://localhost:7000";


export interface TripPlan {
  id: string;
  city: string;
  days: number;
  preferences: string[];
  plan: {
    title: string;
    summary: string;
    days: DayPlan[];
    tips?: string[];
  };
  createdAt: string;
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  name: string;
  category: string;
  description: string;
  address: string;
  rating: number | null;
  image: string | null;
  lat: number | null;
  lng: number | null;
  is_favorite: boolean;
  review_summary: { averageRating: number | null; totalReviews: number } | null;
  duration_minutes: number;
  tips: string;
}

interface TripPlannerBarProps {
  defaultCity?: string;
  /** Show generated plan in the document flow instead of a modal overlay. */
  inlinePlanDisplay?: boolean;
  /** When set, successful generation calls this instead of opening the modal (e.g. redirect to /planner). */
  onPlanGenerated?: (plan: TripPlan) => void;
}

function TripPlannerBar({
  defaultCity = "",
  inlinePlanDisplay = false,
  onPlanGenerated,
}: TripPlannerBarProps) {
  const { user } = useAuth();
  const [city, setCity] = useState(defaultCity);
  const [days, setDays] = useState(3);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [showModal, setShowModal] = useState(false);

  const togglePreference = (label: string) => {
    setPreferences(prev =>
      prev.includes(label) ? prev.filter(p => p !== label) : [...prev, label]
    );
  };

  const handleDaysChange = (delta: number) => {
    setDays(d => Math.min(14, Math.max(1, d + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    if (!user) {
      setError("Please sign in to generate a trip plan.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${PLANNER_URL}/plan/generate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: city.trim(),
          days,
          preferences,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error?.message ?? "Failed to generate plan");
      }

      const row = data.data as TripPlan;
      if (onPlanGenerated) {
        onPlanGenerated(row);
        return;
      }

      setPlan(row);
      if (!inlinePlanDisplay) setShowModal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="planner-bar-wrapper">
        {/* <div className="planner-bar-label">
          <Sparkles size={13} />
          <span>AI Trip Planner</span>
        </div> */}

        <form className="planner-bar" onSubmit={handleSubmit}>
          {/* City input */}
          <div className="planner-bar-field">
            {/* <MapPin size={16} className="planner-bar-icon" /> */}
            <input
              type="text"
              className="planner-bar-input"
              placeholder="Where to?"
              value={city}
              onChange={e => setCity(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="planner-bar-divider" />

          {/* Days selector */}
          <div className="planner-bar-days">
            <CalendarDays size={17} className="planner-bar-icon" />
            <button
              type="button"
              className="planner-bar-step"
              onClick={() => handleDaysChange(-1)}
              aria-label="Fewer days"
            >
              <Minus size={13} />
            </button>
            <span className="planner-bar-days-value">
              {days} {days === 1 ? "day" : "days"}
            </span>
            <button
              type="button"
              className="planner-bar-step"
              onClick={() => handleDaysChange(1)}
              aria-label="More days"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="planner-bar-submit"
            disabled={loading || !city.trim()}
            aria-label="Generate trip plan"
          >
            {loading ? (
              <span className="planner-bar-spinner" />
            ) : (
              <>
                <Sparkles size={16} />
                <span>Plan</span>
              </>
            )}
          </button>
        </form>

        {/* Preference chips */}
        {/* <div className="planner-bar-prefs">
          {PREFERENCE_OPTIONS.map(({ label, emoji }) => (
            <button
              key={label}
              type="button"
              className={`planner-pref-chip${preferences.includes(label) ? " active" : ""}`}
              onClick={() => togglePreference(label)}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div> */}

        {error && <p className="planner-bar-error">{error}</p>}
      </div>

      {plan && (inlinePlanDisplay || showModal) && (
        <TripPlanModal
          plan={plan}
          inline={inlinePlanDisplay}
          onClose={() => {
            setShowModal(false);
            if (inlinePlanDisplay) setPlan(null);
          }}
        />
      )}
    </>
  );
}

export default TripPlannerBar;
