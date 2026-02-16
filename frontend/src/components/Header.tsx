import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import LoginBtn from './shared/LoginBtn.js';
import DesktopNav from './DesktopNav.jsx';
import LogoRihla from './LogoRihla.jsx';
import ThemeToggle from './shared/ThemeToggle';

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

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
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
          <LogoRihla/>
          <DesktopNav activeSection={activeSection} />
          <div className="nav-right">
            <ThemeToggle />
            <LoginBtn />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;