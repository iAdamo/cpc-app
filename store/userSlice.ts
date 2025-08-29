import { UserData } from "./../types/user";
import { updateUserProfile } from "./../axios/user";
import { StateCreator } from "zustand";
import {
  GlobalStore,
  AuthState,
  SignUpData,
  LoginData,
  UserState,
} from "@/types";

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
          set({ user: response, isLoading: false });
          return true;
        }
      }
      const { user } = get();
      const formData = new FormData();
      if (user)
        Object.entries(user).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !(typeof value === "object" && Object.keys(value).length === 0)
          ) {
            // Convert boolean to string for FormData
            if (typeof value === "boolean") {
              formData.append(key, String(value));
            } else {
              formData.append(key, value as any);
            }
          }
        });

      const response = await updateUserProfile(formData);
      if (response) {
        set({ user: response, isLoading: false });
        return true;
      }
    } catch (error: any) {
      set({
        error: error?.response.data.message || "Profile update failed",
        isLoading: false,
      });
    }
  },
});
