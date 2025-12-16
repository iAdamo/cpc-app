import { create } from "zustand";
import { ApiClientSingleton } from "./conf";
import { socketService } from "../socketService";
import {
  UserData,
  Chat,
  LastMessage,
  Message,
  MessageContent,
  MessageStatus,
  SendMessageParams,
  Presence,
} from "@/types";
import useGlobalStore from "@/store/globalStore";

const { axiosInstance } = ApiClientSingleton.getInstance();

export const getLastSeen = async (userId: string): Promise<Presence> => {
  const response = await axiosInstance.get(`/notif/presence/${userId}`);
  return response.data;
};

export const updateAvailability = async (status: string): Promise<Presence> => {
  const response = await axiosInstance.post("/notif/presence/status", {
    status,
  });
  return response.data;
};

export const uploadChatMedia = async (
  file: FormData,
  onProgress?: (progress: number) => void
) => {
  console.log(Array.from(file.entries()));
  try {
    return await ApiClientSingleton.instance.uploadFile(
      "chat/upload",
      file,
      onProgress
    );
  } catch (error) {
    console.error("Error uploading chat media:", error);
    throw error;
  }
};
