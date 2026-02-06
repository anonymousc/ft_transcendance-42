function AboutUsSection({aboutRef}) {
  return (
    <section className="about-section" id="about" ref={aboutRef}>
      {/* <div className="hermes-note">
          Did you know Hermes wasn't just the messenger of the gods? He was also the god of travel and journeys.
        </div> */}
      {/* <img src={cloudLeft} alt="Cloud" className="cloud-left" />
        <img src={cloudRight} alt="Cloud" className="cloud-right-top" />
        <img src={cloudRight} alt="Cloud" className="cloud-right-bottom" /> */}
      <div className="about-content">
        <h1 className="about-title">Rihla</h1>
        <p className="about-text">
          By combining live data, smart technology, and clean design, we help
          you discover, understand, and explore information effortlessly. Our
          focus is on speed, simplicity, and meaningful experiences—so you spend
          less time figuring things out and more time discovering what matters.
        </p>
      </div>
      {/* <img src={sunImage} alt="Sun" className="sun-image" />
        <img src={hermesImage} alt="Hermes" className="hermes-image" /> */}
    </section>
  );
}
export default AboutUsSection;