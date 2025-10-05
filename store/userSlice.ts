import { UserData, ActiveRole } from "@/types";
import {
  updateUserProfile,
  setUserFavourites,
  updateProviderProfile,
  createProviderProfile,
  getUserProfile,
  toggleFollowProvider,
} from "@/services/axios/user";
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
  isAvailable: true,
  isFollowing: false,
  otherUser: null,
  setAvailability: (available: boolean) => set({ isAvailable: available }),
  setOtherUser: (user: UserData | null) => set({ otherUser: user }),
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
        // console.log("Submitting formData:", Array.from(data.entries()));

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
            appendFormData(formData, user?.activeRoleId);
            // for deugging only
            // console.log("Submitting formData:", Array.from(formData.entries()));
            response = await createProviderProfile(formData);
          }
        }
      }
      // console.log("Profile update response:", response);
      if (response) {
        set({
          user: { ...response },
          switchRole: !data ? response.activeRole : get().switchRole,
          isLoading: false,
          success: "Profile updated successfully!",
        });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Profile update failed",
        isLoading: false,
      });
      throw error;
    }
  },
  fetchUserProfile: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUserProfile(userId);
      if (response) {
        if (get().user && get().user?._id === response._id) {
          // If fetching own profile, update the user state
          set({
            user: { ...response },
            switchRole: response.activeRole,
            isLoading: false,
          });
          return;
        }
        set({
          user: { ...response },
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to fetch user profile",
        isLoading: false,
      });
    }
  },
  toggleFollow: async (providerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await toggleFollowProvider(providerId);
      // check if providerId is in user's following list
      if (response) {
        console.log("Follow toggle response:", response);
        if (response.followedProviders.some((p) => p._id === providerId)) {
          set({
            user: { ...response },
            isFollowing: true,
            info: "Started following provider",
            isLoading: false,
          });
        } else {
          set({
            user: { ...response },
            isFollowing: false,
            info: "Unfollowed provider",
            isLoading: false,
          });
        }
      }
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message || "Failed to update follow status",
        isLoading: false,
      });
      throw error;
    }
  },
});
