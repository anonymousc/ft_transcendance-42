import { Link } from 'react-router-dom';
import friendsImage from '../assets/Groupfriend.png';
import "./HeroSection.css";
import DiscoverBtn from "./shared/DiscoverBtn";
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="hero-section">
      <Button variant="outline" size="lg" onClick={() => navigate('/home')}>
        Go to Home
      </Button>
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