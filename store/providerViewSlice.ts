import { StateCreator } from "zustand";
import { GlobalStore, ProviderViewState, ProviderView } from "@/types";

export const providerViewSlice: StateCreator<
  GlobalStore,
  [],
  [],
  ProviderViewState
> = (set) => ({
  currentView: "Home",
  setCurrentView: (view: ProviderView) => set({ currentView: view }),
});
