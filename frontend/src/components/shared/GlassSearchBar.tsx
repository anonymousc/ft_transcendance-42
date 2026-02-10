import { useState } from "react";
import { Search } from "lucide-react";
import "./GlassSearchBar.css";

interface GlassSearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
}

function GlassSearchBar({
    placeholder = "Search By Places or By Activities",
    value: controlledValue,
    onChange,
    onSearch,
}: GlassSearchBarProps) {
    const [internalValue, setInternalValue] = useState("");
    const value = controlledValue ?? internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        onChange?.(newValue);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            onSearch?.(value);
        }
    };

    return (
        <form className="glass-search-bar" onSubmit={handleSubmit}>
            <input
                type="text"
                className="glass-search-input"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            <button type="submit" className="glass-search-button" aria-label="Search">
                <Search size={24} />
            </button>
        </form>
    );
}

export default GlassSearchBar;
