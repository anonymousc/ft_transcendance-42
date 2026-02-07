import { useState } from "react";
import { Menu, Home, MessageSquare, Users, Bell, User, LogOut } from "lucide-react";
import "./VerticalNav.css";

interface NavItem {
    id: string;
    icon: React.ReactNode;
    label: string;
}

interface VerticalNavProps {
    onNavigate?: (id: string) => void;
    activeItem?: string;
}

function VerticalNav({ onNavigate, activeItem: controlledActive }: VerticalNavProps) {
    const [internalActive, setInternalActive] = useState("home");
    const activeItem = controlledActive ?? internalActive;

    const navItems: NavItem[] = [
        { id: "home", icon: <Home size={24} />, label: "Home" },
        { id: "messages", icon: <MessageSquare size={24} />, label: "Messages" },
        { id: "friends", icon: <Users size={24} />, label: "Friends" },
        { id: "notifications", icon: <Bell size={24} />, label: "Notifications" },
        { id: "profile", icon: <User size={24} />, label: "Profile" },
    ];

    const handleClick = (id: string) => {
        setInternalActive(id);
        onNavigate?.(id);
    };

    return (
        <nav className="vertical-nav">
            <button className="nav-logo" aria-label="Menu">
                <Menu size={28} />
            </button>

            <div className="nav-items">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeItem === item.id ? "active" : ""}`}
                        onClick={() => handleClick(item.id)}
                        aria-label={item.label}
                    >
                        {item.icon}
                    </button>
                ))}
            </div>

            <div className="nav-bottom">
                <button
                    className="nav-item logout"
                    onClick={() => handleClick("logout")}
                    aria-label="Logout"
                >
                    <LogOut size={24} />
                </button>
            </div>
        </nav>
    );
}

export default VerticalNav;