import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistedAppState } from "@/types";
export const getAppData = async (): Promise<PersistedAppState | null> => {
  try {
    const value = await AsyncStorage.getItem("app-storage");
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error getting storage data:", error);
    return null;
  }
};

export const clearAppData = async () => {
  try {
    await AsyncStorage.removeItem("app-storage");
  } catch (error) {
    console.error("Error clearing storage data:", error);
  }
};
