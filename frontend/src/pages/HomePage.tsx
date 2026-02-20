import { ChevronDown } from "lucide-react";
import VerticalNav from "../components/shared/VerticalNav";
import GlassSearchBar from "../components/shared/GlassSearchBar";
import ProfilePicture from "../components/shared/ProfilePicture";
import ProfileDropdown from "../components/shared/ProfileDropdown";
import "./HomePage.css";
import bgvideo from "../assets/home-background.mp4";
import GlassNavBar from "../components/shared/GlassNavBar";
import LogoRihla from "../components/LogoRihla";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const handleNavigation = (id: string) => {
    console.log("Navigate to:", id);
  };

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
  };
  let userName = "Ilyass";
  return (
    <div className="home-page">
      <video className="videoTag" autoPlay loop muted>
        <source src={bgvideo} type="video/mp4" />
      </video>
      <nav className="home-nav">
        <div className="text-white text-2xl font-bold">
          <h1>RIHLA</h1>
        </div>
        <GlassNavBar handleNavigation={handleNavigation} />
        <div className="profile-dropdown-wrapper">
          <ProfileDropdown
            onProfile={() => navigate("/profile")}
            onSettings={() => navigate("/settings")}  
            onLanguage={() => console.log("Change language")}
            onLogout={() => console.log("Logout")}
          />
        </div>
      </nav>
      <main className="home-content">
        <h1 className="header-home">Welcome Back, {userName} </h1>
        <div className="search-container">
          <GlassSearchBar onSearch={handleSearch} />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
