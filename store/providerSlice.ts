import { ProviderData } from "@/types";
import { StateCreator } from "zustand";
import {
  GlobalStore,
  ProviderState,
  DisplayStyle,
  SearchResultData,
  SortBy,
  JobData,
} from "@/types";
import { globalSearch } from "@/services/axios/search";
import { setUserFavourites } from "@/services/axios/user";

export const providerViewSlice: StateCreator<
  GlobalStore,
  [],
  [],
  ProviderState
> = (set, get) => ({
  isSearching: false,
  displayStyle: "Grid",
  sortBy: "Relevance",
  categories: [],
  setCategories: (categories: string[]) => set({ categories }),
  setSortBy: (sortBy: SortBy) => set({ sortBy }),
  setDisplayStyle: (style: DisplayStyle) => set({ displayStyle: style }),
  savedJobs: [],

  // Search-related state and actions
  searchResults: { providers: [], services: [], jobs: [] },
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
      if (data.provider._id) {
        if (data.provider.favoritedBy.includes(get().user?._id || "")) {
          set({
            savedProviders: [...get().savedProviders, data.provider],
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

  setSavedJobs: (job: JobData) => {
    const existing = get().savedJobs.find((j) => j._id === job._id);
    if (existing) {
      // remove
      set({ savedJobs: get().savedJobs.filter((j) => j._id !== job._id) });
      set({ success: "Removed from Saved Jobs" });
    } else {
      // add
      set({ savedJobs: [...get().savedJobs, job] });
      set({ success: "Added to Saved Jobs" });
    }
  },

  executeSearch: async (params: {
    model: "providers" | "services" | "jobs";
    page: number;
    limit: number;
    engine: boolean;
    searchInput?: string;
    lat?: number;
    long?: number;
    address?: string;
    sortBy?: string;
    categories?: string[];
  }) => {
    set({ error: null, success: null, isSearching: true });
    try {
      const {
        model,
        page,
        limit,
        engine,
        searchInput,
        lat,
        long,
        address,
        sortBy,
        categories,
      } = params;
      console.log("Executing search with params:", params);
      const response = await globalSearch({
        model,
        page,
        limit,
        engine,
        searchInput,
        lat: lat?.toString(),
        long: long?.toString(),
        address,
        sortBy,
        categories,
      });
      if (model === "providers") {
        set({
          searchResults: {
            providers: response.providers || [],
            services: response.services || [],
            jobs: [],
            page: page,
            totalPages: response.totalPages,
          },
        });
      } else if (model === "jobs") {
        set({
          searchResults: {
            providers: [],
            services: [],
            jobs: response.jobs || [],
            page: page,
            totalPages: response.totalPages,
          },
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      // set({
      //   error:
      //     error?.response?.data?.message || "An error occurred during search.",
      // });
    } finally {
      set({ isSearching: false });
    }
  },
  clearSearchResults: () =>
    set({ searchResults: { providers: [], services: [], jobs: [] } }),
});
