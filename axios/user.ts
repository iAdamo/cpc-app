import { getUserServices } from "./service";
import { ApiClientSingleton } from "./conf";
import { UserData, ProviderData } from "@/types";

const { axiosInstance } = ApiClientSingleton.getInstance();

export const updateUserProfile = async (data: FormData): Promise<UserData> => {
  const response = await axiosInstance.patch("users/profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const createProviderProfile = async (
  data: FormData
): Promise<UserData> => {
  const response = await axiosInstance.post("/provider", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateProviderProfile = async (
  data: FormData
): Promise<UserData> => {
  const response = await axiosInstance.patch("/provider", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getUserProfile = async (userId?: string): Promise<UserData> => {
  const response = await axiosInstance.get(`users/${userId}`);
  return response.data;
};

export const setUserFavourites = async (
  providerId: string
): Promise<ProviderData> => {
  const response = await axiosInstance.patch(`provider/${providerId}/favorite`);
  return response.data;
};
