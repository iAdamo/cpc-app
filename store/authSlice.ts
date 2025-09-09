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
} from "@/axios/auth";

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
        return true;
      }
    } catch (error: any) {
      set({
        error: error?.response.data.message || "Signup failed",
        isLoading: false,
      });
    }
  },

  login: async (credentials: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginUser(credentials);
      if (response) {
        set({
          user: response,
          success: "Logged in successfully!",
          isAuthenticated: true,
          isOnboardingComplete: true,
          isLoading: false,
        });
        await SecureStore.setItemAsync("accessToken", response.accessToken);
        return true;
      }
    } catch (error: any) {
      set({
        error: error?.response.data.message || "Login failed",
        isLoading: false,
      });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await forgotPassword({ email });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error?.response.data.message || "Forgot password failed",
        isLoading: false,
      });
    }
  },

  verifyPhone: async (phoneNumber: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      await verifyPhoneNumber({ phoneNumber, code });
      set({ isLoading: false, success: "Phone number verified successfully" });
      return true;
    } catch (error: any) {
      set({
        error:
          error?.response.data.message || "Phone number verification failed",
        isLoading: false,
      });
    }
  },

  verifyEmail: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      await verifyEmail({ email, code });
      set({ isLoading: false, success: "Email verified successfully" });
      return true;
    } catch (error: any) {
      set({
        error: error?.response.data.message || "Email verification failed",
        isLoading: false,
      });
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
      return true;
    } catch (error: any) {
      set({
        error:
          error?.response.data.message || "Failed to send verification code",
        isLoading: false,
      });
    }
  },

  resetPassword: async (password: string, email?: string) => {
    set({ isLoading: true, error: null });
    try {
      await resetPassword({ email: email || get().user!.email, password });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error?.response.data.message || "Reset password failed",
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      success: "Logged out successfully",
    });
    await SecureStore.deleteItemAsync("accessToken");
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),
});
