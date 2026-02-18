import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import Asset from "../models/asset.model";
import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";

// UPLOAD ASSET
const uploadAsset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json(new ApiError(400, "No file uploaded"));
  }

  const { name } = req.body;

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `markpre/assets/${req.user.id}`,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    // Create asset record
    const asset = await Asset.create({
      user: req.user.id,
      name: name || req.file.originalname,
      originalName: req.file.originalname,
      url: result.secure_url,
      size: req.file.size,
      mimeType: req.file.mimetype,
      width: result.width,
      height: result.height,
    });

    res.status(201).json(
      new ApiResponse(201, "Asset uploaded successfully", asset)
    );
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json(
      new ApiError(500, "Failed to upload asset: " + error.message)
    );
  }
});

// GET ALL USER ASSETS
const getUserAssets = asyncHandler(async (req: Request, res: Response) => {
  const assets = await Asset.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, "Assets fetched successfully", assets)
  );
});

// GET ASSET BY ID
const getAssetById = asyncHandler(async (req: Request, res: Response) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    return res.status(404).json(new ApiError(404, "Asset not found"));
  }

  if (asset.user.toString() !== req.user.id) {
    return res.status(403).json(new ApiError(403, "Access denied"));
  }

  res.status(200).json(
    new ApiResponse(200, "Asset fetched successfully", asset)
  );
});

// UPDATE ASSET NAME
const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    return res.status(404).json(new ApiError(404, "Asset not found"));
  }

  if (asset.user.toString() !== req.user.id) {
    return res.status(403).json(new ApiError(403, "Access denied"));
  }

  if (name) asset.name = name;
  await asset.save();

  res.status(200).json(
    new ApiResponse(200, "Asset updated successfully", asset)
  );
});

// DELETE ASSET
const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    return res.status(404).json(new ApiError(404, "Asset not found"));
  }

  if (asset.user.toString() !== req.user.id) {
    return res.status(403).json(new ApiError(403, "Access denied"));
  }

  try {
    // Extract public_id from Cloudinary URL
    const urlParts = asset.url.split("/");
    const publicIdWithExt = urlParts.slice(-2).join("/");
    const publicId = publicIdWithExt.split(".")[0];

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete from database
    await Asset.findByIdAndDelete(req.params.id);

    res.status(200).json(
      new ApiResponse(200, "Asset deleted successfully", null)
    );
  } catch (error: any) {
    console.error("Delete asset error:", error);
    return res.status(500).json(
      new ApiError(500, "Failed to delete asset: " + error.message)
    );
  }
});

export {
  uploadAsset,
  getUserAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
};