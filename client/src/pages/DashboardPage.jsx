import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import AppHeader from "../components/AppHeader";
import CollectionPanel from "../components/CollectionPanel";
import LinksPanel from "../components/LinksPanel";
import useLinkVault from "../hooks/useLinkVault";

export default function DashboardPage() {
  const containerRef = useRef(null);

  const {
    collections,
    selectedId,
    selectedCollection,
    links,
    members,
    analytics,
    searchQuery,
    searchResults,
    isCollectionsLoading,
    isLinksLoading,
    isMembersLoading,
    isSearching,
    error,
    setSearchQuery,
    addCollection,
    editCollection,
    removeCollection,
    toggleCollectionVisibility,
    shareWithMember,
    removeMember,
    selectCollection,
    addLink,
    editLink,
    removeLink,
    trackClick,
  } = useLinkVault();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dash-animate",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen px-4 py-6 md:py-8"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <main className="mx-auto max-w-6xl">
        <div className="dash-animate relative z-30">
          <AppHeader />
        </div>

        {error ? (
          <div
            className="dash-animate mb-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
            }}
          >
            {error}
          </div>
        ) : null}

        {analytics?.summary ? (
          <section className="dash-animate mb-4 grid gap-3 sm:grid-cols-3">
            <div
              className="rounded-xl border px-4 py-3"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <p
                className="text-xs uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Collections
              </p>
              <p className="text-xl font-semibold">
                {analytics.summary.total_collections}
              </p>
            </div>
            <div
              className="rounded-xl border px-4 py-3"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <p
                className="text-xs uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Links
              </p>
              <p className="text-xl font-semibold">
                {analytics.summary.total_links}
              </p>
            </div>
            <div
              className="rounded-xl border px-4 py-3"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <p
                className="text-xs uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Total Clicks
              </p>
              <p className="text-xl font-semibold">
                {analytics.summary.total_clicks}
              </p>
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="dash-animate">
            <CollectionPanel
              collections={collections}
              selectedId={selectedId}
              selectedCollection={selectedCollection}
              members={members}
              onSelect={selectCollection}
              onAddCollection={addCollection}
              onEditCollection={editCollection}
              onDeleteCollection={removeCollection}
              onToggleVisibility={toggleCollectionVisibility}
              onShareMember={shareWithMember}
              onRemoveMember={removeMember}
              isLoading={isCollectionsLoading}
              isMembersLoading={isMembersLoading}
            />
          </div>

          {selectedCollection ? (
            <div className="dash-animate">
              <LinksPanel
                selectedCollection={selectedCollection}
                links={links}
                searchQuery={searchQuery}
                searchResults={searchResults}
                onAddLink={addLink}
                onEditLink={editLink}
                onDeleteLink={removeLink}
                onTrackClick={trackClick}
                onSearchChange={setSearchQuery}
                isLoading={isLinksLoading}
                isSearching={isSearching}
              />
            </div>
          ) : (
            <div
              className="dash-animate rounded-2xl border border-dashed p-5"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--text)" }}
              >
                Start here
              </h3>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {collections.length
                  ? "Click a collection to view links, sharing, and analytics details. Click it again to collapse."
                  : "Create your first collection on the left. Link and sharing tools will appear after that."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
