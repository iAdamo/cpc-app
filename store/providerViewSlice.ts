import { StateCreator } from "zustand";
import {
  GlobalStore,
  ProviderViewState,
  ProviderView,
  DisplayView,
} from "@/types";

export const providerViewSlice: StateCreator<
  GlobalStore,
  [],
  [],
  ProviderViewState
> = (set) => ({
  currentView: "Home",
  displayView: "Grid",
  setDisplayView: (view: DisplayView) => set({ displayView: view }),
  setCurrentView: (view: ProviderView) => set({ currentView: view }),
});
