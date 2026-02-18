import { Router, Request, Response, NextFunction } from "express";
import { aiGenerateSlides, aiImproveSlides, aiGenerateSpeakerNotes } from "../controllers/ai.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// 🔍 Log every incoming AI request BEFORE auth
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`\n🚀 AI Route Hit: ${req.method} ${req.path}`);
  console.log("📋 Headers:", {
    authorization: req.headers.authorization ? `${req.headers.authorization.substring(0, 20)}...` : "MISSING",
    contentType: req.headers["content-type"],
  });
  console.log("📦 Body:", req.body);
  next();
});

// Auth middleware with extra logging
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log("🔐 Running authMiddleware...");
  authMiddleware(req, res, (err?: any) => {
    if (err) {
      console.error("❌ Auth middleware error:", err.message || err);
      return next(err);
    }
    console.log("✅ Auth passed");
    next();
  });
});

router.post("/generate-slides", aiGenerateSlides);
router.post("/improve-slides", aiImproveSlides);
router.post("/generate-speaker-notes", aiGenerateSpeakerNotes);

export default router;