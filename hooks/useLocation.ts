// hooks/useLocation.ts
import { useEffect } from "react";
import useGlobalStore from "@/store/globalStore";
import { LocationObject } from "expo-location";

interface UseLocationReturn {
  isTracking: boolean;
  getCurrentLocation: () => Promise<LocationObject | undefined>;
  startLiveTracking: () => Promise<void>;
  stopLiveTracking: () => void;
}

export const useLocation = (autoStart: boolean = false): UseLocationReturn => {
  const {
    isTracking,
    getCurrentLocation,
    startLiveTracking,
    stopLiveTracking,
  } = useGlobalStore();

  useEffect(() => {
    // Get initial location when component mounts
    getCurrentLocation();

    // Cleanup on unmount
    return () => {
      if (isTracking) {
        stopLiveTracking();
      }
    };
  }, []);

  useEffect(() => {
    if (autoStart && !isTracking) {
      startLiveTracking();
    }
  }, [autoStart, isTracking]);

  return {
    isTracking,
    getCurrentLocation,
    startLiveTracking,
    stopLiveTracking,
  };
};
