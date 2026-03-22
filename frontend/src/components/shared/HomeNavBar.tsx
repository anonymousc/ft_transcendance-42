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

function HomeNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const activeId = PATH_TO_NAV_ID[location.pathname] ?? "home";

  const handleNavigation = (id: string) => {
    const path = NAV_ID_TO_PATH[id];
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav className="home-nav">
      <div className="text-[#1C1C1E] dark:text-white text-2xl font-bold transition-colors duration-300">
        <h1>RIHLA</h1>
      </div>
      <GlassNavBar activeId={activeId} handleNavigation={handleNavigation} />
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
