import { current } from "immer";
import {
  LocationObjectCoords,
  LocationGeocodedAddress,
} from "./../node_modules/expo-location/build/Location.types.d";
import { SignUpData, LoginData } from "./auth";
import { UserData } from "./user";
import { OnboardingData } from "./onboarding";
import { SearchResultData } from "./search";
import { Place, PlaceDetails } from "./location";
import {
  LocationObject,
  LocationSubscription,
  LocationGeocodedAddress,
} from "expo-location";
import { ProviderData } from "./provider";

export type PersistedAppState = {
  state: {
    user: UserData | null;
    isAuthenticated: boolean;
  };
};

export type ActiveRole = "Client" | "Provider";

export interface GlobalState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  setSuccess: (success: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  switchRole: ActiveRole;
  setSwitchRole: (role: ActiveRole) => void;
}

export interface AuthState {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  signUp: (userData: SignUpData) => Promise<boolean | undefined>;
  login: (credentials: LoginData) => Promise<boolean | undefined>;
  forgotPassword: (email: string) => Promise<void>;
  verifyPhone: (
    phoneNumber: string,
    code: string
  ) => Promise<boolean | undefined>;
  verifyEmail: (email: string, code: string) => Promise<boolean | undefined>;
  sendCode: (email: string) => Promise<boolean | undefined>;
  resetPassword: (
    password: string,
    email?: string
  ) => Promise<boolean | undefined>;
  changePassword: (
    currentPassword: string,
    password: string
  ) => Promise<boolean | undefined>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export interface UserState {
  // Actions
  updateProfile: (updates: Partial<UserData>) => void;
  updateUserProfile: (data?: FormData) => Promise<boolean | undefined>;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isOnboardingComplete: boolean;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export type ProviderView = "Home" | "Updates" | "Chat" | "Profile";
export type DisplayStyle = "Grid" | "List";
export type SortBy = "Relevance" | "Newest" | "Oldest";

export interface ProviderState {
  currentView: ProviderView;
  setCurrentView: (view: ProviderView) => void;
  displayStyle: DisplayStyle;
  setDisplayStyle: (style: DisplayStyle) => void;
  sortBy: sortByType;
  setSortBy: (sortBy: SortBy) => void;
  searchResults: SearchResultData;
  filteredProviders: ProviderData[];
  setFilteredProviders: (providers: ProviderData[]) => void;
  savedProviders: ProviderData[];
  setSavedProviders: (providers: ProviderData[]) => void;
  setSearchResults: (results: SearchResultData) => void;
  executeSearch: (params: {
    page: number;
    limit: number;
    engine: boolean;
    searchInput?: string;
    lat?: number;
    long?: number;
    address?: string;
    sortBy?: string;
  }) => Promise<boolean | undefined>;
  clearSearchResults: () => void;
}

export interface LocationState {
  currentLocation: (LocationObject & LocationGeocodedAddress) | null;
  liveLocation: LocationObject | null;
  isTracking: boolean;
  watchId: LocationSubscription | null;
  places: Place[];
  locationError: string | null;
  clearLocationError: () => void;
  selectedPlace: PlaceDetails | null;
  getCurrentLocation: () => Promise<
    (LocationObject & LocationGeocodedAddress) | undefined
  >;
  startLiveTracking: () => Promise<void>;
  stopLiveTracking: () => void;
  setSelectedPlace: (place: PlaceDetails) => void;
  searchPlaces: (query: string) => Promise<void>;
  getPlaceDetails: (placeId: string) => Promise<PlaceDetails | undefined>;
}

export type GlobalStore = AuthState &
  GlobalState &
  OnboardingState &
  UserState &
  ProviderState &
  LocationState;
