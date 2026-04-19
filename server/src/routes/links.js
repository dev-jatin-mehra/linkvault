import express from "express";
import { requireAuth } from "@clerk/express";
import {
  createLinkHandler,
  deleteLinkHandler,
  getLinksHandler,
  searchLinksHandler,
  trackLinkClickHandler,
  updateLinkHandler,
} from "../controllers/linksController.js";

const router = express.Router();

router.post("/", requireAuth(), createLinkHandler);
router.get("/search", requireAuth(), searchLinksHandler);
router.get("/:collectionId", requireAuth(), getLinksHandler);
router.put("/:id", requireAuth(), updateLinkHandler);
router.delete("/:id", requireAuth(), deleteLinkHandler);
router.post("/:id/click", requireAuth(), trackLinkClickHandler);

export default router;
