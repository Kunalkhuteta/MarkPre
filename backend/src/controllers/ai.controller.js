import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import { generateSlidesWithAI, improveSlidesWithAI, generateSpeakerNotes } from "../services/ai.service";
// GENERATE SLIDES WITH AI
const aiGenerateSlides = asyncHandler(async (req, res) => {
    const { topic, slideCount, style, language } = req.body;
    if (!topic || topic.trim().length === 0) {
        return res.status(400).json(new ApiError(400, "Topic is required"));
    }
    if (slideCount && (slideCount < 1 || slideCount > 20)) {
        return res.status(400).json(new ApiError(400, "Slide count must be between 1 and 20"));
    }
    try {
        const content = await generateSlidesWithAI({
            topic,
            slideCount: slideCount || 5,
            style: style || "professional",
            language: language || "english",
        });
        res.status(200).json(new ApiResponse(200, "Slides generated successfully", {
            content,
            topic,
            slideCount: content.split("---").filter((s) => s.trim()).length,
        }));
    }
    catch (error) {
        console.error("AI Generation Error:", error);
        if (error.message.includes("API key")) {
            return res.status(500).json(new ApiError(500, "AI service not configured. Please contact administrator."));
        }
        return res.status(500).json(new ApiError(500, error.message || "Failed to generate slides"));
    }
});
// IMPROVE SLIDES WITH AI
const aiImproveSlides = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
        return res.status(400).json(new ApiError(400, "Content is required"));
    }
    try {
        const improvedContent = await improveSlidesWithAI(content);
        res.status(200).json(new ApiResponse(200, "Slides improved successfully", {
            content: improvedContent,
        }));
    }
    catch (error) {
        console.error("AI Improvement Error:", error);
        return res.status(500).json(new ApiError(500, error.message || "Failed to improve slides"));
    }
});
// GENERATE SPEAKER NOTES
const aiGenerateSpeakerNotes = asyncHandler(async (req, res) => {
    const { slideContent } = req.body;
    if (!slideContent || slideContent.trim().length === 0) {
        return res.status(400).json(new ApiError(400, "Slide content is required"));
    }
    try {
        const notes = await generateSpeakerNotes(slideContent);
        res.status(200).json(new ApiResponse(200, "Speaker notes generated successfully", {
            notes,
        }));
    }
    catch (error) {
        console.error("Speaker Notes Error:", error);
        return res.status(500).json(new ApiError(500, error.message || "Failed to generate speaker notes"));
    }
});
export { aiGenerateSlides, aiImproveSlides, aiGenerateSpeakerNotes };
