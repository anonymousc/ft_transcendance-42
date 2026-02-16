import { useRef } from "react";
import { Home, MessageSquare, Users, Bell, MessageCircle } from "lucide-react";
import gsap from "gsap";
import "./GlassNavBar.css";

interface NavItem {
    id: string;
    icon: React.ReactNode;
    label: string;
}

function GlassNavBar({ handleNavigation }: { handleNavigation?: (id: string) => void }) {
    const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

    const navItems: NavItem[] = [
        { id: "home", icon: <Home size={28} />, label: "Home" },
        { id: "messages", icon: <MessageCircle size={28} />, label: "Messages" },
        { id: "friends", icon: <Users size={28} />, label: "Friends" },
        { id: "notifications", icon: <Bell size={28} />, label: "Notification" },
    ];

    const handleMouseEnter = (index: number) => {
        const label = labelRefs.current[index];
        if (label) {
            gsap.to(label, {
                width: "auto",
                opacity: 1,
                marginLeft: "0.5rem",
                duration: 0.4,
                ease: "power3.out",
            });
        }
    };

    const handleMouseLeave = (index: number) => {
        const label = labelRefs.current[index];
        if (label) {
            gsap.to(label, {
                width: 0,
                opacity: 0,
                marginLeft: 0,
                duration: 0.35,
                ease: "power2.inOut",
            });
        }
    };

    return (
        <nav className="glass-nav-bar">
            {navItems.map((item, index) => (
                <button
                    key={item.id}
                    className="glass-nav-item"
                    onClick={() => handleNavigation?.(item.id)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={() => handleMouseLeave(index)}
                    aria-label={item.label}
                >
                    {item.icon}
                    <span
                        className="nav-label"
                        ref={(el) => { labelRefs.current[index] = el; }}
                    >
                        {item.label}
                    </span>
                </button>
            ))}
        </nav>
    );
}

export default GlassNavBar; 