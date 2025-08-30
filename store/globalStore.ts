import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { authSlice } from "./authSlice";
import { globalSlice } from "./globalSlice";
import { userSlice } from "./userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";
import { GlobalStore } from "@/types";
import { StateCreator } from "zustand";
import { onboardingSlice } from "./onboardingSlice";
import { providerViewSlice } from "./providerViewSlice";
import { act } from "react";
import { current } from "immer";

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
          ...onboardingSlice(...a),
          ...userSlice(...a),
          ...providerViewSlice(...a),
        })) as MyStateCreator,
        {
          name: "app-storage",
          storage: createJSONStorage(() => AsyncStorage),
          partialize: (state) => ({
            user: state.user,
            isAuthenticated: state.isAuthenticated,
            currentStep: state.currentStep,
            isOnboardingComplete: state.isOnboardingComplete,
            currentView: state.currentView,
          }),
        }
      )
    )
  )
);

export default useGlobalStore;
