import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";
import { needsInterestsOnboarding } from "@/lib/interestsOnboarding";

function OAuthSuccess(): null {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
        if (!res.ok) {
          navigate("/login", { replace: true });
          return;
        }
        const me = (await res.json()) as { interests?: unknown };
        if (needsInterestsOnboarding(me.interests)) {
          navigate("/interests", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      } catch {
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  return null;
}

export default OAuthSuccess;
