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
  duration: z.number().optional(), // in seconds, for videos
  width: z.number().optional(), // in pixels, for images
  height: z.number().optional(), // in pixels, for images
});

export const ProjectFormSchema = z
  .object({
    title: z
      .string()
      .min(30, "Title must be at least 30 characters long")
      .max(80, "Title must be at most 80 characters long"),
    description: z
      .string()
      .min(250, "Description must be at least 250 characters long")
      .max(300, "Description must be at most 300 characters long"),
    subcategoryId: z.string().min(1, "Category is required"),
    minPrice: z
      .number()
      .min(5, "Minimum price must be at least 5")
      .refine(
        (val) => val % 5 === 0,
        "Minimum price must be in increments of 5"
      ),
    maxPrice: z
      .number()
      .min(5, "Maximum price must be at least 5")
      .refine(
        (val) => val % 5 === 0,
        "Maximum price must be in increments of 5"
      ),
    location: z.string().min(1, "Location is required"),
    duration: z
      .number()
      .min(1, "Duration must be at least 1 day")
      .max(365, "Duration must be at most 365 days"),
    media: z
      .array(mediaFileSchema)
      .min(1, "At least one media file is required")
      .max(6, "You can upload up to 6 media files")
      .refine(
        (files) =>
          files.every(
            (file) =>
              !file.type ||
              file.type.startsWith("image") ||
              file.type.startsWith("video")
          ),
        { message: "All files must be images or videos" }
      )
      .refine(
        (files) =>
          files.every(
            (file) =>
              !file.type ||
              (file.type.startsWith("image")
                ? !file.size || file.size <= MAX_IMAGE_SIZE_BYTES
                : file.type.startsWith("video")
                ? !file.size || file.size <= MAX_VIDEO_SIZE_BYTES
                : true)
          ),
        {
          message: `Each image must be ≤ ${MAX_IMAGE_SIZE_MB}MB and each video ≤ ${MAX_VIDEO_SIZE_MB}MB`,
        }
      )
      .refine(
        (files) =>
          files.every(
            (file) =>
              !file.type ||
              (file.type.startsWith("video")
                ? !file.duration || file.duration <= 120000 // in milliseconds (2 minutes)
                : true)
          ),
        { message: "Each video must be ≤ 2 minutes long" }
      )
      .refine(
        (files) =>
          files.some((file) => file.type && file.type.startsWith("image")),
        { message: "At least one image is required." }
      ),
  })
  .superRefine((data, ctx) => {
    if (data.maxPrice < data.minPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxPrice"],
        message: "Maximum price must be greater than or equal to Minimum price",
      });
    }
  });

export type ProjectFormSchemaType = z.infer<typeof ProjectFormSchema>;
