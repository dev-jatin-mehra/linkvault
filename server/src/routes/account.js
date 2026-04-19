import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { deleteAccountHandler } from "../controllers/accountController.js";

const router = express.Router();

router.delete("/", requireAuth(), deleteAccountHandler);

export default router;
