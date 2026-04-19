import {
  createCollection,
  deleteCollection,
  getCollectionMembers,
  getCollectionsForUser,
  removeCollectionMember,
  shareCollection,
  updateCollection,
} from "../services/collectionService.js";

export const createCollectionHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { name, is_public = false } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "name is required" });
    }

    const result = await createCollection(userId, name, is_public);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "create failed" });
  }
};

export const listCollectionsHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const result = await getCollectionsForUser(userId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "fetch failed" });
  }
};

export const updateCollectionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_public } = req.body;
    const userId = req.auth().userId;

    if (!name?.trim()) {
      return res.status(400).json({ error: "name is required" });
    }

    const result = await updateCollection(userId, id, name, is_public);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "update failed" });
  }
};

export const deleteCollectionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth().userId;

    const deleted = await deleteCollection(userId, id);
    if (!deleted) {
      return res
        .status(403)
        .json({ error: "only owner can delete collection" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "delete failed" });
  }
};

export const getCollectionMembersHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth().userId;

    const result = await getCollectionMembers(userId, id);
    if (!result) {
      return res.status(403).json({ error: "only owner can view members" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "members fetch failed" });
  }
};

export const shareCollectionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth().userId;
    const { memberUserId, role = "viewer" } = req.body;

    if (!memberUserId?.trim()) {
      return res.status(400).json({ error: "memberUserId is required" });
    }

    if (!["viewer", "editor", "admin"].includes(role)) {
      return res.status(400).json({ error: "invalid role" });
    }

    if (memberUserId === userId) {
      return res.status(400).json({ error: "owner already has access" });
    }

    const result = await shareCollection(userId, id, memberUserId, role);
    if (!result) {
      return res.status(403).json({ error: "only owner can share" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "share failed" });
  }
};

export const removeCollectionMemberHandler = async (req, res) => {
  try {
    const { id, memberUserId } = req.params;
    const userId = req.auth().userId;

    const removed = await removeCollectionMember(userId, id, memberUserId);
    if (!removed) {
      return res.status(403).json({ error: "only owner can remove members" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "remove member failed" });
  }
};
