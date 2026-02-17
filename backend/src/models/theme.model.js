import mongoose from "mongoose";
const themeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },
    primaryColor: {
        type: String,
        required: true,
        default: "#3b82f6",
    },
    backgroundColor: {
        type: String,
        required: true,
        default: "#ffffff",
    },
    textColor: {
        type: String,
        required: true,
        default: "#1e293b",
    },
    fontFamily: {
        type: String,
        default: "Inter, sans-serif",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
// Index for faster queries
themeSchema.index({ user: 1 });
export const Theme = mongoose.model("Theme", themeSchema);
export default Theme;
