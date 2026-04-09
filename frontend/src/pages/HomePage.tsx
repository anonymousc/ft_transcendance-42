import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassSearchBar from "../components/shared/GlassSearchBar";
import TripPlannerBar from "../components/shared/TripPlannerBar";
import HomeNavBar from "../components/shared/HomeNavBar";
import "./HomePage.css";
import bgvideo from "../assets/home-background.mp4";
import { useAuth } from "@/context/AuthContext";

function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'explore' | 'plan'>('explore');
  const handleSearch = (query: string) => {
    if (query.trim()) navigate(`/city?q=${encodeURIComponent(query.trim())}`);
  };
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
          <div className="tab-switcher">
            <button
              className={`tab-btn${activeTab === 'explore' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('explore')}
            >
              Explore
            </button>
            <button
              className={`tab-btn${activeTab === 'plan' ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab('plan')}
            >
              Plan a Trip
            </button>
          </div>
          <div className="tab-bar-surface">
            <div className={`tab-panel${activeTab === 'explore' ? ' tab-panel--active' : ''}`}>
              <GlassSearchBar onSearch={handleSearch} onSelect={handleSelect} />
            </div>
            <div className={`tab-panel${activeTab === 'plan' ? ' tab-panel--active' : ''}`}>
              <TripPlannerBar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
