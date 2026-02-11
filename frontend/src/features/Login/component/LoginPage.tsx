import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import SigninOuth from "../../../components/shared/SigninOuth";
import LoginForm from "../../../components/LoginForm";
import passportOverlay from "../assets/PassportOverlay.png";
import GlassCard from "../../../components/glassCard";

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
          <LoginForm handleSubmit={handleSubmit} />
          <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
          <div className="oauth-section">
            <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
              Sign in with :
            </p>
            <SigninOuth />
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              You don't have an account?
            </span>
            <Link
              to="/register"
              className="text-sm font-semibold text-[#FF8C42] hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
