import './Hero.css';
import { Link } from 'react-router-dom';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
import BigAtlass from '../assets/BigAtlass.png';
import HeroSection from './HeroSection';

gsap.registerPlugin(ScrollTrigger);

function Hero() {
  const mainRef = useRef(null);
  const aboutRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const rihlaRef = useRef(null);
  const footerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });

      gsap.from('.hero-image', {
        y: 80,
        opacity: 0,
        duration: 1.2,
        delay: 0.3,
        ease: 'power3.out',
      });

      // gsap.from('')

      gsap.from('.about-content', {
        scrollTrigger: {
          trigger: aboutRef.current,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.from('.how-it-works-item', {
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: 'top 75%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
      });

      gsap.from('.feature-right', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        x: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
      });

      gsap.from('.feature-left', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        x: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
      });

      gsap.from('.rihla-image', {
        scrollTrigger: {
          trigger: rihlaRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
      });

      gsap.from('.Rihla-section .hero-button', {
        scrollTrigger: {
          trigger: rihlaRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
        ease: 'power2.out',
      });

      gsap.from('.footer-brand', {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from('.footer-column', {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });

      gsap.from('.footer-bottom', {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 60%',
          toggleActions: 'play none none reverse',
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef}>
      <HeroSection friendsImage={friendsImage} />
      <section className="about-section" id="about" ref={aboutRef}>
        {/* <div className="hermes-note">
          Did you know Hermes wasn't just the messenger of the gods? He was also the god of travel and journeys.
        </div> */}
        {/* <img src={cloudLeft} alt="Cloud" className="cloud-left" />
        <img src={cloudRight} alt="Cloud" className="cloud-right-top" />
        <img src={cloudRight} alt="Cloud" className="cloud-right-bottom" /> */}
        <div className="about-content">
          <h1 className="about-title">Rihla</h1>
          <p className="about-text">
            By combining live data, smart technology, and clean design, we help you discover, understand, and explore information effortlessly. Our focus is on speed, simplicity, and meaningful experiences—so you spend less time figuring things out and more time discovering what matters.
          </p>
        </div>
        {/* <img src={sunImage} alt="Sun" className="sun-image" />
        <img src={hermesImage} alt="Hermes" className="hermes-image" /> */}
      </section>
      <section className="how-it-works-section" id="how-it-works" ref={howItWorksRef}>
        <div className="how-it-works-container">
          <div className="how-it-works-item">
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

          <div className="how-it-works-item">
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

          <div className="how-it-works-item">
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
      <section className="features-section" id="features" ref={featuresRef}>
        <div className="features-container">
          <img src={OrangeLine} alt="Feature" />

          <div className="feature-item feature-right">
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

          <div className="feature-item feature-right">
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

          <div className="feature-item feature-right">
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

          <div className="feature-item feature-left">
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

          <div className="feature-item feature-left">
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

          <div className="feature-item feature-left">
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
      <section className="Rihla-section" ref={rihlaRef}>
        <img src={Rihlaimg} alt="Rihla" className="rihla-image" />
        <Link to="/register" className="hero-button">
          Discover Now
        </Link>
      </section>
      <img src={BigAtlass} alt="Big Atllas" className="big-atlass-image" />
      <footer className="footer-section" ref={footerRef}>
        <div className="footer-content">
          <div className="footer-brand">
            <h2 className="footer-logo">RIHLA</h2>
            <p className="footer-tagline">Discover and experience</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3 className="footer-column-title">Navigate</h3>
              <ul className="footer-list">
                <li><Link to="/">Home</Link></li>
                <li><a href="#about-section">About Us</a></li>
                <li><a href="#how-it-works">How it's Work</a></li>
                <li><a href="#features">Features</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-column-title">Socials</h3>
              <ul className="footer-list">
                <li><a href="#">Twitter [X]</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Linkdin</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="footer-column-title">Contacts</h3>
              <ul className="footer-list">
                <li><a href="mailto:rihla@gmail.ma">rihla@gmail.ma</a></li>
                <li><a href="tel:+212000000000">+212 000 000 000</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>COPYRIGHT © 2026 RIHLA</p>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}

export default Hero;