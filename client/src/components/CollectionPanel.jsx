import { useState } from "react";

export default function CollectionPanel({
  collections,
  selectedId,
  selectedCollection,
  members,
  onSelect,
  onAddCollection,
  onEditCollection,
  onDeleteCollection,
  onToggleVisibility,
  onShareMember,
  onRemoveMember,
  isLoading,
  isMembersLoading,
}) {
  const [collectionName, setCollectionName] = useState("");
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [shareUserId, setShareUserId] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [copyLinkFeedback, setCopyLinkFeedback] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = collectionName.trim();
    if (!trimmed) return;

    await onAddCollection(trimmed, newCollectionPublic);
    setCollectionName("");
    setNewCollectionPublic(false);
  };

  const handleShare = async (event) => {
    event.preventDefault();
    if (!selectedCollection || !shareUserId.trim()) return;

    await onShareMember(selectedCollection.id, shareUserId.trim(), shareRole);
    setShareUserId("");
    setShareRole("viewer");
  };

  const handleCopyShareLink = () => {
    if (!selectedCollection) return;

    const shareUrl = `${window.location.origin}/collection/${selectedCollection.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyLinkFeedback(true);
      setTimeout(() => setCopyLinkFeedback(false), 2000);
    });
  };

  return (
    <aside
      className="rounded-2xl border p-4 shadow-sm"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <h2
        className="mb-3 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-muted)" }}
      >
        Collections
      </h2>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={collectionName}
            onChange={(event) => setCollectionName(event.target.value)}
            placeholder="New collection"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
            }}
          />
          <button
            type="submit"
            className="rounded-lg px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--text)",
              color: "var(--bg)",
            }}
          >
            Add
          </button>
        </div>

        <label
          className="flex items-center gap-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <input
            type="checkbox"
            checked={newCollectionPublic}
            onChange={(event) => setNewCollectionPublic(event.target.checked)}
          />
          Create as public collection
        </label>
      </form>

      {isLoading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading collections...
        </p>
      ) : collections.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No collections yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {collections.map((collection) => {
            const isActive = collection.id === selectedId;
            const isEditing = editingCollectionId === collection.id;
            const isConfirmingDelete = confirmDeleteId === collection.id;

            const startEdit = (event) => {
              event.stopPropagation();
              setEditingCollectionId(collection.id);
              setEditingName(collection.name);
              setConfirmDeleteId(null);
            };

            const cancelEdit = (event) => {
              event.stopPropagation();
              setEditingCollectionId(null);
              setEditingName("");
            };

            const saveEdit = async (event) => {
              event.preventDefault();
              event.stopPropagation();
              const trimmedName = editingName.trim();
              if (!trimmedName) return;

              await onEditCollection(collection.id, {
                name: trimmedName,
                is_public: Boolean(collection.is_public),
              });
              setEditingCollectionId(null);
              setEditingName("");
            };

            const requestDelete = (event) => {
              event.stopPropagation();
              setConfirmDeleteId(collection.id);
              setEditingCollectionId(null);
            };

            const cancelDelete = (event) => {
              event.stopPropagation();
              setConfirmDeleteId(null);
            };

            const confirmDelete = async (event) => {
              event.stopPropagation();
              await onDeleteCollection(collection.id);
              setConfirmDeleteId(null);
            };

            return (
              <li key={collection.id}>
                <div
                  className="flex items-center gap-2 rounded-lg border px-2 py-2"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: isActive
                      ? "var(--text)"
                      : "var(--surface-soft)",
                    color: isActive ? "var(--bg)" : "var(--text)",
                  }}
                >
                  {isEditing ? (
                    <form
                      onSubmit={saveEdit}
                      className="flex w-full min-w-0 items-center gap-2"
                    >
                      <input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="min-w-0 flex-1 rounded border px-2 py-1 text-sm outline-none"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--surface)",
                          color: "var(--text)",
                        }}
                      />
                      <button
                        type="submit"
                        className="rounded px-2 py-1 text-xs"
                        style={{
                          border: `1px solid var(--border)`,
                          backgroundColor: "transparent",
                          color: "inherit",
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
                          color: "inherit",
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        onClick={() => onSelect(collection.id)}
                        className="min-w-0 flex-1 truncate text-left text-sm"
                      >
                        {collection.name}
                        {collection.is_public ? " (Public)" : " (Private)"}
                      </button>

                      <div className="flex items-center gap-1">
                        {isConfirmingDelete ? (
                          <>
                            <button
                              onClick={confirmDelete}
                              className="rounded px-2 py-1 text-xs"
                              style={{
                                border: `1px solid var(--border)`,
                                backgroundColor: "transparent",
                                color: "inherit",
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
                                color: "inherit",
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
                                color: "inherit",
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
                                color: "inherit",
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selectedCollection ? (
        <section
          className="mt-4 space-y-3 rounded-xl border p-3"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface-soft)",
          }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-xs font-semibold uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Access Settings
            </p>
            <button
              onClick={() =>
                onToggleVisibility(
                  selectedCollection.id,
                  !selectedCollection.is_public,
                )
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

          {selectedCollection.is_public && (
            <div className="space-y-2">
              <p
                className="text-xs font-semibold uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Public Share Link
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/collection/${selectedCollection.id}`}
                  className="min-w-0 flex-1 rounded border px-2 py-1 text-xs outline-none"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                  }}
                />
                <button
                  onClick={handleCopyShareLink}
                  className="rounded px-3 py-1 text-xs transition"
                  style={{
                    border: `1px solid var(--border)`,
                    backgroundColor: copyLinkFeedback
                      ? "var(--text)"
                      : "transparent",
                    color: copyLinkFeedback ? "var(--bg)" : "var(--text)",
                  }}
                >
                  {copyLinkFeedback ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleShare} className="space-y-2">
            <p
              className="text-xs font-semibold uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Share with team member
            </p>
            <input
              value={shareUserId}
              onChange={(event) => setShareUserId(event.target.value)}
              placeholder="Member user id"
              className="w-full rounded border px-2 py-1 text-sm outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            />
            <div className="flex gap-2">
              <select
                value={shareRole}
                onChange={(event) => setShareRole(event.target.value)}
                className="flex-1 rounded border px-2 py-1 text-sm outline-none"
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
                className="rounded px-3 py-1 text-xs"
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
                  className="flex items-center justify-between gap-2"
                >
                  <span
                    className="truncate text-xs"
                    style={{ color: "var(--text)" }}
                  >
                    {member.user_id} ({member.role})
                  </span>
                  <button
                    onClick={() =>
                      onRemoveMember(selectedCollection.id, member.user_id)
                    }
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
    </aside>
  );
}
