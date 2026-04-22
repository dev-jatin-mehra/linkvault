import { useMemo, useState } from "react";
import { playUiActionSound } from "../lib/uiClickSound";

function normalizeTag(tag) {
  return String(tag || "")
    .trim()
    .toLowerCase();
}

function addTag(currentTags, rawTag) {
  const normalized = normalizeTag(rawTag);
  if (!normalized) return currentTags;
  if (currentTags.includes(normalized)) return currentTags;
  return [...currentTags, normalized];
}

function normalizeUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();

  try {
    const parsed = new URL(
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`,
    );

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
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
  const [tagInput, setTagInput] = useState("");
  const [tagList, setTagList] = useState([]);
  const [sortMode, setSortMode] = useState(() => {
    if (typeof window === "undefined") return "recent";
    return window.localStorage.getItem("linkvault:links-sort") || "recent";
  });

  const [editingLinkId, setEditingLinkId] = useState(null);
  const [editingUrl, setEditingUrl] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTagInput, setEditingTagInput] = useState("");
  const [editingTagList, setEditingTagList] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isSearchMode = searchQuery.trim().length > 0;
  const renderedLinks = useMemo(
    () => {
      const base = isSearchMode ? searchResults : links;
      const nextLinks = [...base];

      if (sortMode === "clicks") {
        nextLinks.sort((a, b) => (b.click_count || 0) - (a.click_count || 0));
      } else if (sortMode === "title") {
        nextLinks.sort((a, b) =>
          String(a.title || a.url || "").localeCompare(
            String(b.title || b.url || ""),
          ),
        );
      } else {
        nextLinks.sort((a, b) => {
          const aDate = new Date(a.created_at || 0).getTime();
          const bDate = new Date(b.created_at || 0).getTime();
          return bDate - aDate;
        });
      }

      return nextLinks;
    },
    [isSearchMode, links, searchResults, sortMode],
  );

  const onSortChange = (value) => {
    setSortMode(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("linkvault:links-sort", value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    playUiActionSound("primary");

    await onAddLink({
      url: trimmedUrl,
      title: title.trim(),
      tags: tagList,
    });

    setUrl("");
    setTitle("");
    setTagInput("");
    setTagList([]);
  };

  const commitCreateTag = () => {
    setTagList((prev) => addTag(prev, tagInput));
    setTagInput("");
  };

  const commitEditTag = () => {
    setEditingTagList((prev) => addTag(prev, editingTagInput));
    setEditingTagInput("");
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
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search links, tags, collections..."
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none lg:w-80"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
            }}
          />
          <select
            value={sortMode}
            onChange={(event) => onSortChange(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
            }}
          >
            <option value="recent">Sort: Recent</option>
            <option value="clicks">Sort: Most Clicked</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
      </div>

      {!isSearchMode && selectedCollection ? (
        <form
          onSubmit={handleSubmit}
          className="mb-6 grid gap-2 sm:grid-cols-2 2xl:grid-cols-[1.4fr_1fr_1.3fr_auto]"
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
          <div
            className="rounded-lg border px-2 py-1"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <div className="mb-1 flex flex-wrap gap-1">
              {tagList.map((tag) => (
                <button
                  key={`create-${tag}`}
                  type="button"
                  onClick={() =>
                    setTagList((prev) => prev.filter((item) => item !== tag))
                  }
                  className="rounded-full border px-2 py-0.5 text-xs"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-muted)",
                    backgroundColor: "var(--surface-soft)",
                  }}
                  title="Remove tag"
                >
                  #{tag} ×
                </button>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (["Enter", "Tab", ","].includes(event.key)) {
                  event.preventDefault();
                  commitCreateTag();
                }
              }}
              onBlur={commitCreateTag}
              placeholder="Add tags (press Enter)"
              className="w-full border-0 px-1 py-1 text-sm outline-none"
              style={{
                backgroundColor: "transparent",
                color: "var(--text)",
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 sm:w-auto"
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
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {isSearchMode
              ? "No links match your search."
              : "No links yet in this collection."}
          </p>
          {!isSearchMode ? (
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              Use the form above to add your first link.
            </p>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3">
          {renderedLinks.map((link) => {
            const isEditing = editingLinkId === link.id;
            const isConfirmingDelete = confirmDeleteId === link.id;

            const startEdit = () => {
              setEditingLinkId(link.id);
              setEditingUrl(link.url || "");
              setEditingTitle(link.title || "");
              setEditingTagList(
                Array.isArray(link.tags)
                  ? link.tags.map((tag) => normalizeTag(tag)).filter(Boolean)
                  : [],
              );
              setEditingTagInput("");
              setConfirmDeleteId(null);
            };

            const cancelEdit = () => {
              setEditingLinkId(null);
              setEditingUrl("");
              setEditingTitle("");
              setEditingTagList([]);
              setEditingTagInput("");
            };

            const saveEdit = async (event) => {
              event.preventDefault();
              const trimmedUrl = editingUrl.trim();
              if (!trimmedUrl) return;

              await onEditLink(link.id, {
                url: trimmedUrl,
                title: editingTitle.trim(),
                tags: editingTagList,
              });

              setEditingLinkId(null);
              setEditingUrl("");
              setEditingTitle("");
              setEditingTagList([]);
              setEditingTagInput("");
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
              const safeUrl = normalizeUrl(link.url);
              if (!safeUrl) return;

              await onTrackClick(link.id);
              window.open(safeUrl, "_blank", "noopener,noreferrer");
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
                    <div
                      className="rounded border px-2 py-1"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                      }}
                    >
                      <div className="mb-1 flex flex-wrap gap-1">
                        {editingTagList.map((tag) => (
                          <button
                            key={`edit-${link.id}-${tag}`}
                            type="button"
                            onClick={() =>
                              setEditingTagList((prev) =>
                                prev.filter((item) => item !== tag),
                              )
                            }
                            className="rounded-full border px-2 py-0.5 text-xs"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--text-muted)",
                              backgroundColor: "var(--surface-soft)",
                            }}
                          >
                            #{tag} ×
                          </button>
                        ))}
                      </div>
                      <input
                        value={editingTagInput}
                        onChange={(event) =>
                          setEditingTagInput(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (["Enter", "Tab", ","].includes(event.key)) {
                            event.preventDefault();
                            commitEditTag();
                          }
                        }}
                        onBlur={commitEditTag}
                        placeholder="Add tags (press Enter)"
                        className="w-full border-0 px-1 py-1 text-sm outline-none"
                        style={{
                          backgroundColor: "transparent",
                          color: "var(--text)",
                        }}
                      />
                    </div>
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
                    <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
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
