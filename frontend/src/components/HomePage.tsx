import { ChevronDown } from "lucide-react";
import VerticalNav from "./shared/VerticalNav";
import GlassSearchBar from "./shared/GlassSearchBar";
import ProfilePicture from "./shared/ProfilePicture";
import "./HomePage.css";
import bgvideo from "../assets/home-background.mp4";
import GlassNavBar from "./shared/GlassNavBar";

function HomePage() {
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
      {/* <VerticalNav onNavigate={handleNavigation} /> */}
      <GlassNavBar handleNavigation={handleNavigation} />
      <main className="home-content">
        <h1 className="header-home">Welcome Back, {userName}</h1>
        <ProfilePicture />
        <div className="search-container">
          <GlassSearchBar onSearch={handleSearch} />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
