import { StateCreator } from "zustand";
import { OnboardingData, OnboardingState, GlobalStore } from "@/types";


const initialUserProfile: OnboardingData = {
  firstName: "",
  lastName: "",
  profilePicture: null,
  notificationEnabled: true,
  role: "",
  companyName: "",
  companyDescription: "",
  companyEmail: "",
  companyPhoneNumber: "",
  companyAddress: "",
  companyImages: null,
  zip: "",
  city: "",
  latitude: null,
  longitude: null,
  state: "",
  country: "",
  address: "",
  selectedServices: undefined,
  subcategories: undefined,
  availableCategories: undefined,
};

export const onboardingSlice: StateCreator<
  GlobalStore,
  [],
  [],
  OnboardingState
> = (set, get) => ({
  currentStep: 1,
  totalSteps: 5,
  isOnboardingComplete: false,
  userProfile: initialUserProfile,

  setCurrentStep: (step: number) => {
    set((state) => ({
      currentStep: Math.min(Math.max(step, 1), state.totalSteps),
    }));
  },

  updateProfile: (updates: Partial<OnboardingData>) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...updates },
    }));
  },

  completeOnboarding: () => {
    set({ isOnboardingComplete: true });
  },

  resetOnboarding: () => {
    set({
      currentStep: 1,
      isOnboardingComplete: false,
      userProfile: initialUserProfile,
    });
  },
});
