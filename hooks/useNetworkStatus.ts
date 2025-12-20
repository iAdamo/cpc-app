import { useEffect, useState } from "react";
import * as Network from "expo-network";
import useGlobalStore from "@/store/globalStore";

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(false);
  const { setNetworkError } = useGlobalStore();

  useEffect(() => {
    const checkAndUpdateNetwork = (
      isConnected: boolean,
      isInternetReachable?: boolean
    ) => {
      const connectedStatus = isConnected && (isInternetReachable ?? true);
      setIsConnected(connectedStatus);
      setNetworkError(!connectedStatus);
    };

    // Initial check
    Network.getNetworkStateAsync().then(
      ({ isConnected, isInternetReachable }) => {
        checkAndUpdateNetwork(isConnected ?? false, isInternetReachable);
      }
    );

    // Subscribe to network changes
    const subscription = Network.addNetworkStateListener(
      ({ isConnected, isInternetReachable }) => {
        checkAndUpdateNetwork(isConnected ?? false, isInternetReachable);
      }
    );

    return () => subscription.remove();
  }, [setNetworkError]);

  return isConnected;
};
