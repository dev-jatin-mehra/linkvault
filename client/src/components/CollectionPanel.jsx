import { useState } from "react";

export default function CollectionPanel({
  collections,
  selectedId,
  onSelect,
  onAddCollection,
  onEditCollection,
  onDeleteCollection,
  isLoading,
}) {
  const [collectionName, setCollectionName] = useState("");
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = collectionName.trim();
    if (!trimmed) return;

    await onAddCollection(trimmed, newCollectionPublic);
    setCollectionName("");
    setNewCollectionPublic(false);
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

      <p className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
        Create a collection, then click it to manage links and view details.
      </p>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <div className="flex flex-col gap-2">
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
            className="w-full rounded-lg px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5"
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
        <div
          className="rounded-lg border border-dashed p-3 text-sm"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
            backgroundColor: "var(--surface-soft)",
          }}
        >
          No collections yet. Start by creating one above.
        </div>
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
                  className="flex items-start gap-2 rounded-lg border px-2 py-2"
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
                        title="Click to expand. Click again to collapse."
                      >
                        {collection.name}
                        {collection.is_public ? " (Public)" : " (Private)"}
                      </button>

                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
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

    </aside>
  );
}
