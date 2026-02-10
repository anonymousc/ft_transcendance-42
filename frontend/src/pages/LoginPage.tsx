import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import SigninOuth from "../components/shared/SigninOuth";
import LoginForm from "../components/LoginForm";
import passportOverlay from "../assets/PassportOverlay.png";
import GlassCard from "../components/glassCard";

function LoginPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
