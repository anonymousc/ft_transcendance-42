import "./LoginForm.css";
import { Mail, Lock } from "lucide-react";

function LoginForm({handleSubmit}) {
  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <p>Or with your email and password</p>
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
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
