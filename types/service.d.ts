import { ProviderData } from "./provider";
import { UserData } from "./user";
import { MediaItem } from "./user";
import { FileType } from "./media";
// export interface SubcategoryData {
//   _id: string;
//   id: string;
//   name: string;
//   description?: string;
//   category: {
//     _id: string;
//     id: string;
//     name: string;
//     description?: string;
//   };
// }

export interface SubcategoryData {
  _id: string;
  name: string;
  description?: string;
  categoryId: {
    _id: string;
    name: string;
    description?: string;
  };
}

export interface Subcategory {
  _id: string;
  name: string;
  description?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  subcategories: Subcategory[];
}

export interface ServiceData {
  _id: string;
  id: string;
  title: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  duration: number;
  subcategoryId: SubcategoryData;
  // ratings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  location: string;
  media: string[];
  // tags: string[];
  // clients: [];
  providerId: ProviderData;
}

export interface JobData {
  _id: string;
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string | Date;
  negotiable: boolean;
  urgency: "Normal" | "Urgent" | "Immediate" | "";
  subcategoryId: SubcategoryData;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  location: string;
  coordinates?: {
    lat: number;
    long: number;
  };
  media: MediaItem[] | FileType[];
  visibility: "Public" | "Verified" | "Private";
  proposalsCount: number;
  // tags: string[];
  userId: UserData;
  providerId: ProviderData;
}
