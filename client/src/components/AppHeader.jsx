import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  const navigate = useNavigate();
  const {
    isLoaded,
    isSignedIn,
    signOut,
    deleteAccount,
    user,
    requestPasswordReset,
  } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (isDeleteConfirmOpen) {
          setIsDeleteConfirmOpen(false);
          return;
        }
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDeleteConfirmOpen]);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const email = user?.email || "No email";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handlePasswordReset = async () => {
    setProfileMessage("");
    setIsSendingReset(true);
    try {
      await requestPasswordReset();
      setProfileMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setProfileMessage(error.message || "Failed to send reset email.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate("/", { replace: true });
  };

  const handleDeleteAccount = async () => {
    setProfileMessage("");

    setIsDeleteConfirmOpen(false);

    setIsDeletingAccount(true);
    try {
      await deleteAccount();
    } catch (error) {
      setProfileMessage(error.message || "Failed to delete account.");
    } finally {
      setIsMenuOpen(false);
      setIsDeletingAccount(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <>
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
              <div className="flex items-center gap-2" ref={menuRef}>
                {isSignedIn ? (
                  <div className="relative">
                    <button
                      type="button"
                      className="flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition hover:-translate-y-0.5"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface-soft)",
                        color: "var(--text)",
                      }}
                      onClick={() => {
                        setIsMenuOpen((prev) => !prev);
                        setProfileMessage("");
                      }}
                    >
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--text)",
                          color: "var(--bg)",
                        }}
                      >
                        {initials || "U"}
                      </span>
                      <span className="max-w-28 truncate">{displayName}</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          transform: isMenuOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 160ms ease",
                        }}
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {isMenuOpen ? (
                      <div
                        className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border p-3 shadow-xl"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--surface)",
                        }}
                      >
                        <div
                          className="mb-3 rounded-xl border p-3"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            {displayName}
                          </p>
                          <p
                            className="mt-1 truncate text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {email}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <button
                            type="button"
                            className="w-full rounded-lg border px-3 py-2 text-left text-sm"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--text)",
                              backgroundColor: "var(--surface-soft)",
                            }}
                            onClick={handlePasswordReset}
                            disabled={isSendingReset || isDeletingAccount}
                          >
                            {isSendingReset
                              ? "Sending reset email..."
                              : "Change password"}
                          </button>

                          <button
                            type="button"
                            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium"
                            style={{
                              backgroundColor: "var(--text)",
                              color: "var(--bg)",
                            }}
                            onClick={handleSignOut}
                            disabled={isDeletingAccount}
                          >
                            Sign out
                          </button>

                          <button
                            type="button"
                            className="w-full rounded-lg border px-3 py-2 text-left text-sm font-medium"
                            style={{
                              borderColor: "#b91c1c",
                              color: "#fecaca",
                              backgroundColor: "#3f0a0a",
                            }}
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsDeleteConfirmOpen(true);
                            }}
                            disabled={isDeletingAccount || isSendingReset}
                          >
                            {isDeletingAccount
                              ? "Deleting account..."
                              : "Delete account"}
                          </button>
                        </div>

                        {profileMessage ? (
                          <p
                            className="mt-2 text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {profileMessage}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="h-9 rounded-lg px-4 text-sm font-medium transition hover:-translate-y-0.5"
                    style={{
                      backgroundColor: "var(--text)",
                      color: "var(--bg)",
                    }}
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {isDeleteConfirmOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-120 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.62)" }}
            >
              <div
                className="w-full max-w-md rounded-2xl border p-5 shadow-2xl"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Delete account?
                </h3>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  This will permanently remove your collections, links, and
                  analytics. This action cannot be undone.
                </p>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border px-4 py-2 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text)",
                      backgroundColor: "var(--surface-soft)",
                    }}
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    disabled={isDeletingAccount}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border px-4 py-2 text-sm font-semibold"
                    style={{
                      borderColor: "#b91c1c",
                      color: "#fecaca",
                      backgroundColor: "#3f0a0a",
                    }}
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? "Deleting account..." : "Yes, delete"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
