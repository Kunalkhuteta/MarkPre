import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
        type: String,
        default: "No description provided",
    },
    primaryColor: {
      type: String,
      default: "#3b82f6",
    },
    backgroundColor: {
      type: String,
      default: "#ffffff",
    },
    textColor: {
      type: String,
      default: "#000000",
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
  },
  { timestamps: true }
);

export const Theme = mongoose.model("Theme", themeSchema);
