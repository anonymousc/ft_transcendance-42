import { useNavigate, useLocation } from "react-router-dom";
import GlassNavBar from "./GlassNavBar";
import ProfileDropdown from "./ProfileDropdown";
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
  const activeId = PATH_TO_NAV_ID[location.pathname] ?? "home";

  const handleNavigation = (id: string) => {
    const path = NAV_ID_TO_PATH[id];
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav className="home-nav">
      <div className="text-white text-2xl font-bold">
        <h1>RIHLA</h1>
      </div>
      <GlassNavBar activeId={activeId} handleNavigation={handleNavigation} />
      <div className="profile-dropdown-wrapper">
        <ProfileDropdown
          onProfile={() => navigate("/profile")}
          onSettings={() => navigate("/settings")}
          onLanguage={() => console.log("Change language")}
          onLogout={() => console.log("Logout")}
        />
      </div>
    </nav>
  );
}

export default HomeNavBar;
