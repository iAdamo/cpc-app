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
  setSavedProviders: (providers: ProviderData[]) => {
    set({ savedProviders: providers });

    // sync with backend
    // send the id of the latest provider in the list
    const latestProvider = providers[providers.length - 1];
    if (latestProvider) {
      const response = setUserFavourites(latestProvider._id);
      response
        .then((data) => {
          set({ success: "Favourites updated successfully!" });
          // if the backend returns the updated list and the length is different, update the state
          if (
            data &&
            data.favoritedBy &&
            data.favoritedBy.length !== providers.length
          ) {
            // Map provider IDs to ProviderData objects using the current providers list
            const updatedProviders = data.favoritedBy
              .map((id: string) =>
                providers.find((p: ProviderData) => p._id === id)
              )
              .filter((p: ProviderData | undefined): p is ProviderData => !!p);
            set({ savedProviders: updatedProviders });
          }
        })
        .catch((error) => {
          set({ error: "Failed to update favourites." });
          console.error("Failed to update favourites:", error);
        });
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
      return true;
    } catch (error: any) {
      console.error("Search error:", error);
      set({ error: error.message || "An error occurred during search." });
    }
  },
  clearSearchResults: () =>
    set({ searchResults: { providers: [], services: [] } }),
});
