import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OAuthSuccess(): null {
  const navigate = useNavigate();

  useEffect(() => {
    // Cookie is set by backend during OAuth callback; nothing to store client-side.
    navigate("/home", { replace: true });
  }, [navigate]);

  return null;
}

export default OAuthSuccess;
