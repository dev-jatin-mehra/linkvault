import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeEmail = (value = "") => value.trim().toLowerCase();

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");

    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(authError.message || "Google sign-in failed.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setError("Full name is required for signup.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(normalizedEmail, password);
        navigate("/dashboard", { replace: true });
        return;
      }

      await signUp(normalizedEmail, password, fullName.trim());
      setMessage(
        "Account created. Check your email for verification if your project requires confirmation.",
      );
      setMode("signin");
      setFullName("");
      setConfirmPassword("");
    } catch (authError) {
      setError(authError.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      onClick={() => navigate("/")}
    >
      <div
        className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: "#22c55e22" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: "#0ea5e922" }}
      />

      <div
        className="w-full max-w-md rounded-3xl border p-6 shadow-xl sm:p-7"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-soft)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.5 12L12 8.5M12 8.5L15.5 5M12 8.5L15.5 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15.5L8.5 19M12 15.5L8.5 12M12 15.5L15.5 19"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h1 className="text-2xl font-bold">LinkVault</h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Save, organize, and revisit your best links.
            </p>
          </div>

          <span
            className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface-soft)",
              color: "var(--text-muted)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3L20 7V12C20 16.5 16.9 20.6 12 22C7.1 20.6 4 16.5 4 12V7L12 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Secure Auth
          </span>
        </div>

        <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
          {mode === "signin" ? "Sign in to your account" : "Create an account"}
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface-soft)",
            color: "var(--text)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.805 10.023H12.2V13.98H17.75C17.44 15.79 16.4 17.32 14.84 18.34L18.19 20.92C20.15 19.1 21.28 16.44 21.28 13.3C21.28 12.2 21.18 11.14 20.99 10.12L21.805 10.023Z"
              fill="#4285F4"
            />
            <path
              d="M12.2 22C14.95 22 17.26 21.09 18.19 20.92L14.84 18.34C13.93 18.95 12.76 19.32 11.38 19.32C8.74 19.32 6.5 17.54 5.67 15.15L2.2 17.82C3.73 20.84 7.67 22 12.2 22Z"
              fill="#34A853"
            />
            <path
              d="M5.67 15.15C5.47 14.55 5.35 13.91 5.35 13.25C5.35 12.59 5.47 11.95 5.67 11.35L2.2 8.68C1.49 10.04 1.09 11.59 1.09 13.25C1.09 14.91 1.49 16.46 2.2 17.82L5.67 15.15Z"
              fill="#FBBC05"
            />
            <path
              d="M12.2 7.18C13.94 7.18 15.49 7.78 16.71 8.96L18.27 7.4C17.26 6.45 14.95 5.5 12.2 5.5C7.67 5.5 3.73 6.66 2.2 9.68L5.67 12.35C6.5 9.96 8.74 7.18 12.2 7.18Z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" ? (
            <label className="block">
              <span
                className="mb-1 block text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Full name
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                }}
              />
            </label>
          ) : null}

          <label className="block">
            <span
              className="mb-1 block text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmail((prev) => normalizeEmail(prev))}
              placeholder="you@example.com"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            />
          </label>

          <label className="block">
            <span
              className="mb-1 block text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            />
          </label>

          {mode === "signup" ? (
            <label className="block">
              <span
                className="mb-1 block text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Confirm password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                }}
              />
            </label>
          ) : null}

          {error ? (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{
              backgroundColor: "var(--text)",
              color: "var(--bg)",
            }}
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setFullName("");
                setError("");
                setMessage("");
              }}
              className="underline underline-offset-2"
              style={{ color: "var(--text)" }}
            >
              New here? Create account
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setFullName("");
                setConfirmPassword("");
                setError("");
                setMessage("");
              }}
              className="underline underline-offset-2"
              style={{ color: "var(--text)" }}
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
