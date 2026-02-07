import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import "./RegisterForm.css";
import SigninOuth from "./SigninOuth";

interface RegisterFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function RegisterForm({ handleSubmit }: RegisterFormProps) {
  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <div className="name-row">
        <div className="input-wrapper">
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="First Name"
            required
          />
        </div>
        <div className="input-wrapper">
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Last Name"
            required
          />
        </div>
      </div>

      <div className="input-wrapper">
        <Mail className="input-icon" size={20} />
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          required
        />
      </div>
      <div className="input-wrapper">
        <Lock className="input-icon" size={20} />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          required
        />
      </div>

      <div className="register-actions">
        <span className="oauth-label">Or Register with :</span>
        <button type="submit">Register</button>
      </div>

      <div className="oauth-section">
        <SigninOuth />
        <span className="oauth-or">or</span>
      </div>
    </form>
  );
}

export default RegisterForm;
