// hooks/useLocation.ts
import { useEffect } from "react";
import useGlobalStore from "@/store/globalStore";
import { LocationObject } from "expo-location";

interface UseLocationReturn {
  isTracking: boolean;
  startLiveTracking: () => Promise<void>;
  stopLiveTracking: () => void;
}

export const useLocation = (autoStart: boolean = false): UseLocationReturn => {
  const {
    isTracking,
    getCurrentLocation,
    startLiveTracking,
    stopLiveTracking,
    currentView,
    currentLocation,
  } = useGlobalStore();

  useEffect(() => {
    if (!currentLocation) getCurrentLocation();

    // Cleanup on unmount
    return () => {
      if (isTracking) {
        stopLiveTracking();
      }
    };
  }, [currentView]);

  useEffect(() => {
    if (autoStart && !isTracking) {
      startLiveTracking();
    }
  }, [autoStart, isTracking]);

  return {
    isTracking,
    startLiveTracking,
    stopLiveTracking,
  };
};
