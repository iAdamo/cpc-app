import { ProviderData } from "./provider";
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
  ratings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  location: string;
  favoritedBy: string[];
  favoriteCount: number;
  media: string[];
  tags: string[];
  link: string;
  clients: [];
  providerId: ProviderData;
}
