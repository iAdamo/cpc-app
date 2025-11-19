import { ProviderMarkerProps } from "@/types";
import { ProviderData } from "./provider";
import { LocationObject } from "expo-location";

export interface Place {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  address_components: {
    types?: string[];
  }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface ProvidersMapProps {
  providers: ProviderData[];
  onProviderSelect: (provider: ProviderData) => void;
  showUserLocation?: boolean;
  enableLiveTracking?: boolean;
}

export interface ProviderMarkerProps {
  provider: ProviderData;
  isSelected: boolean;
  userLocation?: LocationObject | null;
}

export type MapType = "standard" | "satellite" | "terrain" | "hybrid";

export interface MapControlProps {
  isLiveTracking: boolean;
  onToggleLiveTracking: () => void;
  onMapTypeChange: (string) => void;
  mapType: MapType;
  onFocusUserLocation: () => void;
  // onFocusProvider: () => void;
}
