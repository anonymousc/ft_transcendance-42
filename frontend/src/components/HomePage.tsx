import { ChevronDown } from "lucide-react";
import VerticalNav from "./shared/VerticalNav";
import GlassSearchBar from "./shared/GlassSearchBar";
import "./HomePage.css";

import largeCloud from "../assets/large-3d-cloud.png";
import smallCloud from "../assets/small-3d-cloud.png";

function HomePage() {
    const handleNavigation = (id: string) => {
        console.log("Navigate to:", id);
    };

    const handleSearch = (query: string) => {
        console.log("Search query:", query);
        
    };

    return (
        <div className="home-page">
            <VerticalNav onNavigate={handleNavigation} />

            <div className="clouds-container">
                <img src={largeCloud} alt="" className="cloud cloud-large" />
                <img src={smallCloud} alt="" className="cloud cloud-s   mall-left" />
            </div>

            <main className="home-content">
                <div className="search-container">
                    <GlassSearchBar onSearch={handleSearch} />
                </div>
            </main>

            <div className="scroll-indicator">
                <ChevronDown size={32} />
            </div>
        </div>
    );
}

export default HomePage;
