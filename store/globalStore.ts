import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { authSlice } from "./authSlice";
import { globalSlice } from "./globalSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";
import { AuthState, GlobalStore } from "@/types";
import { StateCreator } from "zustand";

type MyStateCreator = StateCreator<
  GlobalStore,
  [
    ["zustand/immer", never],
    ["zustand/devtools", never],
    ["zustand/persist", unknown]
  ],
  [],
  GlobalStore
>;

const useGlobalStore = create<GlobalStore>()(
  devtools(
    immer(
      persist(
        ((...a) => ({
          ...globalSlice(...a),
          ...authSlice(...a),
        })) as MyStateCreator,
        {
          name: "app-storage",
          storage: createJSONStorage(() => AsyncStorage),
          partialize: (state) => ({
            user: state.user,
            isAuthenticated: state.isAuthenticated,
          }),
        }
      )
    )
  )
);

export default useGlobalStore;
