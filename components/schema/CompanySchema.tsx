import { z } from "zod";

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

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
  providerLocation: z
    .object({
      address: z.string().min(1, "Address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      country: z.string().min(1, "Country is required"),
      zip: z.string().min(1, "Zip code is required"),
    })
    .refine(
      (location) =>
        location.address &&
        location.city &&
        location.state &&
        location.country &&
        location.zip,
      {
        message: "All address fields are required",
      }
    )
    .optional(),
  providerImages: z
    .array(
      z.object({
        uri: z.string().min(1, "Image URI is required"),
        name: z.string().min(1, "Image name is required"),
        type: z.string().min(1, "Image type is required"),
        size: z.number().optional(), // Add size property for validation
        // Optionally, you can add width, height, etc.
      })
    )
    .min(1, "Images are required")
    .refine(
      (files) =>
        files.every(
          (file) =>
            !file.size || file.size <= MAX_IMAGE_SIZE_BYTES
        ),
      {
        message: `Each image must be less than ${MAX_IMAGE_SIZE_MB}MB`,
      }
    ),
});

const coordinatesSchema = z.object({
  lat: z.number().optional(),
  long: z.number().optional(),
});

const addressSchema = z.object({
  zip: z.string().min(1, "Zip code is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().optional(),
});

const locationSchema = z.object({
  coordinates: coordinatesSchema.optional(),
  address: addressSchema,
});

export const fullLocationSchema = z.object({
  primary: locationSchema,
  secondary: locationSchema.optional(),
  tertiary: locationSchema.optional(),
});

export type companyFormSchemaType = z.infer<typeof companyFormSchema>;
export type fullLocationSchemaType = z.infer<typeof fullLocationSchema>;
