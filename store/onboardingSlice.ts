import { StateCreator } from "zustand";
import { OnboardingData, OnboardingState, GlobalStore } from "@/types";
import { updateUserProfile } from "@/axios/user";

export const onboardingSlice: StateCreator<
  GlobalStore,
  [],
  [],
  OnboardingState
> = (set, get) => ({
  currentStep: 1,
  totalSteps: 9,
  isOnboardingComplete: false,

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
