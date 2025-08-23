import { ApiClientSingleton } from "./conf";
import { UserData } from "@/types";

const { axiosInstance } = ApiClientSingleton.getInstance();

export const signUpUser = async (data: FormData): Promise<UserData> => {
  const response = await axiosInstance.post("users", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<UserData> => {
  const response = await axiosInstance.post("auth/login", credentials);
  return response.data;
};

export const logout = async () => {
  await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
};

export const sendCode = async (data: { email: string }) => {
  const response = await axiosInstance.post("/auth/send-code", data);
  return response.data;
};

export const verifyEmail = async (data: { code: string }) => {
  const response = await axiosInstance.post("/auth/verify-email", data);
  return response.data;
};

export const verifyPhoneNumber = async (data: { code: string }) => {
  const response = await axiosInstance.post("auth/verify-phone", data);
  return response.data;
};

export const forgotPassword = async (data: { email: string }) => {
  const response = await axiosInstance.post("/auth/forgot-password", data);
  return response.data;
};

export const resetPassword = async (data: { email: string; password: string }) => {
  const response = await axiosInstance.post("/auth/reset-password", data);
  return response.data;
};
