import "./glassCard.css";

function GlassCard({ imageOverlay }) {
  return (
    <div className="passport-side">
      <img
        src={imageOverlay}
        alt="Passport overlay"
        className="passport-overlay"
      />
    </div>
  );
}

export default GlassCard;
