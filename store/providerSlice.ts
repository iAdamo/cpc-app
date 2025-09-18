import { ProviderData } from "@/types";
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
import { setUserFavourites } from "@/axios/user";

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

  filteredProviders: [],
  setFilteredProviders: (providers: ProviderData[]) => {
    set({ filteredProviders: providers });
  },
  savedProviders: [],
  setSavedProviders: async (providerId) => {
    try {
      const data = await setUserFavourites(providerId);
      if (data) {
        if (data.favoritedBy.includes(get().user?._id || "")) {
          set({
            savedProviders: [...get().savedProviders, data],
            success: "Added to Saved Companies",
          });
        } else {
          set({
            savedProviders: get().savedProviders.filter(
              (provider) => provider._id !== providerId
            ),
            success: "Removed from Saved Companies",
          });
        }
      }
    } catch (error) {
      set({ error: "Failed to update favourites." });
      console.error("Failed to update favourites:", error);
    }
  },

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
    set({ error: null, success: null });
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
      });
    } catch (error: any) {
      console.error("Search error:", error);
      set({
        error:
          error?.response?.data?.message || "An error occurred during search.",
      });
    }
  },
  clearSearchResults: () =>
    set({ searchResults: { providers: [], services: [] } }),
});
