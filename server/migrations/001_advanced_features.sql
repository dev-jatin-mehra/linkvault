-- LinkVault advanced feature schema (idempotent)

ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE links
  ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS collection_members (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, user_id),
  CONSTRAINT collection_members_role_check CHECK (role IN ('viewer', 'editor', 'admin'))
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS link_tags (
  link_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(link_id, tag_id)
);

CREATE TABLE IF NOT EXISTS click_events (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  user_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_user_public ON collections (user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_collection_members_user ON collection_members (user_id);
CREATE INDEX IF NOT EXISTS idx_collection_members_collection ON collection_members (collection_id);
CREATE INDEX IF NOT EXISTS idx_links_collection ON links (collection_id);
CREATE INDEX IF NOT EXISTS idx_links_click_count ON links (click_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_user_name ON tags (user_id, name);
CREATE INDEX IF NOT EXISTS idx_link_tags_link ON link_tags (link_id);
CREATE INDEX IF NOT EXISTS idx_link_tags_tag ON link_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_click_events_link_time ON click_events (link_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_collection_time ON click_events (collection_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_events_user_time ON click_events (user_id, clicked_at DESC);
