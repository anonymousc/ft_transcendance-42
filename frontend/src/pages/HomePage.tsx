import GlassSearchBar from "../components/shared/GlassSearchBar";
import HomeNavBar from "../components/shared/HomeNavBar";
import "./HomePage.css";
import bgvideo from "../assets/home-background.mp4";
import { useAuth } from "@/context/AuthContext";

function HomePage() {
  const handleSearch = (query: string) => {
    console.log("Search query:", query);
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
          <GlassSearchBar onSearch={handleSearch} />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
