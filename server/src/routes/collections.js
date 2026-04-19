import express from "express";
import { requireAuth } from "@clerk/express";
import {
  createCollectionHandler,
  deleteCollectionHandler,
  getCollectionMembersHandler,
  listCollectionsHandler,
  removeCollectionMemberHandler,
  shareCollectionHandler,
  updateCollectionHandler,
} from "../controllers/collectionsController.js";

const router = express.Router();

router.post("/", requireAuth(), createCollectionHandler);
router.get("/", requireAuth(), listCollectionsHandler);
router.put("/:id", requireAuth(), updateCollectionHandler);
router.delete("/:id", requireAuth(), deleteCollectionHandler);
router.get("/:id/members", requireAuth(), getCollectionMembersHandler);
router.post("/:id/share", requireAuth(), shareCollectionHandler);
router.delete(
  "/:id/members/:memberUserId",
  requireAuth(),
  removeCollectionMemberHandler,
);

router.get("/test", (req, res) => {
  res.send("collections test works");
});

export default router;
