import "./LoginForm.css";
import { Mail, Lock } from "lucide-react";
import AcceptTerms from "./shared/AcceptTerms";


interface LoginFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  submitting?: boolean;
}

function LoginForm({ handleSubmit, submitting = false }: LoginFormProps) {
  return (
    <form className="login-form" onSubmit={handleSubmit}>
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
      <AcceptTerms />
      <button type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Login'}</button>
    </form>
  );
}

export default LoginForm;
