export interface SubcategoryData {
  _id: string;
  id: string;
  name: string;
  description?: string;
  category: {
    _id: string;
    id: string;
    name: string;
    description?: string;
  };
}

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  subcategories: Subcategory[];
}

export interface ServiceData {
  _id: string;
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  ratings: number;
  location: string;
  provider: CompanyData;
  favoritedBy: string[];
  favoriteCount: number;
  images: string[];
  videos: string[];
  tags: string[];
  link: string;
  clients: [];
}
