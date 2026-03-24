import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Globe } from "lucide-react";
import "./GlassSearchBar.css";

const AI_PLACES_URL =
  (import.meta.env.VITE_AI_PLACES_URL as string) || "http://localhost:4000";

interface GlassSearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** Called when the user submits freetext (no autocomplete pick) */
  onSearch?: (value: string) => void;
  /** Called when the user picks a city from the autocomplete dropdown */
  onSelect?: (city: string) => void;
}

function GlassSearchBar({
  placeholder = "Search By Places or By Activities",
  value: controlledValue,
  onChange,
  onSearch,
  onSelect,
}: GlassSearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue ?? internalValue;

  const [staticSuggestions, setStaticSuggestions] = useState<string[]>([]);
  const [fallbackSuggestions, setFallbackSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Tracks how many static results came back so the fallback timer can decide
  // whether to fire without a stale-closure issue.
  const staticCountRef = useRef(0);

  const allSuggestions = [...staticSuggestions, ...fallbackSuggestions];

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced fetch: static at 250ms, fallback at 400ms (only when static = 0)
  useEffect(() => {
    const q = value.trim();

    if (q.length < 1) {
      setStaticSuggestions([]);
      setFallbackSuggestions([]);
      staticCountRef.current = 0;
      setShowDropdown(false);
      return;
    }

    // Timer 1 — 250ms: static CSV search (unchanged behaviour)
    const staticTimer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${AI_PLACES_URL}/autocomplete?q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();
        const list: string[] = data.suggestions ?? [];
        staticCountRef.current = list.length;
        setStaticSuggestions(list);
        if (list.length > 0) {
          setFallbackSuggestions([]);
          setShowDropdown(true);
        }
        setSelectedIndex(-1);
      } catch {
        staticCountRef.current = 0;
        setStaticSuggestions([]);
      }
    }, 250);

    // Timer 2 — 400ms: Google Places fallback, only when q >= 3 chars
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    if (q.length >= 3) {
      fallbackTimer = setTimeout(async () => {
        // Skip if the static search already returned results
        if (staticCountRef.current > 0) return;

        try {
          const res = await fetch(
            `${AI_PLACES_URL}/autocomplete/places?q=${encodeURIComponent(q)}`,
          );
          const data = await res.json();
          const list: string[] = data.suggestions ?? [];
          setFallbackSuggestions(list);
          if (list.length > 0) setShowDropdown(true);
          setSelectedIndex(-1);
        } catch {
          setFallbackSuggestions([]);
        }
      }, 400);
    }

    return () => {
      clearTimeout(staticTimer);
      if (fallbackTimer !== undefined) clearTimeout(fallbackTimer);
    };
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleSelect = (city: string) => {
    setInternalValue(city);
    onChange?.(city);
    setStaticSuggestions([]);
    setFallbackSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (onSelect) onSelect(city);
    else onSearch?.(city);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
      handleSelect(allSuggestions[selectedIndex]);
    } else {
      setShowDropdown(false);
      onSearch?.(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="glass-search-wrapper" ref={wrapperRef}>
      <form className="glass-search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          className="glass-search-input"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button type="submit" className="glass-search-button" aria-label="Search">
          <Search size={24} />
        </button>
      </form>

      {showDropdown && allSuggestions.length > 0 && (
        <ul className="glass-suggestions" role="listbox">
          {/* Static results */}
          {staticSuggestions.map((city, i) => (
            <li
              key={`static-${city}`}
              role="option"
              aria-selected={i === selectedIndex}
              className={`glass-suggestion-item${i === selectedIndex ? " active" : ""}`}
              onMouseDown={() => handleSelect(city)}
            >
              <MapPin size={13} className="glass-suggestion-icon" />
              {city}
            </li>
          ))}

          {/* Separator — only shown when fallback results exist */}
          {fallbackSuggestions.length > 0 && (
            <li className="glass-suggestion-separator" aria-hidden="true">
              ── More places ──
            </li>
          )}

          {/* Fallback results (Google Places) */}
          {fallbackSuggestions.map((city, i) => {
            const combinedIndex = staticSuggestions.length + i;
            return (
              <li
                key={`fallback-${city}`}
                role="option"
                aria-selected={combinedIndex === selectedIndex}
                className={`glass-suggestion-item${combinedIndex === selectedIndex ? " active" : ""}`}
                onMouseDown={() => handleSelect(city)}
              >
                <Globe size={13} className="glass-suggestion-icon" />
                {city}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default GlassSearchBar;
