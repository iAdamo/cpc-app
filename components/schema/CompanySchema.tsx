import { z } from "zod";

const MAX_IMAGE_SIZE_MB = 40;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_LOGO_SIZE_MB = 40;
const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;

export const coordinatesSchema = z.tuple([
  z.number().optional(),
  z.number().optional(),
]);

const addressSchema = z.object({
  zip: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
});

export const locationSchema = z.object({
  coordinates: coordinatesSchema.optional(),
  address: addressSchema,
});

export const fullLocationSchema = z.object({
  primary: locationSchema,
  secondary: locationSchema.optional(),
  tertiary: locationSchema.optional(),
});

export const companyFormSchema = z.object({
  providerEmail: z
    .string()
    .email("Company email must be a valid email address"),
  providerName: z
    .string()
    .min(3, "Company name must be at least 3 characters long")
    .max(50, "Company name must be at most 50 characters long"),
  providerDescription: z
    .string()
    .min(100, "Company description must be at least 100 characters long")
    .max(1500, "Company description must be at most 1500 characters long"),
  providerPhoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Company phone number must be a valid phone number"
    ),
  providerLocation: fullLocationSchema,
  providerLogo: z
    .object({
      uri: z.string().min(1, "Logo URI is required"),
      name: z.string().optional(),
      type: z.string().optional(),
      size: z.number().optional(), // Add size property for validation
      // Optionally, you can add width, height, etc.
    })
    .refine((file) => !file || !file.size || file.size <= MAX_LOGO_SIZE_BYTES, {
      message: `Logo must be less than ${MAX_LOGO_SIZE_MB}MB`,
    }),
  providerImages: z
    .array(
      z.object({
        uri: z.string().min(1, "Image URI is required"),
        name: z.string().optional(),
        type: z.string().optional(),
        size: z.number().optional(), // Add size property for validation
        // Optionally, you can add width, height, etc.
      })
    )
    .min(1, "Images are required")
    .refine(
      (files) =>
        files.every((file) => !file.size || file.size <= MAX_IMAGE_SIZE_BYTES),
      {
        message: `Each image must be less than ${MAX_IMAGE_SIZE_MB}MB`,
      }
    ),
});

export type companyFormSchemaType = z.infer<typeof companyFormSchema>;
export type fullLocationSchemaType = z.infer<typeof fullLocationSchema>;
