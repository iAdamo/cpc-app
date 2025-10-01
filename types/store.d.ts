import { updateProviderProfile } from "./../axios/user";
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
import { ServiceCategory, Subcategory, ServiceData } from "./service";
import { FileType, MediaSource, MediaPickerOptions } from "./media";

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
  paramsFrom: string | null;
  setParamsFrom: (params: string | null) => void;
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
  changePassword: (currentPassword: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export interface UserState {
  otherUser: UserData | null;
  setOtherUser: (user: UserData | null) => void;
  updateProfile: (updates: Partial<UserData>) => void;
  updateUserProfile: (role: ActiveRole, data?: FormData) => Promise<void>;
  fetchUserProfile: (userId?: string) => Promise<void>;
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
  setSavedProviders: (providerId: string) => Promise<ProviderData[] | void>;
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
  }) => Promise<void>;
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

export interface ServiceState {
  availableCategories: ServiceCategory[];
  setAvailableCategories: (categories: ServiceCategory[]) => void;
  selectedServices: Subcategory[];
  setSelectedServices: (services: Subcategory[]) => void;
  fetchServiceById: (serviceId: string) => Promise<ServiceData | void>;
  fetchServicesByProvider: (
    providerId: string
  ) => Promise<ServiceData[] | void>;
  MyProjects: ServiceData[];
  setMyProjects: (projects: ServiceData[]) => void;
  createService: (data: FormData) => Promise<ServiceData | void>;
  updateService: (id: string, data: FormData) => Promise<ServiceData | void>;
  handleToggleActive: (service: ServiceData) => Promise<void>;
  OtherProjects: ServiceData[];
  setOtherProjects: (projects: ServiceData[]) => void;
  draftProjects: ServiceData[];
  setDraftProjects: (projects: ServiceData[]) => void;
  // deleteService: (id: string) => Promise<void>;
}
export interface MediaState {
  selectedFiles: FileType[];
  pickMedia: (
    source: MediaSource,
    options?: any,
    maxFiles?: number,
    maxSize?: number
  ) => Promise<void>;
  removeFile: (uri: string) => void;
  clearFiles: () => void;
}

export type GlobalStore = AuthState &
  GlobalState &
  OnboardingState &
  UserState &
  ProviderState &
  LocationState &
  ServiceState &
  MediaState;
