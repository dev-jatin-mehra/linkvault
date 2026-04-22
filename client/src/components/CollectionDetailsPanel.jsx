import { useEffect, useMemo, useRef, useState } from "react";

export default function CollectionDetailsPanel({
  selectedCollection,
  members,
  analytics,
  isMembersLoading,
  activeTab,
  onTabChange,
  onToggleVisibility,
  onShareMember,
  onRemoveMember,
}) {
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [copyLinkFeedback, setCopyLinkFeedback] = useState(false);
  const copyFeedbackTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
      }
    };
  }, []);

  const shareLink = useMemo(() => {
    if (!selectedCollection || typeof window === "undefined") return "";
    return `${window.location.origin}/collection/${selectedCollection.id}`;
  }, [selectedCollection]);

  const maxClicks = useMemo(() => {
    if (!analytics?.clicks_by_day?.length) return 1;
    return Math.max(
      ...analytics.clicks_by_day.map((item) => item.clicks || 0),
      1,
    );
  }, [analytics]);

  const handleShare = async (event) => {
    event.preventDefault();
    if (!selectedCollection || !shareEmail.trim()) return;

    await onShareMember(selectedCollection.id, shareEmail.trim(), shareRole);
    setShareEmail("");
    setShareRole("viewer");
  };

  const handleCopyShareLink = () => {
    if (!shareLink) return;

    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setCopyLinkFeedback(true);
        if (copyFeedbackTimerRef.current) {
          clearTimeout(copyFeedbackTimerRef.current);
        }
        copyFeedbackTimerRef.current = setTimeout(() => {
          setCopyLinkFeedback(false);
        }, 2000);
      })
      .catch(() => {
        setCopyLinkFeedback(false);
      });
  };

  if (!selectedCollection) {
    return (
      <aside
        className="rounded-2xl border border-dashed p-4 shadow-sm"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          Details Panel
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Select a collection to view sharing and analytics details.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="rounded-2xl border p-4 shadow-sm"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {selectedCollection.name}
        </h3>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {selectedCollection.is_public ? "Public" : "Private"} collection
        </p>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--surface-soft)" }}>
        {[
          ["overview", "Overview"],
          ["sharing", "Sharing"],
          ["analytics", "Analytics"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className="rounded px-2 py-1.5 text-xs"
            style={{
              backgroundColor: activeTab === key ? "var(--surface)" : "transparent",
              color: activeTab === key ? "var(--text)" : "var(--text-muted)",
              border: `1px solid ${activeTab === key ? "var(--border)" : "transparent"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <section className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            <div
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-soft)" }}
            >
              <p className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                Links
              </p>
              <p className="text-lg font-semibold">{analytics?.summary?.total_links || 0}</p>
            </div>
            <div
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-soft)" }}
            >
              <p className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                Total Clicks
              </p>
              <p className="text-lg font-semibold">{analytics?.summary?.total_clicks || 0}</p>
            </div>
            <div
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-soft)" }}
            >
              <p className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                Members
              </p>
              <p className="text-lg font-semibold">{members.length}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
              Top Link
            </p>
            {analytics?.top_links?.length ? (
              <div
                className="rounded-lg border p-3"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-soft)" }}
              >
                <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                  {analytics.top_links[0].title || analytics.top_links[0].url}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  {analytics.top_links[0].click_count || 0} clicks
                </p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No link activity yet.
              </p>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "sharing" ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
              Access Settings
            </p>
            <button
              type="button"
              onClick={() =>
                onToggleVisibility(selectedCollection.id, !selectedCollection.is_public)
              }
              className="rounded px-2 py-1 text-xs"
              style={{
                border: `1px solid var(--border)`,
                backgroundColor: "transparent",
                color: "var(--text)",
              }}
            >
              Make {selectedCollection.is_public ? "Private" : "Public"}
            </button>
          </div>

          {selectedCollection.is_public ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
                Public Share Link
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="w-full rounded border px-2 py-1 text-xs outline-none"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="rounded px-3 py-1 text-xs"
                  style={{
                    border: `1px solid var(--border)`,
                    backgroundColor: copyLinkFeedback ? "var(--text)" : "transparent",
                    color: copyLinkFeedback ? "var(--bg)" : "var(--text)",
                  }}
                >
                  {copyLinkFeedback ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleShare} className="space-y-2">
            <p className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
              Share with team member
            </p>
            <input
              value={shareEmail}
              onChange={(event) => setShareEmail(event.target.value)}
              placeholder="Member email"
              className="w-full rounded border px-2 py-1 text-sm outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            />
            <div className="flex flex-col gap-2">
              <select
                value={shareRole}
                onChange={(event) => setShareRole(event.target.value)}
                className="w-full rounded border px-2 py-1 text-sm outline-none"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                }}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="rounded px-3 py-1.5 text-xs"
                style={{
                  border: `1px solid var(--border)`,
                  backgroundColor: "transparent",
                  color: "var(--text)",
                }}
              >
                Share
              </button>
            </div>
          </form>

          {isMembersLoading ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Loading members...
            </p>
          ) : members.length ? (
            <ul className="space-y-1">
              {members.map((member) => (
                <li
                  key={member.user_id}
                  className="flex items-center justify-between gap-2 rounded border px-2 py-1"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-soft)" }}
                >
                  <span className="truncate text-xs" style={{ color: "var(--text)" }}>
                    {member.user_id} ({member.role})
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveMember(selectedCollection.id, member.user_id)}
                    className="rounded px-2 py-1 text-xs"
                    style={{
                      border: `1px solid var(--border)`,
                      backgroundColor: "transparent",
                      color: "var(--text)",
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No shared members yet.
            </p>
          )}
        </section>
      ) : null}

      {activeTab === "analytics" ? (
        <section className="space-y-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
              Top Links
            </p>
            {analytics?.top_links?.length ? (
              <ul className="space-y-2">
                {analytics.top_links.slice(0, 5).map((link) => (
                  <li
                    key={link.id}
                    className="rounded-lg border p-2"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-soft)" }}
                  >
                    <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                      {link.title || link.url}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      {link.click_count || 0} clicks
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No clicks yet.
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
              Click Activity
            </p>
            {analytics?.clicks_by_day?.length ? (
              <div className="space-y-2">
                {analytics.clicks_by_day.slice(-7).map((point) => {
                  const widthPct = Math.max(
                    8,
                    Math.round(((point.clicks || 0) / maxClicks) * 100),
                  );

                  return (
                    <div key={point.day}>
                      <div
                        className="mb-1 flex items-center justify-between text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span>{point.day}</span>
                        <span>{point.clicks} clicks</span>
                      </div>
                      <div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: "var(--surface-soft)" }}
                      >
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: "var(--text)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Activity will appear once links are opened.
              </p>
            )}
          </div>
        </section>
      ) : null}
    </aside>
  );
}
