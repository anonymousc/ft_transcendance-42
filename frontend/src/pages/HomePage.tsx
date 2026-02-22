import GlassSearchBar from "../components/shared/GlassSearchBar";
import HomeNavBar from "../components/shared/HomeNavBar";
import "./HomePage.css";
import bgvideo from "../assets/home-background.mp4";

function HomePage() {
  const handleSearch = (query: string) => {
    console.log("Search query:", query);
  };
  let userName = "Ilyass";
  return (
    <div className="home-page">
      <video className="videoTag" autoPlay loop muted>
        <source src={bgvideo} type="video/mp4" />
      </video>
      <HomeNavBar />
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
