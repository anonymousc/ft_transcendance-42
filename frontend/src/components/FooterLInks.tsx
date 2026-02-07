import { Link } from "react-router-dom";

function FooterLinks() {
    return (
        <div className="footer-links">
            <div className="footer-column">
                <h3 className="footer-column-title">Navigate</h3>
                <ul className="footer-list">
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/about-section">About Us</Link>
                    </li>
                    <li>
                        <Link to="/how-it-works">How it Works</Link>
                    </li>
                    <li>
                        <Link to="/features">Features</Link>
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
    );
}

export default FooterLinks;