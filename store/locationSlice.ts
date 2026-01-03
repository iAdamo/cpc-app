import { current } from "immer";
import { StateCreator } from "zustand";
import * as Location from "expo-location";
import { GlobalStore, LocationState, Place, PlaceDetails } from "@/types";
import { GooglePlaceService } from "@/services/googlePlaceService";

export const locationSlice: StateCreator<GlobalStore, [], [], LocationState> = (
  set,
  get
) => ({
  currentLocation: null,
  liveLocation: null,
  isTracking: false,
  watchId: null,
  places: [],
  locationError: null,
  clearLocationError: () => set({ locationError: null }),
  selectedPlace: null,
  getCurrentLocation: async () => {
    try {
      set({ isLoading: true, locationError: null });
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        set({ locationError: "Permission to access location was denied" });
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const prevLocation = get().currentLocation;
      if (
        prevLocation &&
        prevLocation.coords &&
        location.coords &&
        prevLocation.coords.latitude === location.coords.latitude &&
        prevLocation.coords.longitude === location.coords.longitude
      ) {
        set({ isLoading: false, locationError: null });
        return prevLocation;
      }

      const addressArr = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      const address = addressArr[0];

      set({
        currentLocation: { ...location, ...address },
        isLoading: false,
        locationError: null,
      });
      return { ...location, ...address };
    } catch (error) {
      set({
        isLoading: false,
        locationError:
          (error as Error).message || "Failed to get current location",
      });
    }
  },

  /**
   * Starts live location tracking, updating the liveLocation state every 5 seconds or 10 meters.
   * @returns void
   */
  startLiveTracking: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        set({ locationError: "Permission to access location was denied" });
        return;
      }
      if (get().isTracking) return; // Already tracking

      const watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          set({ liveLocation: location, locationError: null });
        }
      );

      set({
        watchId: watchId,
        isTracking: true,
        locationError: null,
      });
    } catch (error) {
      set({
        locationError:
          (error as Error).message || "Failed to start live tracking",
      });
    }
  },
  stopLiveTracking: () => {
    const { watchId } = get();
    if (watchId) {
      watchId.remove();
      set({
        watchId: null,
        isTracking: false,
        liveLocation: null,
        locationError: null,
      });
    }
  },
  setSelectedPlace: (place: PlaceDetails) => {
    set({ selectedPlace: place });
  },
  searchPlaces: async (query: string) => {
    if (!query) {
      set({ places: [] });
      return;
    }
    try {
      const results = await GooglePlaceService.autocomplete(query);
      set({ places: results, locationError: null });
    } catch (err) {
      set({
        locationError: (err as Error).message || "Failed to search places",
        error: (err as Error).message,
      });
    }
  },
  getPlaceDetails: async (placeId: string) => {
    try {
      const details = await GooglePlaceService.getPlaceDetails(placeId);
      set({ selectedPlace: details, locationError: null });
      return details;
    } catch (error) {
      set({
        locationError:
          (error as Error).message || "Failed to get place details",
      });
    }
  },
});
