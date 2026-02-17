import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function OAuthSuccess(): null {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token: string | null = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/home", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
}

export default OAuthSuccess;
