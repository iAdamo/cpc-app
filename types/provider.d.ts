import { SubcategoryData } from "./subcategory";

export interface ProviderData {
  _id: string;
  // id: string;
  providerName: string;
  providerDescription: string;
  providerEmail: string;
  providerPhoneNumber: string;
  subcategories: SubcategoryData[];
  website: string;
  providerSocialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    other?: string;
  };
  reviewCount: number;
  averageRating: number;
  providerImages: string[];
  services: any[];
  clients: any[];
  latitude: number;
  longitude: number;
  owner?: string;
  favoritedBy: string[];
  favoriteCount: number;
  ratings: number;
  createdAt: string;
  updatedAt: string;
  location: {
    primary: {
      coordinates: {
        lat: number;
        long: number;
      };
      address: {
        zip: string;
        city: string;
        state: string;
        country: string;
        address: string;
      };
    };
    secondary: {
      coordinates: {
        lat: number;
        long: number;
      };
      address: {
        zip: string;
        city: string;
        state: string;
        country: string;
        address: string;
      };
    };
    tertiary: {
      coordinates: {
        lat: number;
        long: number;
      };
      address: {
        zip: string;
        city: string;
        state: string;
        country: string;
        address: string;
      };
    };
  };
}
