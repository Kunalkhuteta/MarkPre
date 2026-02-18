import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import { Request, Response } from "express";
import { generateSlidesWithAI, improveSlidesWithAI, generateSpeakerNotes } from "../services/ai.service";

// GENERATE SLIDES WITH AI
const aiGenerateSlides = asyncHandler(async (req: Request, res: Response) => {
  const { topic, slideCount, style, language } = req.body;

  console.log("📥 Generate slides request:", { topic, slideCount, style, language });

  if (!topic || topic.trim().length === 0) {
    return res.status(400).json(new ApiError(400, "Topic is required"));
  }

  if (slideCount && (slideCount < 1 || slideCount > 20)) {
    return res.status(400).json(new ApiError(400, "Slide count must be between 1 and 20"));
  }

  const content = await generateSlidesWithAI({
    topic,
    slideCount: slideCount || 5,
    style: style || "professional",
    language: language || "english",
  });

  console.log("✅ Slides generated, length:", content?.length);

  return res.status(200).json(
    new ApiResponse(200, "Slides generated successfully", {
      content,
      topic,
      slideCount: content.split("---").filter((s: string) => s.trim()).length,
    })
  );
});

// IMPROVE SLIDES WITH AI
const aiImproveSlides = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body;

  console.log("📥 Improve slides request, content length:", content?.length);

  if (!content || content.trim().length === 0) {
    return res.status(400).json(new ApiError(400, "Content is required"));
  }

  const improvedContent = await improveSlidesWithAI(content);

  console.log("✅ Slides improved, length:", improvedContent?.length);

  return res.status(200).json(
    new ApiResponse(200, "Slides improved successfully", {
      content: improvedContent,
    })
  );
});

// GENERATE SPEAKER NOTES
const aiGenerateSpeakerNotes = asyncHandler(async (req: Request, res: Response) => {
  const { slideContent } = req.body;

  console.log("📥 Speaker notes request");

  if (!slideContent || slideContent.trim().length === 0) {
    return res.status(400).json(new ApiError(400, "Slide content is required"));
  }

  const notes = await generateSpeakerNotes(slideContent);

  return res.status(200).json(
    new ApiResponse(200, "Speaker notes generated successfully", {
      notes,
    })
  );
});

export { aiGenerateSlides, aiImproveSlides, aiGenerateSpeakerNotes };