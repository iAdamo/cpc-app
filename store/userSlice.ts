import { UserData } from "./../types/user";
import { updateUserProfile, setUserFavourites } from "./../axios/user";
import { StateCreator } from "zustand";
import {
  GlobalStore,
  AuthState,
  SignUpData,
  LoginData,
  UserState,
} from "@/types";
import appendFormData from "@/utils/AppendFormData";

export const userSlice: StateCreator<GlobalStore, [], [], UserState> = (
  set,
  get
) => ({
  // Action to directly update user state
  updateProfile: (updates: Partial<UserData>) => {
    set((state) => ({
      user: { ...state.user, ...updates } as GlobalStore["user"],
    }));
  },

  // Action to update user profile via API
  updateUserProfile: async (data?: FormData) => {
    set({ isLoading: true, error: null });
    try {
      if (data) {
        const response = await updateUserProfile(data);
        if (response) {
          set({ user: { ...response }, isLoading: false });
        }
      }
      const { user } = get();
      const formData = new FormData();
      if (user)   appendFormData(formData, user.activeRoleId);

      // print the formData contents for debugging
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      //const response = await updateUserProfile(formData);
      // if (response) {
      //   set({ user: response, isLoading: false });
      // }
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Profile update failed",
        isLoading: false,
      });
    }
  },
});
