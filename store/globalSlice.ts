import { StateCreator } from "zustand";
import { GlobalStore, GlobalState, LayoutView } from "@/types";

export const globalSlice: StateCreator<GlobalStore, [], [], GlobalState> = (
  set,
  get
) => ({
  currentView: "Home",
  setCurrentView: (view: LayoutView) => set({ currentView: view }),
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
    get().updateUserProfile("Client", formData);
  },
  paramsFrom: null,
  setParamsFrom: (params) => set({ paramsFrom: params }),
  progress: 0,
  setProgress: (progress) => set({ progress }),
});
