import express from "express";
import {
  getPublicCollectionHandler,
  getPublicCollectionLinksHandler,
  trackPublicLinkClickHandler,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/collections/:id", getPublicCollectionHandler);
router.get("/collections/:id/links", getPublicCollectionLinksHandler);
router.post("/links/:id/click", trackPublicLinkClickHandler);

export default router;
