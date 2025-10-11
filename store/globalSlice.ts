import { updateUserProfile } from "@/services/axios/user";
import { StateCreator } from "zustand";
import { GlobalStore, GlobalState, ActiveRole } from "@/types";

export const globalSlice: StateCreator<GlobalStore, [], [], GlobalState> = (
  set,
  get
) => ({
  isLoading: false,
  error: null,
  success: null,
  info: null,
  setSuccess: (success) => set({ success }),
  setInfo: (info) => set({ info }),
  clearInfo: () => set({ info: null }),
  clearSuccess: () => set({ success: null }),
  clearError: () => set({ error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  switchRole: get()?.user?.activeRole!,
  setSwitchRole: async (role) => {
    const formData = new FormData();
    formData.append("activeRole", role);
    await updateUserProfile(formData);
    set({ switchRole: role, chats: [] });
  },
  paramsFrom: null,
  setParamsFrom: (params) => set({ paramsFrom: params }),
});
