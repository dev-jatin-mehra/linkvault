-- Base schema for LinkVault

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY,
  collection_id UUID NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_collection
    FOREIGN KEY (collection_id)
    REFERENCES collections(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_collections_user ON collections (user_id);
CREATE INDEX IF NOT EXISTS idx_links_collection_base ON links (collection_id);
