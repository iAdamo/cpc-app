import { current } from "immer";
import { ApiClientSingleton } from "./conf";
import { UserData, SignUpData } from "@/types";

const { axiosInstance } = ApiClientSingleton.getInstance();

export const signUpUser = async (data: SignUpData): Promise<UserData> => {
  const response = await axiosInstance.post(
    "auth/register?tokenType=Bearer",
    data
  );
  return response.data;
};

export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<UserData> => {
  const response = await axiosInstance.post(
    "auth/login?tokenType=Bearer",
    credentials
  );
  return response.data;
};

export const logout = async () => {
  await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
};

export const sendCode = async (data: { email: string }) => {
  const response = await axiosInstance.post("/auth/send-code", data);
  return response.data;
};

export const verifyEmail = async (data: { email: string; code: string }) => {
  const response = await axiosInstance.post("/auth/verify-email", data);
  return response.data;
};

export const verifyPhoneNumber = async (data: {
  phoneNumber: string;
  code: string;
}) => {
  const response = await axiosInstance.post("auth/verify-phone", data);
  return response.data;
};

export const forgotPassword = async (data: { email: string }) => {
  const response = await axiosInstance.post("/auth/forgot-password", data);
  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/auth/reset-password", data);
  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/auth/password", data);
  return response.data;
};
