import { Time } from "@expo/html-elements";
import { z } from "zod";
import { coordinatesSchema } from "./CompanySchema";


// const coordinatesSchema = z.tuple([
//   z.number().optional(),
//   z.number().optional(),
// ]);

// const addressSchema = z.object({
//   zip: z.string().optional(),
//   city: z.string().optional(),
//   state: z.string().optional(),
//   country: z.string().optional(),
//   address: z.string().optional(),
// });

// const locationSchema = z.object({
//   coordinates: coordinatesSchema.optional(),
//   address: addressSchema,
// });

// export const fullLocationSchema = z.object({
//   primary: locationSchema,
//   secondary: locationSchema.optional(),
//   tertiary: locationSchema.optional(),
// });

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
  // coordinates: z
  //   .object({
  //     lat: z.number().min(-90).max(90),
  //     long: z.number().min(-180).max(180),
  //   })
  //   .optional(),
  coordinates: coordinatesSchema.optional(),
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


export type ProposalSchemaType = z.infer<typeof ProposalSchema>;

export const ProposalSchema = z.object({
  message: z
    .string()
    .min(10, "Please enter a brief cover message (min 10 chars)"),
  proposedPrice: z.number().min(0, "Proposed price must be >= 0"),
  estimatedDuration: z.number().min(1, "Delivery time must be at least 1 day"),
  additionalNote: z.string().optional(),
  // media: z.array(z.any()).optional(),
  // media must be images only, each <= 20MB and must not exceed 3 files
  media: z
    .array(mediaFileSchema)
    .max(3, "You can upload up to 3 images")
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
              ? !file.size || file.size <= 20 * 1024 * 1024
              : true)
        ),
      {
        message: `Each image must be ≤ 20MB`,
      }
    ),
});