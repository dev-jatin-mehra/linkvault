import {
  getPublicCollection,
  getPublicCollectionLinks,
  trackPublicLinkClick,
} from "../services/publicService.js";

export const getPublicCollectionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getPublicCollection(id);

    if (!result) {
      return res
        .status(404)
        .json({ error: "Collection not found or not public" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
};

export const getPublicCollectionLinksHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getPublicCollectionLinks(id);

    if (!result) {
      return res
        .status(404)
        .json({ error: "Collection not found or not public" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch links" });
  }
};

export const trackPublicLinkClickHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await trackPublicLinkClick(id, {
      userAgent: req.get("user-agent") || null,
      referrer: req.get("referer") || null,
    });

    if (!result) {
      return res.status(404).json({ error: "Link not found or not public" });
    }

    res.json({ ok: true, click_count: result.click_count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Click tracking failed" });
  }
};
