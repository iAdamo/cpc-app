import { StateCreator } from "zustand";
import { OnboardingData, OnboardingState, GlobalStore } from "@/types";
import { updateUserProfile } from "@/axios/user";

const initialUserProfile: OnboardingData = {
  firstName: "",
  lastName: "",
  homeAddress: "",
  profilePicture: null,
  notificationEnabled: true,
  activeRole: "",
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
  totalSteps: 10,
  isOnboardingComplete: false,
  // userProfile: initialUserProfile,

  setCurrentStep: (step: number) => {
    set((state) => ({
      currentStep: Math.min(Math.max(step, 0), state.totalSteps),
    }));
  },

  // updateProfile: (updates: Partial<OnboardingData>) => {
  //   set((state) => ({
  //     userProfile: { ...state.userProfile, ...updates },
  //   }));
  // },

  // updateUserProfile: async () => {
  //   const { userProfile } = get();
  //   set({ isLoading: true, error: null });
  //   try {
  //     const formData = new FormData();
  //     if (userProfile.firstName)
  //       formData.append("firstName", userProfile.firstName);
  //     if (userProfile.lastName)
  //       formData.append("lastName", userProfile.lastName);
  //     if (userProfile.homeAddress)
  //       formData.append("homeAddress", userProfile.homeAddress);
  //     if (userProfile.profilePicture)
  //       formData.append("profilePicture", userProfile.profilePicture);
  //     if (userProfile.companyName)
  //       if (userProfile.activeRole)
  //         formData.append("activeRole", userProfile.activeRole);
  //     if (userProfile.notificationEnabled !== undefined)
  //       formData.append(
  //         "notificationEnabled",
  //         String(userProfile.notificationEnabled)
  //       );

  //     const response = await updateUserProfile(formData);
  //     if (response) {
  //       set({ isLoading: false });
  //     }
  //   } catch (error: any) {
  //     const { setError } = get();
  //     set({
  //       error: error?.message || "Profile update failed",
  //       isLoading: false,
  //     });
  //   }
  // },

  completeOnboarding: () => {
    set({ isOnboardingComplete: true });
  },

  resetOnboarding: () => {
    set({
      currentStep: 1,
      isOnboardingComplete: false,
      // userProfile: initialUserProfile,
    });
  },
});
