import './Hero.css';
import { useLayoutEffect, useRef } from 'react';
import HeroSection from '../components/HeroSection';
import AboutUsSection from '../components/AboutUsSection';
import HowitsWorks from '../components/HowItsWorks';
import FeatureSection from '../components/FeatureSection';
import RIhlaBanner from '../components/shared/RihlaBanner';
import Footer from '../components/Footer';
import Header from '../components/Header';

// Stagger step (seconds) applied via transition-delay across each group.
const STAGGER: Record<string, number> = {
  '.how-it-works-item': 0.15,
  '.feature-right': 0.12,
  '.feature-left': 0.12,
};

// Elements revealed on scroll as they enter the viewport.
const SCROLL_SELECTOR =
  '.about-content, .how-it-works-item, .feature-right, .feature-left, .hero-button, .footer-bottom';

function Hero() {
  const mainRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const rihlaRef = useRef(null);
  const footerRef = useRef(null);

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // CSS already shows everything for reduced motion.

    // Apply staggered transition delays per group.
    Object.entries(STAGGER).forEach(([selector, step]) => {
      root.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
        el.style.transitionDelay = `${i * step}s`;
      });
    });
    // The hero image trails the hero text slightly, like the old timeline.
    root.querySelectorAll<HTMLElement>('.hero-image').forEach((el) => {
      el.style.transitionDelay = '0.2s';
    });

    // Above-the-fold content reveals immediately on mount.
    const onLoad = root.querySelectorAll<HTMLElement>('.hero-content, .hero-image');
    const raf = requestAnimationFrame(() => {
      onLoad.forEach((el) => el.classList.add('is-visible'));
    });

    // Scroll-triggered reveals — re-toggle so they replay when scrolled back.
    const targets = root.querySelectorAll<HTMLElement>(SCROLL_SELECTOR);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );
    targets.forEach((el) => observer.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={mainRef}>
      <Header />
      <HeroSection />
      <AboutUsSection aboutRef={aboutRef} />
      <HowitsWorks howItWorksRef={howItWorksRef} />
      <FeatureSection featuresRef={featuresRef} />
      <RIhlaBanner rihlaRef={rihlaRef} />
      <Footer footerRef={footerRef} />
    </div>
  );
}

export default Hero;