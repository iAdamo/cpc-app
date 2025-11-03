import useGlobalStore from "@/store/globalStore";

const toRad = (value: number) => (value * Math.PI) / 180;

/**
 * Haversine formula returning distance in kilometers between (lat1, lon1)
 * and currentLocation stored in global store. Returns -1 when no location.
 */
export function getDistance(lat1: number, lon1: number): number {
  const currentLocation = useGlobalStore.getState().currentLocation;
  if (!currentLocation) return -1;
  const lat2 = currentLocation.coords.latitude;
  const lon2 = currentLocation.coords.longitude;
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // Distance in kilometers
}

/**
 * Returns an object describing the distance relative to the current location.
 * - value: numeric distance (meters when < 1 km, otherwise kilometers)
 * - unit: "m" or "km"
 * - text: formatted string like "850 m" or "1.2 km"
 * Returns null when currentLocation is unavailable.
 */
export function getDistanceWithUnit(
  lat1: number,
  lon1: number
): { value: number; unit: "m" | "km"; text: string } | null {
  const km = getDistance(lat1, lon1);
  if (km < 0) return null;

  if (km < 1) {
    const meters = Math.round(km * 1000);
    return { value: meters, unit: "m", text: `${meters} m` };
  }

  // Show one decimal for km when < 10km, otherwise no decimals
  const formattedKm = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  const text = `${formattedKm % 1 === 0 ? formattedKm : formattedKm} km`;
  return { value: formattedKm, unit: "km", text };
}

export default getDistance;
