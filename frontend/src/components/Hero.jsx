import './Hero.css';
function Hero() {
  return (
    <>
      {/* Hero Section*/}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Discover more than places
            Discover Experiences
          </h1>
          <p className="hero-subtitle">
            Explore cities, activities, and communities tailored to you.
          </p>  
          <button className="hero-button">
            Discover Now
          </button>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <div className="content-container">
          <h2>About Us</h2>
          <p>Your content goes here...</p>
        </div>
      </section>
    </>
  );
}

export default Hero;