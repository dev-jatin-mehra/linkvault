import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export default function AuthPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        <h1 className="mb-1 text-2xl font-semibold">LinkVault</h1>
        <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
          Sign in or create an account with Clerk.
        </p>

        <div className="space-y-3">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button
              type="button"
              className="w-full rounded-lg px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--text)",
                color: "var(--bg)",
              }}
            >
              Sign in
            </button>
          </SignInButton>

          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <button
              type="button"
              className="w-full rounded-lg border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              Create account
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
