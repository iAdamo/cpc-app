import { StateCreator } from "zustand";
import { GlobalStore, GlobalState } from "@/types";

export const globalSlice: StateCreator<GlobalStore, [], [], GlobalState> = (
  set
) => ({
  isLoading: false,
  error: null,
  success: null,
  setSuccess: (success) => set({ success }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
});
