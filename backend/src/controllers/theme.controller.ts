import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { Theme } from "../models/theme.model";
import { Request, Response} from "express";

const addNewTheme = asyncHandler(async (req:Request, res:Response) => {
  const { name, primaryColor, backgroundColor, textColor, fontFamily } = req.body;

  const theme = await Theme.create({
    name,
    primaryColor,
    backgroundColor,
    textColor,
    fontFamily,
    user: req.user.id,
  });

  res.status(201).json(new ApiResponse(200, "Theme created successfully", theme));
});

const getThemes = asyncHandler(async (req:Request, res:Response) => {
  const themes = await Theme.find({ user: req.user.id });
  res.status(200).json(new ApiResponse(200, "Themes fetched successfully", themes));
});

const getThemeById = asyncHandler(async (req:Request, res:Response) => {
  const theme = await Theme.findById(req.params.id);
  if (!theme) {
    return res.status(404).json(new ApiError(404, "Theme not found"));
  }
  res.status(200).json(new ApiResponse(200, "Theme fetched successfully", theme));
});

const updateTheme = asyncHandler(async (req:Request, res:Response) => {
  const theme = await Theme.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!theme) {
    return res.status(404).json(new ApiError(404, "Theme not found"));
  }
  res.status(200).json(new ApiResponse(200, "Theme updated successfully", theme));
});

const deleteTheme = asyncHandler(async (req:Request, res:Response) => {
  const theme = await Theme.findByIdAndDelete(req.params.id);

  if (!theme) {
    return res.status(404).json(new ApiError(404, "Theme not found"));
  }
  res.status(200).json(new ApiResponse(200, "Theme deleted successfully", theme));
});

const publicThemes = asyncHandler(async (req:Request, res:Response) => {
  const themes = await Theme.find();
  res.status(200).json(new ApiResponse(200, "Public themes fetched successfully", themes));
});

export { addNewTheme, getThemes, getThemeById, updateTheme, deleteTheme, publicThemes };