import { useNavigate, useLocation } from "react-router-dom";
import GlassNavBar from "./GlassNavBar";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "../../context/AuthContext";
import "./HomeNavBar.css";

const NAV_ID_TO_PATH: Record<string, string> = {
  home: "/home",
  messages: "/webchat",
  friends: "/friends",
  notifications: "/notifications",
};

const PATH_TO_NAV_ID: Record<string, string> = {
  "/home": "home",
  "/webchat": "messages",
  "/friends": "friends",
  "/notifications": "notifications",
};

type HomeNavBarProps = {
  /** Hide bottom glass pill on small viewports (e.g. active chat thread). */
  hideMobileGlassNav?: boolean;
};

function HomeNavBar({ hideMobileGlassNav = false }: HomeNavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const pathname =
    location.pathname.replace(/\/+$/, "") || "/";
  const activeId = PATH_TO_NAV_ID[pathname] ?? "home";
  const isHomeVideo = pathname === "/home";

  const handleNavigation = (id: string) => {
    const path = NAV_ID_TO_PATH[id];
    if (path) {
      navigate(path);
    }
  };

  const navClass = [
    "home-nav",
    isHomeVideo ? "home-nav--home-video" : "",
    hideMobileGlassNav ? "home-nav--hide-mobile-glass" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={navClass}>
      <div
        className={
          isHomeVideo
            ? "home-nav-brand home-nav-brand--on-video text-2xl font-bold transition-colors duration-300"
            : "text-[#1C1C1E] dark:text-white text-2xl font-bold transition-colors duration-300"
        }
      >
        <h1>RIHLA</h1>
      </div>
      <GlassNavBar
        activeId={activeId}
        handleNavigation={handleNavigation}
        surface={isHomeVideo ? "home-video" : "default"}
      />
      <div className="profile-dropdown-wrapper">
        <ProfileDropdown
          onProfile={() => navigate("/profile")}
          onSaved={() => navigate("/saved")}
          onSettings={() => navigate("/settings")}
          onLanguage={() => console.log("Change language")}
          onLogout={() => { logout(); navigate("/login"); }}
        />
      </div>
    </nav>
  );
}

export default HomeNavBar;
