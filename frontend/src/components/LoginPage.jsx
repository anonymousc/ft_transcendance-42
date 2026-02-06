import { Mail, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import SigninOuth from "./SigninOuth.jsx";
import LoginForm from "./LoginForm.jsx";
import passportOverlay from "../assets/PassportOverlay.png";
import GlassCard from "./glassCard.jsx";

function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    console.log("Login attempt:", { email, password });
  };

  return (
    <main className="login-page">
      <Link to="/" className="back-arrow">
        <ArrowLeft size={28} />
      </Link>
      <div className="blob blob-card-left"></div>
      <div className="blob blob-card-center"></div>
      <div className="blob blob-card-right"></div>
      <div className="login-card">
        <GlassCard imageOverlay={passportOverlay} />
        <div className="signin-side">
          <h2>Sign in</h2>
          <div className="oauth-section">
            <p>Sign in with open accounts</p>
            <SigninOuth />
          </div>
          <LoginForm handleSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
