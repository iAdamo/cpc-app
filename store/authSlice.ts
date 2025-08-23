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

export const authSlice: StateCreator<
  GlobalStore,
  [],
  [],
  AuthState
> = (set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  signUp: async (userData: SignUpData) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("email", userData.email);
      formData.append("password", userData.password);

      const response = await signUpUser(formData);
      if (response) {
        await sendCode({ email: userData.email });
        set({
          user: response,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
        await SecureStore.setItemAsync("accessToken", response.token);
      }
    } catch (error: any) {
      set({ error: error?.message || "Signup failed", isLoading: false });
    }
  },

  login: async (credentials: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginUser(credentials);
      if (response) {
        set({
          user: response,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
        await SecureStore.setItemAsync("accessToken", response.token);
      }
    } catch (error: any) {
      set({ error: error?.message || "Login failed", isLoading: false });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await forgotPassword({ email });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error?.message || "Forgot password failed",
        isLoading: false,
      });
    }
  },

  verifyPhone: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      await verifyPhoneNumber({ code });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error?.message || "Phone number verification failed",
        isLoading: false,
      });
    }
  },

  verifyEmail: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      await verifyEmail({ code });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error?.message || "Email verification failed",
        isLoading: false,
      });
    }
  },

  sendCode: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await sendCode({ email });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error?.message || "Failed to send verification code",
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
        error: error?.message || "Reset password failed",
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({ user: null, token: null, isAuthenticated: false, error: null });
    await SecureStore.deleteItemAsync("accessToken");
  },

  clearError: () => set({ error: null }),
});
