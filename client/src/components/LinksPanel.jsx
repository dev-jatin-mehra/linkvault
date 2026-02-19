import { useMemo, useState } from "react";

function parseTags(input) {
  if (!input.trim()) return [];
  return [
    ...new Set(input.split(",").map((tag) => tag.trim().toLowerCase())),
  ].filter(Boolean);
}

function normalizeUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function LinksPanel({
  selectedCollection,
  links,
  searchQuery,
  searchResults,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onTrackClick,
  onSearchChange,
  isLoading,
  isSearching,
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");

  const [editingLinkId, setEditingLinkId] = useState(null);
  const [editingUrl, setEditingUrl] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTags, setEditingTags] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isSearchMode = searchQuery.trim().length > 0;
  const renderedLinks = useMemo(
    () => (isSearchMode ? searchResults : links),
    [isSearchMode, links, searchResults],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    await onAddLink({
      url: trimmedUrl,
      title: title.trim(),
      tags: parseTags(tags),
    });

    setUrl("");
    setTitle("");
    setTags("");
  };

  if (!selectedCollection && !isSearchMode) {
    return (
      <section
        className="rounded-2xl border border-dashed p-6 text-center shadow-sm"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>
          Select a collection to view links.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border p-4 shadow-sm"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            {isSearchMode
              ? `Search Results (${searchResults.length})`
              : selectedCollection?.name || "Links"}
          </h2>
          {!isSearchMode ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {links.length} saved links
            </p>
          ) : null}
        </div>

        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search links, tags, collections..."
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none md:w-72"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
            color: "var(--text)",
          }}
        />
      </div>

      {!isSearchMode && selectedCollection ? (
        <form
          onSubmit={handleSubmit}
          className="mb-6 grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_auto]"
        >
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
            }}
          />
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
            }}
          />
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="tags: design,react"
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
            }}
          />
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--text)",
              color: "var(--bg)",
            }}
          >
            Add Link
          </button>
        </form>
      ) : null}

      {isLoading || isSearching ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {isSearching ? "Searching links..." : "Loading links..."}
        </p>
      ) : renderedLinks.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {isSearchMode
            ? "No links match your search."
            : "No links yet in this collection."}
        </p>
      ) : (
        <ul className="space-y-3">
          {renderedLinks.map((link) => {
            const isEditing = editingLinkId === link.id;
            const isConfirmingDelete = confirmDeleteId === link.id;

            const startEdit = () => {
              setEditingLinkId(link.id);
              setEditingUrl(link.url || "");
              setEditingTitle(link.title || "");
              setEditingTags((link.tags || []).join(", "));
              setConfirmDeleteId(null);
            };

            const cancelEdit = () => {
              setEditingLinkId(null);
              setEditingUrl("");
              setEditingTitle("");
              setEditingTags("");
            };

            const saveEdit = async (event) => {
              event.preventDefault();
              const trimmedUrl = editingUrl.trim();
              if (!trimmedUrl) return;

              await onEditLink(link.id, {
                url: trimmedUrl,
                title: editingTitle.trim(),
                tags: parseTags(editingTags),
              });

              setEditingLinkId(null);
              setEditingUrl("");
              setEditingTitle("");
              setEditingTags("");
            };

            const requestDelete = () => {
              setConfirmDeleteId(link.id);
              setEditingLinkId(null);
            };

            const cancelDelete = () => {
              setConfirmDeleteId(null);
            };

            const confirmDelete = async () => {
              await onDeleteLink(link.id);
              setConfirmDeleteId(null);
            };

            const handleOpenLink = async () => {
              await onTrackClick(link.id);
              window.open(
                normalizeUrl(link.url),
                "_blank",
                "noopener,noreferrer",
              );
            };

            return (
              <li
                key={link.id}
                className="rounded-xl border p-3"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-soft)",
                }}
              >
                {isEditing ? (
                  <form onSubmit={saveEdit} className="space-y-2">
                    <input
                      value={editingUrl}
                      onChange={(event) => setEditingUrl(event.target.value)}
                      className="w-full rounded border px-2 py-1 text-sm outline-none"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                      }}
                    />
                    <input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      placeholder="Title"
                      className="w-full rounded border px-2 py-1 text-sm outline-none"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                      }}
                    />
                    <input
                      value={editingTags}
                      onChange={(event) => setEditingTags(event.target.value)}
                      placeholder="tags: design,react"
                      className="w-full rounded border px-2 py-1 text-sm outline-none"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                      }}
                    />
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="submit"
                        className="rounded px-2 py-1 text-xs"
                        style={{
                          border: `1px solid var(--border)`,
                          backgroundColor: "transparent",
                          color: "var(--text)",
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded px-2 py-1 text-xs"
                        style={{
                          border: `1px solid var(--border)`,
                          backgroundColor: "transparent",
                          color: "var(--text)",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p
                        className="min-w-0 flex-1 truncate text-sm font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        {link.title || link.url}
                      </p>

                      <div className="flex items-center gap-1">
                        {isConfirmingDelete ? (
                          <>
                            <button
                              onClick={confirmDelete}
                              className="rounded px-2 py-1 text-xs"
                              style={{
                                border: `1px solid var(--border)`,
                                backgroundColor: "transparent",
                                color: "var(--text)",
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="rounded px-2 py-1 text-xs"
                              style={{
                                border: `1px solid var(--border)`,
                                backgroundColor: "transparent",
                                color: "var(--text)",
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={startEdit}
                              className="rounded px-2 py-1 text-xs"
                              style={{
                                border: `1px solid var(--border)`,
                                backgroundColor: "transparent",
                                color: "var(--text)",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={requestDelete}
                              className="rounded px-2 py-1 text-xs"
                              style={{
                                border: `1px solid var(--border)`,
                                backgroundColor: "transparent",
                                color: "var(--text)",
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenLink}
                      className="text-left text-sm underline underline-offset-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {link.url}
                    </button>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
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
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
