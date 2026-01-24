import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setIsScrolled(window.scrollY >= heroHeight - 64);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`Header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav">
        <div className="nav-container">
          <div className="logo">
            <h1>Rihla</h1>
          </div>
          
          <div className="desktop-nav">
            <a href="#home" className="nav-link">
              About Us
            </a>
            <a href="#about" className="nav-link">
              How It Works
            </a>
            <a href="#services" className="nav-link">
              Features
            </a>
          </div>

          <div className="cta-container">
            <Link to="/login" className="login-link">Login</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;