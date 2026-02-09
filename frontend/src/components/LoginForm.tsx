import "./LoginForm.css";
import { Mail, Lock } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function LoginForm({ handleSubmit }: LoginFormProps) {
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
      <div className="flex gap-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
