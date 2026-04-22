import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import CollectionPanel from "../components/CollectionPanel";
import CollectionDetailsPanel from "../components/CollectionDetailsPanel";
import LinksPanel from "../components/LinksPanel";
import useLinkVault from "../hooks/useLinkVault";

const LEFT_PANEL_MIN = 240;
const LEFT_PANEL_MAX = 380;
const RIGHT_PANEL_MIN = 260;
const RIGHT_PANEL_MAX = 380;
const LEFT_PANEL_DEFAULT = 300;
const RIGHT_PANEL_DEFAULT = 320;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function DashboardPage() {
  const containerRef = useRef(null);
  const dragStateRef = useRef(null);
  const [detailsTab, setDetailsTab] = useState(() => {
    if (typeof window === "undefined") return "overview";
    return window.localStorage.getItem("linkvault:details-tab") || "overview";
  });
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    if (typeof window === "undefined") return LEFT_PANEL_DEFAULT;
    const persisted = Number(
      window.localStorage.getItem("linkvault:left-panel-width"),
    );
    return Number.isFinite(persisted)
      ? clamp(persisted, LEFT_PANEL_MIN, LEFT_PANEL_MAX)
      : LEFT_PANEL_DEFAULT;
  });
  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    if (typeof window === "undefined") return RIGHT_PANEL_DEFAULT;
    const persisted = Number(
      window.localStorage.getItem("linkvault:right-panel-width"),
    );
    return Number.isFinite(persisted)
      ? clamp(persisted, RIGHT_PANEL_MIN, RIGHT_PANEL_MAX)
      : RIGHT_PANEL_DEFAULT;
  });
  const [isWideLayout, setIsWideLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const [mobilePanel, setMobilePanel] = useState(() => {
    if (typeof window === "undefined") return "collections";
    return window.localStorage.getItem("linkvault:mobile-panel") || "collections";
  });

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedId) {
      window.localStorage.setItem("linkvault:selected-collection", selectedId);
    } else {
      window.localStorage.removeItem("linkvault:selected-collection");
    }
  }, [selectedId]);

  useEffect(() => {
    if (selectedId || !collections.length || typeof window === "undefined") {
      return;
    }

    const persistedCollectionId = window.localStorage.getItem(
      "linkvault:selected-collection",
    );

    if (
      persistedCollectionId &&
      collections.some((item) => item.id === persistedCollectionId)
    ) {
      selectCollection(persistedCollectionId);
    }
  }, [collections, selectedId, selectCollection]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("linkvault:details-tab", detailsTab);
  }, [detailsTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "linkvault:left-panel-width",
      String(leftPanelWidth),
    );
  }, [leftPanelWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "linkvault:right-panel-width",
      String(rightPanelWidth),
    );
  }, [rightPanelWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateLayoutMode = (event) => {
      setIsWideLayout(event.matches);
    };

    mediaQuery.addEventListener("change", updateLayoutMode);
    return () => mediaQuery.removeEventListener("change", updateLayoutMode);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("linkvault:mobile-panel", mobilePanel);
  }, [mobilePanel]);

  useEffect(() => {
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      if (dragStateRef.current?.onMove) {
        document.removeEventListener("mousemove", dragStateRef.current.onMove);
      }
      if (dragStateRef.current?.onUp) {
        document.removeEventListener("mouseup", dragStateRef.current.onUp);
      }
      dragStateRef.current = null;
    };
  }, []);

  const handleQuickCreateCollection = async () => {
    const name = `Collection ${collections.length + 1}`;
    await addCollection(name, false);
  };

  const handleCollectionSelect = (id) => {
    selectCollection(id);
    if (!isWideLayout) {
      setMobilePanel("links");
    }
  };

  const resetPanelWidths = () => {
    setLeftPanelWidth(LEFT_PANEL_DEFAULT);
    setRightPanelWidth(RIGHT_PANEL_DEFAULT);
  };

  const beginResize = (side) => (event) => {
    if (!isWideLayout) return;

    event.preventDefault();
    const startX = event.clientX;
    const startLeft = leftPanelWidth;
    const startRight = rightPanelWidth;

    const onMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;

      if (side === "left") {
        setLeftPanelWidth(
          clamp(startLeft + deltaX, LEFT_PANEL_MIN, LEFT_PANEL_MAX),
        );
        return;
      }

      setRightPanelWidth(
        clamp(startRight - deltaX, RIGHT_PANEL_MIN, RIGHT_PANEL_MAX),
      );
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      dragStateRef.current = null;
    };

    dragStateRef.current = { onMove, onUp };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const renderStartCard = () => (
    <div
      className="dash-animate rounded-2xl border border-dashed p-5"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
        Start here
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        {collections.length
          ? "Click a collection to start managing links. Sharing and analytics are available in the details panel."
          : "Create your first collection to unlock link, sharing, and analytics tools."}
      </p>
      {collections.length === 0 ? (
        <button
          type="button"
          onClick={handleQuickCreateCollection}
          className="mt-3 rounded-lg px-3 py-2 text-sm font-medium"
          style={{
            backgroundColor: "var(--text)",
            color: "var(--bg)",
          }}
        >
          Create First Collection
        </button>
      ) : null}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen px-4 py-6 md:px-6 md:py-8"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <main className="w-full space-y-4">
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

        {!isWideLayout ? (
          <>
            <section
              className="dash-animate rounded-xl border p-2"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div
                className="grid grid-cols-3 gap-1 rounded-lg p-1"
                style={{ backgroundColor: "var(--surface-soft)" }}
              >
                {[
                  ["collections", "Collections"],
                  ["links", "Links"],
                  ["details", "Details"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMobilePanel(key)}
                    className="rounded px-2 py-2 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        mobilePanel === key ? "var(--surface)" : "transparent",
                      color:
                        mobilePanel === key ? "var(--text)" : "var(--text-muted)",
                      border: `1px solid ${
                        mobilePanel === key ? "var(--border)" : "transparent"
                      }`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {mobilePanel === "collections" ? (
              <div className="dash-animate">
                <CollectionPanel
                  collections={collections}
                  selectedId={selectedId}
                  onSelect={handleCollectionSelect}
                  onAddCollection={addCollection}
                  onEditCollection={editCollection}
                  onDeleteCollection={removeCollection}
                  isLoading={isCollectionsLoading}
                />
              </div>
            ) : null}

            {mobilePanel === "links" ? (
              <div className="space-y-4">
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
                  renderStartCard()
                )}
              </div>
            ) : null}

            {mobilePanel === "details" ? (
              <div className="dash-animate">
                <CollectionDetailsPanel
                  selectedCollection={selectedCollection}
                  members={members}
                  analytics={analytics}
                  isMembersLoading={isMembersLoading}
                  activeTab={detailsTab}
                  onTabChange={setDetailsTab}
                  onToggleVisibility={toggleCollectionVisibility}
                  onShareMember={shareWithMember}
                  onRemoveMember={removeMember}
                />
              </div>
            ) : null}
          </>
        ) : null}

        {isWideLayout ? (
          <div
            className="grid items-start gap-4 lg:gap-0"
            style={{
              gridTemplateColumns: `${leftPanelWidth}px 12px minmax(0,1fr) 12px ${rightPanelWidth}px`,
            }}
          >
            <div className="dash-animate lg:sticky lg:top-6 lg:pr-2">
              <CollectionPanel
                collections={collections}
                selectedId={selectedId}
                onSelect={handleCollectionSelect}
                onAddCollection={addCollection}
                onEditCollection={editCollection}
                onDeleteCollection={removeCollection}
                isLoading={isCollectionsLoading}
              />
            </div>

            <div
              role="separator"
              aria-label="Resize collections panel"
              aria-orientation="vertical"
              title="Drag to resize • Double-click to reset"
              onMouseDown={beginResize("left")}
              onDoubleClick={resetPanelWidths}
              className="group hidden cursor-col-resize lg:flex lg:items-stretch lg:justify-center"
            >
              <span
                className="relative w-2 rounded-full transition group-hover:opacity-100"
                style={{ backgroundColor: "var(--text-muted)", opacity: 0.6 }}
              >
                <span
                  className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: "var(--surface)", opacity: 0.85 }}
                />
                <span
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: "var(--text)" }}
                />
              </span>
            </div>

            <div className="space-y-4 lg:px-2">
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
                renderStartCard()
              )}
            </div>

            <div
              role="separator"
              aria-label="Resize details panel"
              aria-orientation="vertical"
              title="Drag to resize • Double-click to reset"
              onMouseDown={beginResize("right")}
              onDoubleClick={resetPanelWidths}
              className="group hidden cursor-col-resize lg:flex lg:items-stretch lg:justify-center"
            >
              <span
                className="relative w-2 rounded-full transition group-hover:opacity-100"
                style={{ backgroundColor: "var(--text-muted)", opacity: 0.6 }}
              >
                <span
                  className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: "var(--surface)", opacity: 0.85 }}
                />
                <span
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: "var(--text)" }}
                />
              </span>
            </div>

            <div className="dash-animate lg:sticky lg:top-6 lg:pl-2">
              <CollectionDetailsPanel
                selectedCollection={selectedCollection}
                members={members}
                analytics={analytics}
                isMembersLoading={isMembersLoading}
                activeTab={detailsTab}
                onTabChange={setDetailsTab}
                onToggleVisibility={toggleCollectionVisibility}
                onShareMember={shareWithMember}
                onRemoveMember={removeMember}
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
