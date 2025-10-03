import { StateCreator } from "zustand";
import * as SecureStore from "expo-secure-store";
import { GlobalStore, AuthState, SignUpData, LoginData } from "@/types";
import {
  signUpUser,
  loginUser,
  forgotPassword,
  verifyEmail,
  verifyPhoneNumber,
  resetPassword,
  sendCode,
  changePassword,
} from "@/axios/auth";
import { th } from "zod/v4/locales";
import { router } from "expo-router";

export const authSlice: StateCreator<GlobalStore, [], [], AuthState> = (
  set,
  get
) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  signUp: async (userData: SignUpData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await signUpUser(userData);
      if (response) {
        set({
          user: response,
          success: "Account created successfully!",
          isAuthenticated: true,
          isLoading: false,
        });
        await SecureStore.setItemAsync("accessToken", response.accessToken);
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Signup failed",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (credentials: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginUser(credentials);
      if (response) {
        await SecureStore.setItemAsync("accessToken", response.accessToken);
        set({
          user: { ...response, accessToken: "" },
          success: "Logged in successfully!",
          isAuthenticated: true,
          isOnboardingComplete: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message || error?.message || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await forgotPassword({ email });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Forgot password failed",
        isLoading: false,
      });
    }
  },

  verifyPhone: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      await verifyPhoneNumber({ code });
      set({ isLoading: false, success: "Phone number verified successfully" });
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message || "Phone number verification failed",
        isLoading: false,
      });
    }
  },

  verifyEmail: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      await verifyEmail({ code });
      set({ isLoading: false, success: "Email verified successfully" });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || "Email verification failed",
      });
      throw error;
    }
  },

  sendCode: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!email) {
        set({ error: "Email not found", isLoading: false });
        return;
      }
      await sendCode({ email });
      set({ isLoading: false, success: "Verification code sent" });
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message || "Failed to send verification code",
        isLoading: false,
      });
    }
  },

  resetPassword: async (password: string, email?: string) => {
    set({ isLoading: true, error: null });
    try {
      if (
        await resetPassword({ email: email || get().user!.email, password })
      ) {
        set({ isLoading: false, success: "Password reset successfull!" });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Reset password failed",
        isLoading: false,
      });
    }
  },

  changePassword: async (currentPassword: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await changePassword({ currentPassword, password });
      if (response) {
        set({ isLoading: false, success: "Password Change successfull!" });
      }
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Password change failed",
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      currentStep: 1,
      currentView: "Home",
      displayStyle: "Grid",
      currentLocation: null,
      switchRole: "Client",
      paramsFrom: null,
    });
    await SecureStore.deleteItemAsync("accessToken");
    router.replace("/");
  },
});
