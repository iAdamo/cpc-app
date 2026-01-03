import { ApiClientSingleton } from "./conf";
import { ProviderData, ServiceData, JobData, MediaFeedResponse } from "@/types";

const { axiosInstance } = ApiClientSingleton.getInstance();

export const globalSearch = async ({
  model,
  page,
  limit,
  engine,
  searchInput,
  lat,
  long,
  address,
  sortBy,
  categories,
  featured,
  state,
  country,
  radius,
}: {
  model: "providers" | "services" | "jobs";
  page: number;
  limit: number;
  engine: boolean;
  searchInput?: string;
  lat?: string;
  long?: string;
  address?: string;
  sortBy?: string;
  categories?: string[];
  featured?: boolean;
  state?: string;
  country?: string;
  radius?: string;
}): Promise<{
  providers: ProviderData[];
  services?: ServiceData[];
  jobs?: JobData[];
  totalPages: number;
  featuredRatio?: number;
}> => {
  const params: Record<string, any> = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (engine) params.engine = engine;
  if (searchInput) params.searchInput = searchInput;
  if (lat) params.lat = lat;
  if (long) params.long = long;
  if (address) params.address = address;
  if (sortBy) params.sortBy = sortBy;
  if (categories) params.categories = categories;
  if (featured !== undefined) params.featured = featured;
  if (state) params.state = state;
  if (country) params.country = country;
  if (radius) params.radius = radius;

  const response = await axiosInstance.get(`search/${model}`, { params });
  return response.data;
};

// New function to get featured providers with location hierarchy
export const getFeaturedProviders = async ({
  page = 1,
  limit = 10,
  lat,
  long,
  radius = "10000", // Default 10km radius
  state,
  country,
}: {
  page?: number;
  limit?: number;
  lat?: string;
  long?: string;
  radius?: string;
  state?: string;
  country?: string;
}): Promise<{
  providers: ProviderData[];
  totalPages: number;
  page: number;
  hasExactResults: boolean;
  featuredRatio: number;
}> => {
  const params: Record<string, any> = {
    page,
    limit,
    featured: true,
  };

  if (lat) params.lat = lat;
  if (long) params.long = long;
  if (radius) params.radius = radius;
  if (state) params.state = state;
  if (country) params.country = country;

  const response = await axiosInstance.get(`search/providers/location`, {
    params,
  });
  return response.data;
};

// Alternative: Use the main search endpoint with featured=true
export const searchFeaturedProviders = async ({
  page = 1,
  limit = 10,
  lat,
  long,
  radius = "10000",
  state,
  country,
  searchInput,
  sortBy,
  categories,
}: {
  page?: number;
  limit?: number;
  lat?: string;
  long?: string;
  radius?: string;
  state?: string;
  country?: string;
  searchInput?: string;
  sortBy?: string;
  categories?: string[];
}): Promise<{
  providers: ProviderData[];
  services?: ServiceData[];
  totalPages: number;
  featuredRatio?: number;
}> => {
  const params: Record<string, any> = {
    model: "providers",
    page,
    limit,
    featured: true,
    engine: true,
  };

  if (lat) params.lat = lat;
  if (long) params.long = long;
  if (radius) params.radius = radius;
  if (state) params.state = state;
  if (country) params.country = country;
  if (searchInput) params.searchInput = searchInput;
  if (sortBy) params.sortBy = sortBy;
  if (categories) params.categories = categories;

  const response = await axiosInstance.get(`search/providers`, { params });
  return response.data;
};
