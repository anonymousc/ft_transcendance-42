import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setIsScrolled(window.scrollY >= heroHeight - 64);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = ['about', 'how-it-works', 'features'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className={`Header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav">
        <div className="nav-container">
          <div className="logo">
            <h1>RIHLA</h1>
          </div>
          
          <div className="desktop-nav">
            <a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}>
              About US
            </a>
            <a href="#how-it-works" className={`nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}>
              How it's Work
            </a>
            <a href="#features" className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}>
              Features
            </a>
          </div>

          <div className="cta-container">
            <Link to="/login" className="login-button">Login</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;