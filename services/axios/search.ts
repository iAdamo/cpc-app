import { ApiClientSingleton } from "./conf";
import { ProviderData, ServiceData, JobData } from "@/types";

const { axiosInstance } = ApiClientSingleton.getInstance();

export const globalSearch = async (
  model: "providers" | "services" | "jobs",
  page: number,
  limit: number,
  engine: boolean,
  searchInput?: string,
  lat?: string,
  long?: string,
  address?: string,
  sortBy?: string,
  categories?: string[]
): Promise<{
  providers: ProviderData[];
  services?: ServiceData[];
  jobs?: JobData[];
  totalPages: number;
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

  const response = await axiosInstance.get(`search/${model}`, { params });
  return response.data;
};
