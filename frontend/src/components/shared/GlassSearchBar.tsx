import { useEffect, useRef, useState } from "react";
import { Search, MapPin } from "lucide-react";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const allSuggestions = staticSuggestions;

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced fetch: backend handles static + Google fallback in one route.
  useEffect(() => {
    const q = value.trim();

    if (q.length < 1) {
      setStaticSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${AI_PLACES_URL}/autocomplete?q=${encodeURIComponent(q)}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: string[] = data.suggestions ?? [];
        setStaticSuggestions(list);
        setShowDropdown(list.length > 0);
        setSelectedIndex(-1);
      } catch {
        setStaticSuggestions([]);
        setShowDropdown(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
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
        </ul>
      )}
    </div>
  );
}

export default GlassSearchBar;
