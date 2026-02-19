-- Fix data type mismatches and add foreign key constraints

-- Step 1: Convert TEXT columns to UUID where they reference UUID primary keys

-- collection_members.collection_id needs to be UUID (references collections.id)
ALTER TABLE collection_members
  ALTER COLUMN collection_id TYPE UUID USING collection_id::UUID;

-- link_tags.link_id needs to be UUID (references links.id)
ALTER TABLE link_tags
  ALTER COLUMN link_id TYPE UUID USING link_id::UUID;

-- click_events.link_id needs to be UUID (references links.id)
ALTER TABLE click_events
  ALTER COLUMN link_id TYPE UUID USING link_id::UUID;

-- click_events.collection_id needs to be UUID (references collections.id)
ALTER TABLE click_events
  ALTER COLUMN collection_id TYPE UUID USING collection_id::UUID;

-- Step 2: Add foreign key constraints with CASCADE behavior

-- collections.id → links (already has FK from earlier migration, skip)
-- Note: links.collection_id is already UUID and has FK constraint

-- collections.id → collection_members
ALTER TABLE collection_members
  DROP CONSTRAINT IF EXISTS fk_collection_members_collection,
  ADD CONSTRAINT fk_collection_members_collection
    FOREIGN KEY (collection_id)
    REFERENCES collections(id)
    ON DELETE CASCADE;

-- links.id → link_tags
ALTER TABLE link_tags
  DROP CONSTRAINT IF EXISTS fk_link_tags_link,
  ADD CONSTRAINT fk_link_tags_link
    FOREIGN KEY (link_id)
    REFERENCES links(id)
    ON DELETE CASCADE;

-- links.id → click_events
ALTER TABLE click_events
  DROP CONSTRAINT IF EXISTS fk_click_events_link,
  ADD CONSTRAINT fk_click_events_link
    FOREIGN KEY (link_id)
    REFERENCES links(id)
    ON DELETE CASCADE;

-- tags.id → link_tags
-- Note: tags.id is TEXT, so this will work as-is
ALTER TABLE link_tags
  DROP CONSTRAINT IF EXISTS fk_link_tags_tag,
  ADD CONSTRAINT fk_link_tags_tag
    FOREIGN KEY (tag_id)
    REFERENCES tags(id)
    ON DELETE CASCADE;

-- collections.id → click_events
ALTER TABLE click_events
  DROP CONSTRAINT IF EXISTS fk_click_events_collection,
  ADD CONSTRAINT fk_click_events_collection
    FOREIGN KEY (collection_id)
    REFERENCES collections(id)
    ON DELETE CASCADE;
