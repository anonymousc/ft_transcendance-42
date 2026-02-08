import { ChevronDown } from "lucide-react";
import VerticalNav from "./shared/VerticalNav";
import GlassSearchBar from "./shared/GlassSearchBar";
import "./HomePage.css";
import bgImage from "../assets/imssouane.png";

import largeCloud from "../assets/large-3d-cloud.png";
import smallCloud from "../assets/small-3d-cloud.png";
import bgvideo from "../assets/home-background.mp4";

function HomePage() {
  const handleNavigation = (id: string) => {
    console.log("Navigate to:", id);
  };

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
  };

  return (
    <div className="home-page">
      <video className="videoTag" autoPlay loop muted>
        <source src={bgvideo} type="video/mp4" />
      </video>
      <VerticalNav onNavigate={handleNavigation} />
      <main className="home-content">
        {/* <h1 className="header-home">Where do you want to go next ?</h1> */}
        <div className="search-container">
          <GlassSearchBar onSearch={handleSearch} />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
