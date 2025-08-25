import { ApiClientSingleton } from "./conf";
import { UserData } from "@/types";

const { axiosInstance } = ApiClientSingleton.getInstance();

export const updateUserProfile = async (data: FormData): Promise<UserData> => {
  const response = await axiosInstance.patch("users/profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
