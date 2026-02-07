import { Link } from "react-router-dom";
import "./HeroSection.css";

function HeroSection({ friendsImage }: { friendsImage: string }) {
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
        <Link to="/register" className="hero-button">
          Discover Now
        </Link>
      </div>
      <div className="hero-image">
        <img src={friendsImage} alt="Friends exploring together" />
      </div>
    </section>
  );
}

export default HeroSection;