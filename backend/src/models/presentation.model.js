import mongoose from "mongoose";
const presentationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    theme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theme",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // NEW: Metadata
    slideCount: {
        type: Number,
        default: 1,
    },
    wordCount: {
        type: Number,
        default: 0,
    },
    lastEditedAt: {
        type: Date,
        default: Date.now,
    },
    // NEW: Analytics
    viewCount: {
        type: Number,
        default: 0,
    },
    exportCount: {
        type: Number,
        default: 0,
    },
    // NEW: Sharing
    isPublic: {
        type: Boolean,
        default: false,
    },
    publicSlug: {
        type: String,
        unique: true,
        sparse: true,
    },
    // NEW: Versioning (for future)
    version: {
        type: Number,
        default: 1,
    },
}, { timestamps: true });
// Index for faster queries
presentationSchema.index({ user: 1, updatedAt: -1 });
presentationSchema.index({ publicSlug: 1 });
const Presentation = mongoose.model("Presentation", presentationSchema);
export default Presentation;
