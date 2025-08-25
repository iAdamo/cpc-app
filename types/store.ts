import { updateUserProfile } from './../axios/user';
import { SignUpData, LoginData } from "./auth";
import { UserData } from "./user";
import { OnboardingData } from "./onboarding";


export type PersistedAppState = {
  user: UserData | null;
  isAuthenticated: boolean;
};

export interface GlobalState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  setSuccess: (success: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  signUp: (userData: SignUpData) => Promise<void>;
  login: (credentials: LoginData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  sendCode: (email: string) => Promise<void>;
  resetPassword: (password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isOnboardingComplete: boolean;
  userProfile: OnboardingData;
  setCurrentStep: (step: number) => void;
  updateProfile: (updates: Partial<OnboardingData>) => void;
  updateUserProfile: () => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export type GlobalStore = AuthState & GlobalState & OnboardingState;
