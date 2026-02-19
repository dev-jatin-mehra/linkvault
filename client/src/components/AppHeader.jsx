import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  const { isLoaded } = useAuth();

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
              <SignedIn>
                <UserButton afterSignOutUrl="/" userProfileMode="modal" />
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <button
                    className="h-9 rounded-lg px-4 text-sm font-medium transition hover:-translate-y-0.5"
                    style={{
                      backgroundColor: "var(--text)",
                      color: "var(--bg)",
                    }}
                  >
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
