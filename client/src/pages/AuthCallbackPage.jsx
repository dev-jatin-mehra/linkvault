import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      navigate("/dashboard", { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg) px-4">
        <div
          className="rounded-2xl border px-5 py-4 text-sm shadow-sm"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
            color: "var(--text)",
          }}
        >
          Completing sign-in...
        </div>
      </div>
    );
  }

  return <Navigate to={isSignedIn ? "/dashboard" : "/login"} replace />;
}
