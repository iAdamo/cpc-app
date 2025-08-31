import { StateCreator } from "zustand";
import {
  GlobalStore,
  ProviderState,
  ProviderView,
  DisplayStyle,
  SearchResultData,
} from "@/types";
import { globalSearch } from "@/axios/search";

export const providerViewSlice: StateCreator<
  GlobalStore,
  [],
  [],
  ProviderState
> = (set) => ({
  currentView: "Home",
  displayStyle: "Grid",
  setDisplayStyle: (style: DisplayStyle) => set({ displayStyle: style }),
  setCurrentView: (view: ProviderView) => set({ currentView: view }),

  // Search-related state and actions
  searchResults: { providers: [], services: [] },
  setSearchResults: (results: SearchResultData) =>
    set({ searchResults: results }),

  executeSearch: async (params: {
    page: number;
    limit: number;
    engine: boolean;
    searchInput?: string;
    lat?: number;
    long?: number;
    address?: string;
    sortBy?: string;
  }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const { page, limit, engine, searchInput, lat, long, address, sortBy } =
        params;
      const response = await globalSearch(
        page,
        limit,
        engine,
        searchInput,
        lat?.toString(),
        long?.toString(),
        address,
        sortBy
      );
      set({
        searchResults: {
          providers: response.providers,
          services: response.services || [],
        },
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.message || "An error occurred during search.",
        isLoading: false,
      });
    }
  },
  clearSearchResults: () =>
    set({ searchResults: { providers: [], services: [] } }),
});
