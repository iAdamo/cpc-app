import useGlobalStore from "@/store/globalStore";

// Types for better type safety
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface DistanceResult {
  value: number;
  unit: "m" | "km";
  text: string;
}

export interface Provider {
  coordinates: Coordinates;
  [key: string]: any;
}

class LocationService {
  private static instance: LocationService;
  private readonly EARTH_RADIUS_KM = 6371;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @returns Distance in kilometers
   */
  public calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_KM * c;
  }

  /**
   * Get distance from point to current location stored in global store
   * @returns Distance in kilometers, or -1 when no location available
   */
  public getDistanceFromCurrentLocation(lat: number, lon: number): number {
    const currentLocation = useGlobalStore.getState().currentLocation;
    if (!currentLocation) return -1;

    return this.calculateDistance(
      lat,
      lon,
      currentLocation.coords.latitude,
      currentLocation.coords.longitude
    );
  }

  /**
   * Get formatted distance with unit from current location
   * @returns Object with value, unit, and formatted text, or null when no location available
   */
  public getDistanceFromCurrentLocationWithUnit(
    lat: number,
    lon: number
  ): DistanceResult | null {
    const km = this.getDistanceFromCurrentLocation(lat, lon);
    if (km < 0) return null;

    return this.formatDistance(km);
  }

  /**
   * Format distance in kilometers to human-readable format
   * @returns Object with value, unit, and formatted text
   */
  public formatDistance(km: number): DistanceResult {
    if (km < 1) {
      const meters = Math.round(km * 1000);
      return { value: meters, unit: "m", text: `${meters} m` };
    }

    const formattedKm = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
    const text = `${formattedKm} km`;
    return { value: formattedKm, unit: "km", text };
  }

  /**
   * Calculate region that fits all coordinates with optional padding
   * @returns Region object for map display, or null when no coordinates
   */
  public getRegionForCoordinates(
    coordinates: Coordinates[],
    padding: number = 0.1
  ): LocationRegion | null {
    if (!coordinates || coordinates.length === 0) {
      return null;
    }

    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach((coord) => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    const latDelta = maxLat - minLat + padding;
    const lngDelta = maxLng - minLng + padding;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }

  /**
   * Filter providers by distance from user location
   * @returns Filtered array of providers within max distance
   */
  public filterProvidersByDistance(
    providers: Provider[],
    userLocation: Coordinates | null,
    maxDistanceKm: number
  ): Provider[] {
    if (!userLocation) return providers;

    return providers.filter((provider) => {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        provider.coordinates.latitude,
        provider.coordinates.longitude
      );
      return distance <= maxDistanceKm;
    });
  }

  /**
   * Sort providers by distance from user location (closest first)
   * @returns Sorted array of providers
   */
  public sortProvidersByDistance(
    providers: Provider[],
    userLocation: Coordinates | null
  ): Provider[] {
    if (!userLocation) return providers;

    return [...providers].sort((a, b) => {
      const distanceA = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.coordinates.latitude,
        a.coordinates.longitude
      );
      const distanceB = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.coordinates.latitude,
        b.coordinates.longitude
      );
      return distanceA - distanceB;
    });
  }

  /**
   * Get current location from global store
   * @returns Current coordinates or null if not available
   */
  public getCurrentLocation(): Coordinates | null {
    const currentLocation = useGlobalStore.getState().currentLocation;
    if (!currentLocation) return null;

    return {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };
  }
}

// Singleton instance
export const locationService = LocationService.getInstance();

export default LocationService;
