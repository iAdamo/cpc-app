import { createFormControl } from "@gluestack-ui/core/form-control/creator";
import { create } from "zustand";
import { ApiClientSingleton } from "./conf";
import { ServiceData, Category, JobData } from "@/types";
import { AxiosResponse } from "axios";
import useGlobalStore from "@/store/globalStore";

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
  const response = await axiosInstance.get("services/jobs/me");
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

export const createProposal = async (
  jobId: string,
  data: FormData
): Promise<void> => {
  try {
    await axiosInstance.post(`services/jobs/${jobId}/proposals`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: any) {
    if (error?.response?.status === 409) {
      useGlobalStore
        .getState()
        .setError("A proposal for this job already exists.");
    }
    console.error("Error creating proposal:", error);
    throw error;
  }
};

export const updateProposal = async (
  jobId: string,
  proposalId: string,
  data: FormData
): Promise<void> => {
  await axiosInstance.patch(
    `services/jobs/${jobId}/proposals/${proposalId}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const getProposalsByJob = async (jobId: string): Promise<any[]> => {
  const response = await axiosInstance.get(`services/jobs/${jobId}/proposals`);
  return response.data;
};

export const getProposalsByProvider = async (
  providerId: string
): Promise<any[]> => {
  const response = await axiosInstance.get(
    `services/jobs/proposals/provider/${providerId}`
  );
  return response.data;
};

export const updateProposalStatus = async (
  proposalId: string,
  status: string
): Promise<any> => {
  const response = await axiosInstance.patch(
    `services/jobs/proposals/${proposalId}`,
    { status }
  );
  return response.data;
};
