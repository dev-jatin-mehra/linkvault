import {
  createLink,
  deleteLink,
  getLinksForCollection,
  searchLinks,
  trackLinkClick,
  updateLink,
} from "../services/linkService.js";

export const createLinkHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const link = await createLink(userId, req.body);

    if (!link) {
      return res.status(403).json({ error: "not allowed to add links" });
    }

    res.json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "link create failed" });
  }
};

export const searchLinksHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const q = String(req.query.q || "").trim();
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));

    if (!q) {
      return res.json([]);
    }

    const result = await searchLinks(userId, q, limit);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "search failed" });
  }
};

export const getLinksHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { collectionId } = req.params;

    const result = await getLinksForCollection(userId, collectionId);
    if (!result) {
      return res.status(403).json({ error: "forbidden" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "links fetch failed" });
  }
};

export const updateLinkHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { id } = req.params;
    const { url } = req.body;

    if (!url?.trim()) {
      return res.status(400).json({ error: "url is required" });
    }

    const result = await updateLink(userId, id, req.body);
    if (!result) {
      return res.status(403).json({ error: "not allowed to edit link" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "link update failed" });
  }
};

export const deleteLinkHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { id } = req.params;

    const deleted = await deleteLink(userId, id);
    if (!deleted) {
      return res.status(403).json({ error: "not allowed to delete link" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "link delete failed" });
  }
};

export const trackLinkClickHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { id } = req.params;

    const result = await trackLinkClick(userId, id, {
      userAgent: req.get("user-agent") || null,
      referrer: req.get("referer") || null,
    });

    if (!result) {
      return res.status(404).json({ error: "link not found" });
    }

    res.json({ ok: true, click_count: result.click_count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "click tracking failed" });
  }
};
