import { useState, useEffect } from "react";
import { Home, Users, Bell, MessageCircle } from "lucide-react";
import "./GlassNavBar.css";

interface NavItem {
    id: string;
    icon: React.ReactNode;
    label: string;
}

export type GlassNavBadgeKey = "home" | "messages" | "friends" | "notifications";

function GlassNavBar({
    activeId = "home",
    handleNavigation,
    surface = "default",
    badges,
}: {
    activeId?: string;
    handleNavigation?: (id: string) => void;
    /** Dark frost + white icons on busy backdrops (e.g. /home video). Light & dark theme. */
    surface?: "default" | "home-video";
    /** Orange activity dots (e.g. unread / pending). */
    badges?: Partial<Record<GlassNavBadgeKey, boolean>> | undefined;
}) {
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const navItems: NavItem[] = [
        { id: "home", icon: <Home size={28} />, label: "Home" },
        { id: "messages", icon: <MessageCircle size={28} />, label: "Messages" },
        { id: "friends", icon: <Users size={28} />, label: "Friends" },
        { id: "notifications", icon: <Bell size={28} />, label: "Notification" },
    ];

    useEffect(() => {
        const idx = navItems.findIndex((item) => item.id === activeId);
        if (idx !== -1) {
            setActiveIndex(idx);
        }
    }, [activeId]);

    const handleClick = (index: number) => {
        if (index === activeIndex) return;

        setActiveIndex(index);

        const navItem = navItems[index];
        if (navItem && handleNavigation) {
            handleNavigation(navItem.id);
        }
    };

    return (
        <nav className={`glass-nav-bar${surface === "home-video" ? " glass-nav-bar--home-video" : ""}`}>
            {navItems.map((item, index) => (
                <button
                    key={item.id}
                    className={`glass-nav-item${index === activeIndex ? " active" : ""}`}
                    onClick={() => handleClick(index)}
                    aria-label={item.label}
                >
                    <span className="glass-nav-icon-wrap">
                        {item.icon}
                        {badges?.[item.id as GlassNavBadgeKey] ? (
                            <span className="glass-nav-badge" aria-hidden />
                        ) : null}
                    </span>
                    <span className="nav-label">
                        {item.label}
                    </span>
                </button>
            ))}
        </nav>
    );
}

export default GlassNavBar; 