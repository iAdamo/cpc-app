import { SignUpData, LoginData } from "./auth";
import { UserData } from "./user";

export interface GlobalState {
  isLoading: boolean;
  error: string | null;
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

export type GlobalStore = AuthState & GlobalState;
