// import { getUserServices } from "./service";
import { ApiClientSingleton } from "./conf";
import { UserData, ProviderData } from "@/types";

const { axiosInstance } = ApiClientSingleton.getInstance();

// update this to use /users to patch at the backend and return the user full data 9/26/2025 - pending
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
  const response = await axiosInstance.get(`users/profile/${userId}`);
  return response.data;
};

export const setUserFavourites = async (
  providerId: string
): Promise<{
  provider: ProviderData;
  isFavorited: boolean;
  favoriteCount: number;
}> => {
  const response = await axiosInstance.patch(`provider/${providerId}/favorite`);
  return response.data;
};

export const toggleFollowProvider = async (
  providerId: string
): Promise<UserData> => {
  const response = await axiosInstance.patch(`users/follow/${providerId}`);
  return response.data;
};

export const removeFile = async (fileUrls: string[]): Promise<UserData> => {
  console.log("Removing files:", fileUrls);
  const response = await axiosInstance.post("users/delete-files", { fileUrls });
  return response.data;
};

export const getFeaturedProviders = async (): Promise<ProviderData[]> => {
  const response = await axiosInstance.get("provider/featured");
  return response.data;
};
