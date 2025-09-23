import { z } from "zod";

export const socialMediaSchema = z.object({
  website: z
    .string()
    .url("Please enter a valid URL")
    .regex(
      /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/,
      "Please enter a valid URL"
    )
    .optional()
    .or(z.literal("")),
  facebook: z
    .string()
    .url("Please enter a valid Facebook URL")
    .regex(
      /^(https?:\/\/)?(www\.)?facebook\.com\/[A-Za-z0-9_.-]+\/?$/,
      "Please enter a valid Facebook URL"
    )
    .optional()
    .or(z.literal("")),
  instagram: z
    .string()
    .url("Please enter a valid Instagram URL")
    .regex(
      /^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9_.-]+\/?$/,
      "Please enter a valid Instagram URL"
    )
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url("Please enter a valid LinkedIn URL")
    .regex(
      /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/,
      "Please enter a valid LinkedIn URL"
    )
    .optional()
    .or(z.literal("")),
  twitter: z
    .string()
    .url("Please enter a valid Twitter URL")
    .regex(
      /^(https?:\/\/)?(www\.)?x\.com\/[A-Za-z0-9_]+\/?$/,
      "Please enter a valid Twitter/X URL"
    )
    .optional()
    .or(z.literal("")),
  tiktok: z
    .string()
    .url("Please enter a valid TikTok URL")
    .regex(
      /^(https?:\/\/)?(www\.)?tiktok\.com\/@[A-Za-z0-9_.-]+\/?$/,
      "Please enter a valid TikTok URL"
    )
    .optional()
    .or(z.literal("")),
});

export type SocialMediaFormData = z.infer<typeof socialMediaSchema>;
