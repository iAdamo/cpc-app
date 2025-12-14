import { UserData, ActiveRole, PresenceResponse } from "@/types";
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
  Status,
} from "@/types";
import appendFormData from "@/utils/AppendFormData";
import chatService from "@/services/chatService";
import { updateAvailability } from "@/services/axios/chat";
import { socketService, PresenceEvents } from "@/services/socketService";

export const userSlice: StateCreator<GlobalStore, [], [], UserState> = (
  set,
  get
) => ({
  availability: null,
  otherAvailability: null,
  isFollowing: false,
  otherUser: null,
  setAvailability: (data: Partial<PresenceResponse>) => {
    set((state) => ({
      availability: {
        ...state.availability,
        ...data,
      },
    }));
  },
  setOtherAvailability: (data: Partial<PresenceResponse>) => {
    set((state) => ({
      otherAvailability: {
        ...state.otherAvailability,
        ...data,
      },
    }));
  },

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
            // console.debug("Submitting formData:", Array.from(formData.entries()));
            response = await createProviderProfile(formData);
          }
        }
      }
      // console.log("Profile update response:", response);
      if (response) {
        // console.log("Updated user profile:", response);
        set({
          user: { ...response },
          switchRole: response.activeRole,
          selectedFiles: [],
          isLoading: false,
          success: role === "Client" ? "" : "Profile updated successfully!",
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
    set({ error: null, isLoading: true });
    try {
      const response = await getUserProfile(userId);
      // console.log("fetched user", response);
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
          otherUser: { ...response },
          isLoading: false,
        });
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to fetch user profile",
      });
    }
  },
  toggleFollow: async (providerId: string) => {
    set({ error: null });
    try {
      socketService.emitEvent(PresenceEvents.SUBSCRIBE, {
        userIds: [providerId],
      });
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message || "Failed to update follow status",
      });
      throw error;
    }
  },
});
