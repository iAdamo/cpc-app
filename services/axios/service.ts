import { create } from "zustand";
import { ApiClientSingleton } from "./conf";
import { ServiceData, Category, JobData } from "@/types";

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
  Category[]
> => {
  const response = await axiosInstance.get("services/categories");
  return response.data;
};

export const getServiceById = async (id: string): Promise<ServiceData> => {
  const response = await axiosInstance.get(`services/${id}`);

  return response.data;
};

export const getServicesByProvider = async (
  id: string
): Promise<ServiceData[]> => {
  const response = await axiosInstance.get(`services/provider/${id}`);

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

export const createJob = async (data: FormData): Promise<JobData> => {
  console.log(data);
  const response = await axiosInstance.post("services/jobs", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return { ...response.data, status: response.status };
};

export const getJobsByUser = async (): Promise<JobData[]> => {
  const response = await axiosInstance.get("services/jobs");
  return response.data;
};

export const updateJob = async (
  jobId: string,
  data: FormData
): Promise<JobData> => {
  const response = await axiosInstance.patch(`services/jobs/${jobId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteJob = async (jobId: string): Promise<JobData[]> => {
  const response = await axiosInstance.delete(`services/jobs/${jobId}`);
  return response.data;
};

export const getJobById = async (jobId: string): Promise<JobData> => {
  const response = await axiosInstance.get(`services/jobs/${jobId}`);
  return response.data;
};
