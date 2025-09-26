import { z } from "zod";

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_MB = 50;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const mediaFileSchema = z.object({
  uri: z.string().min(1, "Media URI is required"),
  name: z.string().optional(),
  type: z.string().optional(), // e.g. "image/jpeg" or "video/mp4"
  size: z.number().optional(),
});

export const ProjectFormSchema = z.object({
  title: z
    .string()
    .min(30, "Title must be at least 30 characters long")
    .max(80, "Title must be at most 80 characters long"),

  description: z
    .string()
    .min(300, "Description must be at least 300 characters long")
    .max(1500, "Description must be at most 1500 characters long"),

  category: z.string().min(1, "Category is required"),

  price: z.number().min(5, "Price must be at least 5"),

  location: z.string().min(1, "Location is required"),

  // images: z
  //   .array(mediaFileSchema)
  //   .min(1, "Images are required")
  //   .refine(
  //     (files) =>
  //       files.every((file) => !file.size || file.size <= MAX_IMAGE_SIZE_BYTES),
  //     {
  //       message: `Each image must be less than ${MAX_IMAGE_SIZE_MB}MB`,
  //     }
  //   )
  //   .refine(
  //     (files) =>
  //       files.every((file) => !file.type || file.type.startsWith("image/")),
  //     {
  //       message: "All files must be images",
  //     }
  //   ),

  // videos: z
  //   .array(mediaFileSchema)
  //   .optional()
  //   .refine(
  //     (files) =>
  //       !files ||
  //       files.every((file) => !file.size || file.size <= MAX_VIDEO_SIZE_BYTES),
  //     {
  //       message: `Each video must be less than ${MAX_VIDEO_SIZE_MB}MB`,
  //     }
  //   )
  //   .refine(
  //     (files) =>
  //       !files ||
  //       files.every((file) => !file.type || file.type.startsWith("video/")),
  //     {
  //       message: "All files must be videos",
  //     }
  //   ),
});

export type ProjectFormSchemaType = z.infer<typeof ProjectFormSchema>;
