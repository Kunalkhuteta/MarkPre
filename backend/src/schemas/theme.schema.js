import { z } from "zod";
export const addNewThemeSchema = z.object({
    name: z.string().min(3, "Theme name must be at least 3 characters long").max(50, "Theme name must be at most 50 characters long"),
    description: z.string().max(500, "Description must be at most 500 characters long").optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
    textColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
    fontFamily: z.string().max(100, "Font family must be at most 100 characters long").optional(),
});
export const updateThemeSchema = z.object({
    name: z.string().min(3, "Theme name must be at least 3 characters long").max(50, "Theme name must be at most 50 characters long").optional(),
    description: z.string().max(500, "Description must be at most 500 characters long").optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
    textColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional(),
    fontFamily: z.string().max(100, "Font family must be at most 100 characters long").optional(),
});
