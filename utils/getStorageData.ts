import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistedAppState } from "@/types";
import useGlobalStore from "@/store/globalStore";

export class AppStorage {
  // setError: (msg: string) => void;
  // setSuccess: (msg: string) => void;

  // constructor() {
  //   const { setError, setSuccess } = useGlobalStore.getState();
  //   this.setError = setError;
  //   this.setSuccess = setSuccess;
  // }

  getAppData = async (): Promise<PersistedAppState | null> => {
    try {
      const value = await AsyncStorage.getItem("app-storage");
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error getting storage data:", error);
      return null;
    }
  };

  setAppData = async (data: PersistedAppState) => {
    try {
      await AsyncStorage.setItem("app-storage", JSON.stringify(data));
    } catch (error) {
      console.error("Error setting storage data:", error);
    }
  };

  clearAppData = async () => {
    try {
      await AsyncStorage.removeItem("app-storage");
    } catch (error) {
      console.error("Error clearing storage data:", error);
    }
  };
}
