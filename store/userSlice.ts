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
  availability: "offline",
  isFollowing: false,
  otherUser: null,
  setAvailability: async (status: string) => {
    const presence = await updateAvailability(status);
    set({ availability: presence.availability });
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
    set({ error: null });
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
      //       // const response = await toggleFollowProvider(providerId);
      // if (response) {
      //   // console.log("Follow toggle response:", response);
      //   const currentUser = get().user;
      //   const isSelf = currentUser && response._id === currentUser._id;
      //   const updateObj = {
      //     isFollowing: response.followedProviders.some(
      //       (p) => p._id === providerId
      //     ),
      //     info: response.followedProviders.some((p) => p._id === providerId)
      //       ? "Started following provider"
      //       : "Unfollowed provider",
      //     isLoading: false,
      //   };
      //   if (isSelf) {
      //     set({
      //       user: { ...response },
      //       ...updateObj,
      //     });
      //   } else {
      //     set({
      //       otherUser: { ...response },
      //       ...updateObj,
      //     });
      //   }
      // }
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message || "Failed to update follow status",
      });
      throw error;
    }
  },
});
