import { ProviderData } from "./../types/provider.d";
import { StateCreator } from "zustand";
import {
  GlobalStore,
  ProviderState,
  ProviderView,
  DisplayStyle,
  SearchResultData,
  SortBy,
} from "@/types";
import { globalSearch } from "@/axios/search";

export const providerViewSlice: StateCreator<
  GlobalStore,
  [],
  [],
  ProviderState
> = (set, get) => ({
  currentView: "Home",
  displayStyle: "Grid",
  sortBy: "Relevance",
  setSortBy: (sortBy: SortBy) => set({ sortBy }),
  setDisplayStyle: (style: DisplayStyle) => set({ displayStyle: style }),
  setCurrentView: (view: ProviderView) => set({ currentView: view }),

  // Search-related state and actions
  searchResults: { providers: [], services: [] },
  setSearchResults: (results: SearchResultData) =>
    set({ searchResults: results }),

  savedProviders: [],
  setSavedProviders: (providers: ProviderData[]) =>
    set({ savedProviders: providers }),

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
      const { page, limit, engine, searchInput, lat, long, address } = params;
      const sortBy = get().sortBy;
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
