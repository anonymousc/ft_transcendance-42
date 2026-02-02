import './Hero.css';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useCallback } from 'react';
import friendsImage from '../assets/Groupfriend.png';
import cloudLeft from '../assets/CLOUD1.png';
import cloudRight from '../assets/CLOUD2.png';
import sunImage from '../assets/sun.png';
import hermesImage from '../assets/hermes_god.png';
import userIcon from '../assets/utilisateur 1.png';
import compassIcon from '../assets/boussole 1.png';
import mapIcon from '../assets/espace-reserve 1.png';
import passengerIcon from '../assets/passengerIcon.png';
import excursionIcon from '../assets/excursionIcon.png';
import conversationIcon from '../assets/conversationIcon.png';
import routIcon from '../assets/routIcon.png';
import aiIcon from '../assets/aiOrangeIcone.png';
import ratingIcon from '../assets/RatingIcon.png';
import OrangeLine from '../assets/OrangeLine.png';
import Rihlaimg from '../assets/Frame 1.png';

function Hero() {
  const sectionsRef = useRef([]);
  const observerRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const children = entry.target.querySelectorAll('.animate-child');

        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Add staggered animation to children
          children.forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.1}s`;
            child.classList.add('animate-in');
          });
        } else {
          // Remove animation classes when leaving viewport for replay
          entry.target.classList.remove('animate-in');
          children.forEach((child) => {
            child.style.transitionDelay = '0s';
            child.classList.remove('animate-in');
          });
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections that have been added to the refs array
    sectionsRef.current.forEach((section) => {
      if (section) observerRef.current.observe(section);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const addToRefs = useCallback((el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
      // If observer already exists, observe the new element immediately
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    }
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover more than places,<br />
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
      <section className="about-section animate-section" id="about" ref={addToRefs}>
        {/* <div className="hermes-note">
          Did you know Hermes wasn't just the messenger of the gods? He was also the god of travel and journeys.
        </div> */}
        {/* <img src={cloudLeft} alt="Cloud" className="cloud-left" />
        <img src={cloudRight} alt="Cloud" className="cloud-right-top" />
        <img src={cloudRight} alt="Cloud" className="cloud-right-bottom" /> */}
        <div className="about-content animate-child">
          <h1 className="about-title">Rihla</h1>
          <p className="about-text">
            By combining live data, smart technology, and clean design, we help you discover, understand, and explore information effortlessly. Our focus is on speed, simplicity, and meaningful experiences—so you spend less time figuring things out and more time discovering what matters.
          </p>
        </div>
        {/* <img src={sunImage} alt="Sun" className="sun-image" />
        <img src={hermesImage} alt="Hermes" className="hermes-image" /> */}
      </section>
      <section className="how-it-works-section animate-section" id="how-it-works" ref={addToRefs}>
        <div className="how-it-works-container">
          <div className="how-it-works-item animate-child">
            <div className="how-it-works-icon">
              <img src={userIcon} alt="Sign Up" />
            </div>
            <div className="how-it-works-divider"></div>
            <div className="how-it-works-content">
              <h2 className="how-it-works-title">Sign Up</h2>
              <p className="how-it-works-text">
                Create your account in seconds and access the platform instantly.
              </p>
            </div>
          </div>

          <div className="how-it-works-item animate-child">
            <div className="how-it-works-icon">
              <img src={compassIcon} alt="Explore Live Data" />
            </div>
            <div className="how-it-works-divider"></div>
            <div className="how-it-works-content">
              <h2 className="how-it-works-title">Explore Live Data</h2>
              <p className="how-it-works-text">
                Track real-time information powered by trusted data sources and smart integrations.
              </p>
            </div>
          </div>

          <div className="how-it-works-item animate-child">
            <div className="how-it-works-icon">
              <img src={mapIcon} alt="Discover Insights" />
            </div>
            <div className="how-it-works-divider"></div>
            <div className="how-it-works-content">
              <h2 className="how-it-works-title">Discover Insights</h2>
              <p className="how-it-works-text">
                Get meaningful context and insights that help you understand what's happening—clearly and effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="features-section animate-section" id="features" ref={addToRefs}>
        <div className="features-container">
          <img src={OrangeLine} alt="Feature" />

          <div className="feature-item feature-right animate-child">
            <div className="feature-icon">
              <img src={passengerIcon} alt="Discover Morocco" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Discover Morocco, Your Way</h3>
              <p className="feature-text">
                Choose a city or an activity and instantly discover the best places, experiences, and spots Morocco has to offer.
              </p>
            </div>
          </div>

          <div className="feature-item feature-right animate-child">
            <div className="feature-icon">
              <img src={excursionIcon} alt="Travel Together" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Travel Together</h3>
              <p className="feature-text">
                Join travel groups, chat with other tourists, share tips, and plan experiences together—before and during your trip.
              </p>
            </div>
          </div>

          <div className="feature-item feature-right animate-child">
            <div className="feature-icon">
              <img src={conversationIcon} alt="Messaging" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Real-Time Messaging & Notifications</h3>
              <p className="feature-text">
                Stay connected with group chats and private messages, powered by real-time updates.
              </p>
            </div>
          </div>

          <div className="feature-item feature-left animate-child">
            <div className="feature-icon">
              <img src={routIcon} alt="Places & Activities" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Places & Activities</h3>
              <p className="feature-text">
                Explore attractions, activities, hotels, and experiences with detailed information, prices, and community ratings.
              </p>
            </div>
          </div>

          <div className="feature-item feature-left animate-child">
            <div className="feature-icon">
              <img src={aiIcon} alt="Smart Assistance" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Smart Assistance</h3>
              <p className="feature-text">
                Get instant help and answers through our AI-powered assistant, available anytime during your journey.
              </p>
            </div>
          </div>

          <div className="feature-item feature-left animate-child">
            <div className="feature-icon">
              <img src={ratingIcon} alt="Ratings & Feedback" />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">Trusted Ratings & Feedback</h3>
              <p className="feature-text">
                See what other travelers loved, rate places you've visited, and share your experience with the community.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="team-section animate-section" id="team" ref={addToRefs}>
        <h2 className="team-title animate-child">The Team behind all this</h2>
        <div className="team-container">
          <div className="team-row">
            <div className="team-card animate-child"></div>
            <div className="team-card animate-child"></div>
            <div className="team-card animate-child"></div>
          </div>
          <div className="team-row">
            <div className="team-card animate-child"></div>
            <div className="team-card animate-child"></div>
          </div>
        </div>
      </section>
      <section className="Rihla-section animate-section" ref={addToRefs}>
        <img src={Rihlaimg} alt="Rihla" className="rihla-image animate-child" />
        <Link to="/register" className="hero-button animate-child">
          Discover Now
        </Link>
      </section>
      <footer className="footer-section animate-section" ref={addToRefs}>
        <div className="footer-content">
          <div className="footer-brand animate-child">
            <h2 className="footer-logo">RIHLA</h2>
            <p className="footer-tagline">Discover and experience</p>
          </div>
          <div className="footer-links">
            <div className="footer-column animate-child">
              <h3 className="footer-column-title">Navigate</h3>
              <ul className="footer-list">
                <li><Link to="/">Home</Link></li>
                <li><a href="#about-section">About Us</a></li>
                <li><a href="#how-it-works">How it's Work</a></li>
                <li><a href="#features">Features</a></li>
              </ul>
            </div>
            <div className="footer-column animate-child">
              <h3 className="footer-column-title">Socials</h3>
              <ul className="footer-list">
                <li><a href="#">Twitter [X]</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Linkdin</a></li>
              </ul>
            </div>
            <div className="footer-column animate-child">
              <h3 className="footer-column-title">Contacts</h3>
              <ul className="footer-list">
                <li><a href="mailto:rihla@gmail.ma">rihla@gmail.ma</a></li>
                <li><a href="tel:+212000000000">+212 000 000 000</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom animate-child">
          <p>COPYRIGHT © 2026 RIHLA</p>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </footer>
    </>
  );
}

export default Hero;