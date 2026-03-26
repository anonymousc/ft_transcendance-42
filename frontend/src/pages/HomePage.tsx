import { useNavigate } from "react-router-dom";
import GlassSearchBar from "../components/shared/GlassSearchBar";
import TripPlannerBar from "../components/shared/TripPlannerBar";
import HomeNavBar from "../components/shared/HomeNavBar";
import "./HomePage.css";
import bgvideo from "../assets/home-background.mp4";
import { useAuth } from "@/context/AuthContext";

function HomePage() {
  const navigate = useNavigate();
  // Freetext submit → natural language search (/places/search?q=)
  const handleSearch = (query: string) => {
    if (query.trim()) navigate(`/city?q=${encodeURIComponent(query.trim())}`);
  };
  // Autocomplete city pick → exact browse (/places?city=)
  const handleSelect = (city: string) => {
    if (city.trim()) navigate(`/city?city=${encodeURIComponent(city.trim())}`);
  };
  const { user } = useAuth();
  const userName = user ? user.displayName : "";
  const firstName = userName ? userName.split(" ")[0] : "";
  return (
    <div className="home-page">
      <video className="videoTag" autoPlay loop muted>
        <source src={bgvideo} type="video/mp4" />
      </video>
      <HomeNavBar />
      <main className="home-content">
        <h1 className="header-home">Welcome Back, {firstName} </h1>
        <div className="search-container">
          <GlassSearchBar onSearch={handleSearch} onSelect={handleSelect} />
          <div className="planner-bar-spacer" />
          <TripPlannerBar />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
