import { Link } from 'react-router-dom';
import "./Footer.css";
import RIhlaBanner from './RihlaBanner';
import RIhlaBrand from './RIhlaBrand';
function Footer({footerRef}: {footerRef: React.RefObject<HTMLElement | null>}) {
  return (
    <footer className="footer-section" ref={footerRef}>
      <div className="footer-content">
        <RIhlaBrand />
        <div className="footer-links">
          <div className="footer-column">
            <h3 className="footer-column-title">Navigate</h3>
            <ul className="footer-list">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <a href="#about-section">About Us</a>
              </li>
              <li>
                <a href="#how-it-works">How it Works</a>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3 className="footer-column-title">Socials</h3>
            <ul className="footer-list">
              <li>
                <a href="#">Twitter [X]</a>
              </li>
              <li>
                <a href="#">Instagram</a>
              </li>
              <li>
                <a href="#">Facebook</a>
              </li>
              <li>
                <a href="#">LinkedIn</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3 className="footer-column-title">Contacts</h3>
            <ul className="footer-list">
              <li>
                <a href="mailto:rihla@gmail.ma">rihla@gmail.ma</a>
              </li>
              <li>
                <a href="tel:+212000000000">+212 000 000 000</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>COPYRIGHT © 2026 RIHLA</p>
        <Link to="/privacy">Privacy Policy</Link>
      </div>
    </footer>
  );
}

export default Footer;
