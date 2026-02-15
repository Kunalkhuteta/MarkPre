import { Router } from "express";
import { aiGenerateSlides, aiImproveSlides, aiGenerateSpeakerNotes } from "../controllers/ai.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();
// All AI routes require authentication
router.use(authMiddleware);
// Generate slides from topic
router.post("/generate-slides", aiGenerateSlides);
// Improve existing slides
router.post("/improve-slides", aiImproveSlides);
// Generate speaker notes
router.post("/generate-speaker-notes", aiGenerateSpeakerNotes);
export default router;
