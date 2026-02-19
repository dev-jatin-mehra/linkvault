import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  const { isLoaded, isSignedIn, signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const initials =
    user?.email?.[0]?.toUpperCase() ||
    user?.user_metadata?.name?.[0]?.toUpperCase() ||
    "U";

  return (
    <header
      className="mb-8 flex flex-col gap-4 rounded-2xl border p-4 shadow-sm md:flex-row md:items-center md:justify-between"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          LinkVault
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Welcome back. Organize, explore, and reuse your best links.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="flex min-h-9 min-w-27 items-center justify-end">
          {!isLoaded ? (
            <div
              className="h-9 w-24 rounded-lg border"
              style={{ borderColor: "var(--border)" }}
            />
          ) : (
            <div className="flex items-center gap-2">
              {isSignedIn ? (
                <>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      border: `1px solid var(--border)`,
                      color: "var(--text)",
                    }}
                    title={user?.email || "Account"}
                  >
                    {initials}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="h-9 rounded-lg px-3 text-sm font-medium transition hover:-translate-y-0.5"
                    style={{
                      border: `1px solid var(--border)`,
                      color: "var(--text)",
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="h-9 rounded-lg px-4 text-sm font-medium transition hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--text)",
                    color: "var(--bg)",
                  }}
                >
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
