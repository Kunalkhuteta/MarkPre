import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import Presentation from "../models/presentation.model";
import { exportToPDF, exportToHTML } from "../utils/exportUtils";
import fs from "fs";
// CREATE PRESENTATION
const createPresentation = asyncHandler(async (req, res) => {
    const { title, content, theme } = req.body;
    // Count slides (separated by ---)
    const slideCount = content.split("---").filter((slide) => slide.trim()).length;
    const wordCount = content.split(/\s+/).length;
    const presentation = await Presentation.create({
        title,
        content,
        theme: theme || null,
        user: req.user.id,
        slideCount,
        wordCount,
        lastEditedAt: new Date(),
    });
    // IMPORTANT: Populate theme immediately
    const populated = await Presentation.findById(presentation._id).populate("theme");
    res.status(201).json(new ApiResponse(201, "Presentation created successfully", populated));
});
// GET ALL PRESENTATIONS FOR USER
const getPresentations = asyncHandler(async (req, res) => {
    const presentations = await Presentation.find({ user: req.user.id })
        .populate("theme") // Populate theme
        .sort({ updatedAt: -1 });
    res.status(200).json(new ApiResponse(200, "Presentations fetched successfully", presentations));
});
// GET PRESENTATION BY ID - FIXED
const getPresentationById = asyncHandler(async (req, res) => {
    const presentation = await Presentation.findById(req.params.id).populate("theme");
    if (!presentation) {
        return res.status(404).json(new ApiError(404, "Presentation not found"));
    }
    // Check ownership
    if (presentation.user.toString() !== req.user.id && !presentation.isPublic) {
        return res.status(403).json(new ApiError(403, "Access denied"));
    }
    // Increment view count
    if (presentation.user.toString() !== req.user.id) {
        presentation.viewCount = (presentation.viewCount || 0) + 1;
        await presentation.save();
    }
    res.status(200).json(new ApiResponse(200, "Presentation fetched successfully", presentation));
});
// UPDATE PRESENTATION - FIXED
const updatePresentation = asyncHandler(async (req, res) => {
    const { title, content, theme } = req.body;
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
        return res.status(404).json(new ApiError(404, "Presentation not found"));
    }
    if (presentation.user.toString() !== req.user.id) {
        return res.status(403).json(new ApiError(403, "Access denied"));
    }
    // Update fields
    if (title)
        presentation.title = title;
    if (content) {
        presentation.content = content;
        presentation.slideCount = content.split("---").filter((slide) => slide.trim()).length;
        presentation.wordCount = content.split(/\s+/).length;
    }
    // IMPORTANT: Handle theme update properly
    if (theme !== undefined) {
        presentation.theme = theme || null;
    }
    presentation.lastEditedAt = new Date();
    await presentation.save();
    // IMPORTANT: Populate theme before sending response
    const updated = await Presentation.findById(presentation._id).populate("theme");
    res.status(200).json(new ApiResponse(200, "Presentation updated successfully", updated));
});
// DELETE PRESENTATION
const deletePresentation = asyncHandler(async (req, res) => {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
        return res.status(404).json(new ApiError(404, "Presentation not found"));
    }
    if (presentation.user.toString() !== req.user.id) {
        return res.status(403).json(new ApiError(403, "Access denied"));
    }
    await Presentation.findByIdAndDelete(req.params.id);
    res.status(200).json(new ApiResponse(200, "Presentation deleted successfully"));
});
// EXPORT PRESENTATION - COMPLETELY FIXED
const exportPresentation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { format = "pdf" } = req.query;
    // IMPORTANT: Populate theme when fetching
    const presentation = await Presentation.findById(id).populate("theme");
    if (!presentation) {
        return res.status(404).json(new ApiError(404, "Presentation not found"));
    }
    // Check if user owns this presentation
    if (presentation.user.toString() !== req.user.id) {
        return res.status(403).json(new ApiError(403, "Access denied"));
    }
    // Increment export count
    presentation.exportCount = (presentation.exportCount || 0) + 1;
    await presentation.save();
    try {
        if (format === "pdf") {
            console.log("Generating PDF for presentation:", presentation.title);
            console.log("Theme:", presentation.theme);
            const pdfPath = await exportToPDF(presentation);
            // Check if file exists
            if (!fs.existsSync(pdfPath)) {
                throw new Error("PDF file was not created");
            }
            console.log("PDF generated at:", pdfPath);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${presentation.title}.pdf"`);
            const fileStream = fs.createReadStream(pdfPath);
            fileStream.pipe(res);
            // Clean up temp file after sending
            fileStream.on("end", () => {
                try {
                    fs.unlinkSync(pdfPath);
                    console.log("Temp PDF cleaned up");
                }
                catch (err) {
                    console.error("Failed to clean up temp file:", err);
                }
            });
            fileStream.on("error", (error) => {
                console.error("Stream error:", error);
                res.status(500).json(new ApiError(500, "Failed to stream PDF"));
            });
        }
        else if (format === "html") {
            console.log("Generating HTML for presentation:", presentation.title);
            const html = await exportToHTML(presentation);
            res.setHeader("Content-Type", "text/html");
            res.setHeader("Content-Disposition", `attachment; filename="${presentation.title}.html"`);
            res.send(html);
        }
        else {
            return res.status(400).json(new ApiError(400, "Unsupported export format. Use 'pdf' or 'html'"));
        }
    }
    catch (error) {
        console.error("Export error:", error);
        return res.status(500).json(new ApiError(500, "Failed to export presentation: " + error.message));
    }
});
export { createPresentation, getPresentations, getPresentationById, updatePresentation, deletePresentation, exportPresentation, };
