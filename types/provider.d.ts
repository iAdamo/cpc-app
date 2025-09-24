import { SubcategoryData } from "./subcategory";
import { FileType } from "./media";
export interface ProviderData {
  _id: string;
  // id: string;
  providerName: string;
  providerLogo?: string | FileType;
  isVerified?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  isOnline?: boolean;
  isAvailable?: boolean;
  providerTagline?: string;
  providerDescription: string;
  providerEmail: string;
  providerPhoneNumber: string;
  subcategories: SubcategoryData[];
  providerSocialMedia: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
  };
  reviewCount: number;
  averageRating: number;
  providerImages: string[] | FileType[];
  services: any[];
  clients: any[];
  latitude: number;
  longitude: number;
  owner: string;
  favoritedBy: string[];
  favoriteCount: number;
  ratings: number;
  createdAt: string;
  updatedAt: string;
  location: {
    primary?: {
      coordinates?: {
        lat?: number;
        long?: number;
      };
      address?: {
        zip?: string;
        city?: string;
        state?: string;
        country?: string;
        address?: string;
      };
    };
    secondary?: {
      coordinates?: {
        lat?: number;
        long?: number;
      };
      address?: {
        zip?: string;
        city?: string;
        state?: string;
        country?: string;
        address?: string;
      };
    };
    tertiary?: {
      coordinates?: {
        lat?: number;
        long?: number;
      };
      address?: {
        zip?: string;
        city?: string;
        state?: string;
        country?: string;
        address?: string;
      };
    };
  };
}
