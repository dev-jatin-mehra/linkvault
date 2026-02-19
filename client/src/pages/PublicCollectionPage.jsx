import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPublicCollection,
  getPublicCollectionLinks,
  trackPublicLinkClick,
} from "../api/api";
import ThemeToggle from "../components/ThemeToggle";

export default function PublicCollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPublicCollection = async () => {
      if (!id) return;

      setIsLoading(true);
      setError("");

      try {
        const [collectionData, linksData] = await Promise.all([
          getPublicCollection(id),
          getPublicCollectionLinks(id),
        ]);

        setCollection(collectionData);
        setLinks(linksData);
      } catch (err) {
        setError(
          err.message || "Failed to load collection. It may not be public.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicCollection();
  }, [id]);

  // Real-time polling for click count updates on public collections
  useEffect(() => {
    if (!id || error || isLoading) return;

    const pollLinks = async () => {
      try {
        const linksData = await getPublicCollectionLinks(id);
        setLinks(linksData);
      } catch {
        // Silent failure for background polling
      }
    };

    const interval = setInterval(pollLinks, 1000); // Poll every 1 second for immediate updates
    return () => clearInterval(interval);
  }, [id, error, isLoading]);

  const normalizeUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const handleLinkClick = async (linkId, url) => {
    // Optimistic update - increment click count immediately
    setLinks((prev) =>
      prev.map((link) =>
        link.id === linkId
          ? { ...link, click_count: (link.click_count || 0) + 1 }
          : link,
      ),
    );

    // Open link immediately (don't wait for API)
    window.open(normalizeUrl(url), "_blank", "noopener,noreferrer");

    // Track click in background
    try {
      await trackPublicLinkClick(linkId);
    } catch {
      // Ignore tracking failures (optimistic update already applied)
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-8 md:py-10"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <main className="mx-auto max-w-6xl">
        <header
          className="mb-8 flex flex-col gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <button
            onClick={() => navigate("/")}
            className="text-xl font-semibold hover:underline"
            style={{ color: "var(--text)" }}
          >
            LinkVault
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => navigate("/login")}
              className="h-9 rounded-lg px-4 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--text)",
                color: "var(--bg)",
              }}
            >
              Sign in
            </button>
          </div>
        </header>

        {isLoading ? (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p style={{ color: "var(--text-muted)" }}>Loading collection...</p>
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <p style={{ color: "var(--text)" }}>{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 rounded-lg px-4 py-2 text-sm transition hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--text)",
                color: "var(--bg)",
              }}
            >
              Go to Home
            </button>
          </div>
        ) : (
          <>
            <section
              className="mb-6 rounded-2xl border p-6"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <h1
                  className="text-2xl font-bold"
                  style={{ color: "var(--text)" }}
                >
                  {collection?.name}
                </h1>
                <span
                  className="rounded-full border px-2 py-0.5 text-xs"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  Public
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {collection?.link_count || 0} saved links
              </p>
            </section>

            <section
              className="rounded-2xl border p-6"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <h2
                className="mb-4 text-lg font-semibold"
                style={{ color: "var(--text)" }}
              >
                Links
              </h2>

              {links.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No links in this collection yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li
                      key={link.id}
                      className="rounded-xl border p-4"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface-soft)",
                      }}
                    >
                      <p
                        className="mb-1 text-sm font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        {link.title || link.url}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleLinkClick(link.id, link.url)}
                        className="mb-2 text-left text-sm underline underline-offset-2 hover:opacity-80"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {link.url}
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        {(link.tags || []).map((tag) => (
                          <span
                            key={`${link.id}-${tag}`}
                            className="rounded-full border px-2 py-0.5 text-xs"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--text-muted)",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Clicks: {link.click_count || 0}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
