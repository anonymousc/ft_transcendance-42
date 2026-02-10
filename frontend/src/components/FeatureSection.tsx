import passengerIcon from '../assets/passengerIcon.png';
import excursionIcon from '../assets/excursionIcon.png';
import conversationIcon from '../assets/conversationIcon.png';
import routIcon from '../assets/routIcon.png';
import aiIcon from '../assets/aiOrangeIcone.png';
import ratingIcon from '../assets/RatingIcon.png';
import OrangeLine from '../assets/OrangeLine.png';
import "./FeatureSection.css";
function FeatureSection({ featuresRef } : { featuresRef: React.RefObject<HTMLElement | null> }) {
  return (
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
              Choose a city or an activity and instantly discover the best
              places, experiences, and spots Morocco has to offer.
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
              Join travel groups, chat with other tourists, share tips, and plan
              experiences together—before and during your trip.
            </p>
          </div>
        </div>

        <div className="feature-item feature-right">
          <div className="feature-icon">
            <img src={conversationIcon} alt="Messaging" />
          </div>
          <div className="feature-content">
            <h3 className="feature-title">
              Real-Time Messaging & Notifications
            </h3>
            <p className="feature-text">
              Stay connected with group chats and private messages, powered by
              real-time updates.
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
              Explore attractions, activities, hotels, and experiences with
              detailed information, prices, and community ratings.
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
              Get instant help and answers through our AI-powered assistant,
              available anytime during your journey.
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
              See what other travelers loved, rate places you've visited, and
              share your experience with the community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;