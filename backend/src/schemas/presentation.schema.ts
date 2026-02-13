import { z } from "zod";

export const createPresentationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long").max(100, "Title must be at most 100 characters long"),
  content: z.string().min(1, "Content cannot be empty"),
  theme: z.string().optional(),
});