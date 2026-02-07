import { Link } from "react-router-dom";
import "./LoginBtn.css";

function LoginBtn() {
  return (
    <div className="cta-container">
      <Link to="/login" className="LoginBtn">
        Login
      </Link>
    </div>
  );
}

export default LoginBtn;
