import userIcon from '../assets/utilisateur 1.png';
import compassIcon from '../assets/boussole 1.png';
import mapIcon from '../assets/espace-reserve 1.png';
import "./HowItsWorks.css";

function HowitsWorks({ howItWorksRef }: { howItWorksRef: React.RefObject<HTMLElement | null> }) {
  return (
    <section
      className="how-it-works-section"
      id="how-it-works"
      ref={howItWorksRef}
    >
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
              Track real-time information powered by trusted data sources and
              smart integrations.
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
              Get meaningful context and insights that help you understand
              what's happening—clearly and effortlessly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowitsWorks;
