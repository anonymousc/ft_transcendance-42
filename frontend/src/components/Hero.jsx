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
          <h2>Rihla</h2>
          <p> By combining live data, smart technology, and clean design, we help you discover, understand, and explore information effortlessly. Our focus is on speed, simplicity, and meaningful experiences—so you spend less time figuring things out and more time discovering what matters.</p>
        </div>
      </section>
    </>
  );
}

export default Hero;