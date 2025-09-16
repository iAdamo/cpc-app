import { UserData, ActiveRole } from "@/types";
import {
  updateUserProfile,
  setUserFavourites,
  updateProviderProfile,
} from "@/axios/user";
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
  updateUserProfile: async (role: ActiveRole, data?: FormData) => {
    set({ isLoading: true, error: null });
    try {
      let response;

      if (data) {
        if (role === "Client") {
          response = await updateUserProfile(data);
        } else {
          response = await updateProviderProfile(data);
        }
      } else {
        const { user } = get();
        const formData = new FormData();
        if (user) {
          if (role === "Client") {
            appendFormData(formData, user);
            response = await updateUserProfile(formData);
          } else {
            appendFormData(formData, user.activeRoleId);
            // for deugging only
            // console.log("Submitting formData:", Array.from(formData.entries()));
            response = await updateProviderProfile(formData);
          }
        }
      }
      if (response) {
        set({
          user: { ...response },
          switchRole: response.activeRole,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Profile update failed",
        isLoading: false,
      });
    }
  },
});
