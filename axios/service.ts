import { ApiClientSingleton } from "./conf";
import { ServiceData, ServiceCategory } from "@/types";

const { axiosInstance } = ApiClientSingleton.getInstance();

export const createService = async (data: FormData): Promise<ServiceData> => {
  const response = await axiosInstance.post("services", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateService = async (
  id: string,
  data: FormData
): Promise<ServiceData> => {
  const response = await axiosInstance.patch(`services/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteService = async (id: string): Promise<ServiceData[]> => {
  const response = await axiosInstance.delete(`services/${id}`);
  return response.data;
};

export const getAllCategoriesWithSubcategories = async (): Promise<
  ServiceCategory[]
> => {
  const response = await axiosInstance.get("services/categories");
  return response.data;
};

export const getServiceById = async (id: string): Promise<ServiceData> => {
  const response = await axiosInstance.get(`services/${id}`);

  return response.data;
};

export const getServicesByCompany = async (
  id: string
): Promise<ServiceData[]> => {
  const response = await axiosInstance.get(`services/provider/${id}`);

  return response.data;
};

export const getRandomServices = async (
  page: number,
  limit: number
): Promise<{ services: ServiceData[]; totalPages: number }> => {
  const response = await axiosInstance.get(
    `services/random?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getServices = async (
  page: number,
  limit: number
): Promise<{ services: ServiceData[]; totalPages: number }> => {
  const response = await axiosInstance.get(
    `services?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getUserServices = async (id: string): Promise<ServiceData[]> => {
  const response = await axiosInstance.get(`services/user/${id}`);

  return response.data;
};
