import friendsImage from '../assets/Groupfriend.png';
import "./HeroSection.css";
import DiscoverBtn from "./shared/DiscoverBtn";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Discover more than places,
          <br />
          Discover experiences.
        </h1>
        <p className="hero-subtitle">
          Explore cities, activities, and communities tailored to you.
        </p>
        <DiscoverBtn />
      </div>
      <div className="hero-image">
        <img src={friendsImage} alt="Friends exploring together" />
      </div>
    </section>
  );
}

export default HeroSection;