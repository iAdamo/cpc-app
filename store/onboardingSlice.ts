import { StateCreator } from "zustand";
import { OnboardingState, GlobalStore } from "@/types";
import { updateUserProfile } from "@/services/axios/user";

export const onboardingSlice: StateCreator<
  GlobalStore,
  [],
  [],
  OnboardingState
> = (set, get) => ({
  currentStep: 1,
  totalSteps: 12,
  isOnboardingComplete: false,
  onboardingData: {},

  setOnboardingData: (data: { [key: string]: any }) => {
    set((state) => ({
      onboardingData: { ...state.onboardingData, ...data },
    }));
  },

  setCurrentStep: (step: number) => {
    set((state) => ({
      currentStep: Math.min(Math.max(step, 0), state.totalSteps),
    }));
  },

  completeOnboarding: () => {
    set({ isOnboardingComplete: true });
  },

  resetOnboarding: () => {
    set({
      currentStep: 1,
      isOnboardingComplete: false,
    });
  },
});
