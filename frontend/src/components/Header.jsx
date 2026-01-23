import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="Header">
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
            Login
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;