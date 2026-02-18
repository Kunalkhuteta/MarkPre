import { Router } from "express";
import {
  uploadAsset,
  getUserAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
} from "../controllers/asset.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/upload", upload.single("image"), uploadAsset);
router.get("/", getUserAssets);
router.get("/:id", getAssetById);
router.put("/:id", updateAsset);
router.delete("/:id", deleteAsset);

export default router;