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
            <h1>RIHLA</h1>
          </div>
          
          <div className="desktop-nav">
            <a href="#about" className="nav-link">
              About US
            </a>
            <a href="#how-it-works" className="nav-link">
              How it's Work
            </a>
            <a href="#features" className="nav-link">
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