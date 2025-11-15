import { Time } from "@expo/html-elements";
import { z } from "zod";

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const mediaFileSchema = z.object({
  uri: z.string().min(1, "Media URI is required"),
  name: z.string().optional(),
  type: z.string().optional(), // e.g. "image/jpeg" or "video/mp4"
  size: z.number().optional(),
  duration: z.number().optional(), // in seconds, for videos
  width: z.number().optional(), // in pixels, for images
  height: z.number().optional(), // in pixels, for images
});

export const JobFormSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters long")
    .max(80, "Title must be at most 80 characters long"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters long")
    .max(300, "Description must be at most 300 characters long"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().min(1, "Subcategory is required"),
  budget: z
    .number()
    .min(5, "Budget must be at least 5")
    .refine((val) => val % 5 === 0, "Minimum price must be in increments of 5"),
  deadline: z
    .number()
    .min(1, "Deadline must be at least 1 day")
    .max(365, "Deadline must be at most 365 days"),
  location: z.string().min(1, "Location is required"),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      long: z.number().min(-180).max(180),
    })
    .optional(),
  urgency: z.string().optional(),
  negotiable: z.boolean().optional(),
  visibility: z.string().optional(),
  // contactPreference: z.string().min(1, "Contact preference is required"),
  media: z
    .array(mediaFileSchema)
    .refine(
      (files) =>
        files.every((file) => !file.type || file.type.startsWith("image")),
      { message: "All files must be images" }
    )
    .refine(
      (files) =>
        files.every(
          (file) =>
            !file.type ||
            (file.type.startsWith("image")
              ? !file.size || file.size <= MAX_IMAGE_SIZE_BYTES
              : true)
        ),
      {
        message: `Each image must be ≤ ${MAX_IMAGE_SIZE_MB}MB`,
      }
    )
   
    .optional(),
});

export type JobFormSchemaType = z.infer<typeof JobFormSchema>;
