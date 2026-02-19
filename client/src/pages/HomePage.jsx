import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const containerRef = useRef(null);
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-animate",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" },
      );

      gsap.fromTo(
        ".feature-animate",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3,
        },
      );

      gsap.to(".orb-animate", {
        y: -10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen px-4 py-8 md:py-10"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <main className="mx-auto max-w-6xl">
        <header
          className="hero-animate mb-12 flex flex-col gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--text)" }}
          >
            LinkVault
          </h1>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <ThemeToggle />

            <div className="flex min-h-9 min-w-27 items-center justify-end">
              {!isLoaded ? (
                <div
                  className="h-9 w-24 rounded-lg border"
                  style={{ borderColor: "var(--border)" }}
                />
              ) : (
                <>
                  <SignedOut>
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                      <button
                        className="h-9 rounded-lg px-4 text-sm font-semibold transition hover:-translate-y-0.5"
                        style={{
                          backgroundColor: "var(--text)",
                          color: "var(--bg)",
                        }}
                      >
                        Sign in
                      </button>
                    </SignInButton>
                  </SignedOut>

                  <SignedIn>
                    <div className="h-9 w-24" />
                  </SignedIn>
                </>
              )}
            </div>
          </div>
        </header>

        <section
          className="relative mb-10 overflow-hidden rounded-3xl border p-6 md:p-10"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <div
            className="orb-animate pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
            style={{ backgroundColor: "var(--surface-soft)" }}
          />

          <p
            className="hero-animate mb-3 inline-block rounded-full border px-3 py-1 text-xs font-medium tracking-wide"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Your modern link workspace
          </p>
          <h2
            className="hero-animate mb-4 max-w-3xl text-3xl font-bold leading-tight md:text-5xl"
            style={{ color: "var(--text)" }}
          >
            Organize knowledge beautifully, one collection at a time.
          </h2>
          <p
            className="hero-animate max-w-2xl text-base md:text-lg"
            style={{ color: "var(--text-muted)" }}
          >
            Build focused collections, save references instantly, and access
            your research from one elegant dashboard.
          </p>

          <div className="hero-animate mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--text)",
                color: "var(--bg)",
              }}
            >
              Get Started Free
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article
            className="feature-animate rounded-2xl border p-5"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <h3 className="mb-2 text-lg font-semibold">Curated Collections</h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Group links by topics like frontend, backend, AI, or interview
              prep.
            </p>
          </article>

          <article
            className="feature-animate rounded-2xl border p-5"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <h3 className="mb-2 text-lg font-semibold">Fast Capture</h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Save URLs with optional titles in seconds and keep your flow
              uninterrupted.
            </p>
          </article>

          <article
            className="feature-animate rounded-2xl border p-5"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <h3 className="mb-2 text-lg font-semibold">Clean Dashboard</h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Browse collections and links in a distraction-free, responsive
              interface.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
