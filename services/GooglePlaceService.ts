import Constants from "expo-constants";
import axios from "axios";
import { Place, PlaceDetails } from "@/types";
import type { LocationObject } from "expo-location";
import { LocationSubscription } from "expo-location";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;
const AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const PLACE_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error(
    "Google Places API key is not defined in environment variables."
  );
}

export class GooglePlaceService {
  static async autocomplete(input: string): Promise<Place[]> {
    try {
      const response = await axios.get(AUTOCOMPLETE_URL, {
        params: {
          input,
          key: GOOGLE_MAPS_API_KEY,
          types: "geocode", // You can adjust types as needed
        },
      });

      if (response.data.status !== "OK") {
        throw new Error(`Google Places API error: ${response.data.status}`);
      }

      return response.data.predictions;
    } catch (error) {
      console.error("Error fetching place suggestions:", error);
      throw error;
    }
  }

  

  static async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    try {
      const response = await axios.get(PLACE_DETAILS_URL, {
        params: {
          place_id: placeId,
          key: GOOGLE_MAPS_API_KEY,
        },
      });
      if (response.data.status !== "OK") {
        throw new Error(
          `Google Place Details API error: ${response.data.status}`
        );
      }
      return response.data.result;
    } catch (error) {
      console.error("Error fetching place details:", error);
      throw error;
    }
  }

  static getStaticMapUrl(
    location: { latitude: number; longitude: number },
    width: number = 300,
    height: number = 200,
    zoom: number = 14
  ): string {
    const { latitude, longitude } = location;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
  }

  static getDirectionsUrl(origin: string, destination: string): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }
}
