import { updateAvailability } from "./../services/axios/chat";
import { updateProviderProfile } from "../services/axios/user";
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
import { ServiceCategory, Subcategory, ServiceData, JobData } from "./service";
import { FileType, MediaSource, MediaPickerOptions } from "./media";
import { Chat, Message, LastMessage } from "./chat";

export type PersistedAppState = {
  state: {
    user: UserData | null;
    isAuthenticated: boolean;
  };
};

export type ActiveRole = "Client" | "Provider";

export interface GlobalState {
  currentView: ProviderView;
  setCurrentView: (view: ProviderView) => void;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  info: string | null;
  setInfo: (info: string | null) => void;
  setSuccess: (success: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  switchRole: ActiveRole;
  setSwitchRole: (role: ActiveRole) => void;
  paramsFrom: string | null;
  setParamsFrom: (params: string | null) => void;
  clearInfo: () => void;
  clearSuccess: () => void;
  clearError: () => void;
  progress: number;
  setProgress: (progress: number) => void;
}

export interface AuthState {
  user: UserData | null;
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
}

export type Status = "available" | "offline" | "busy" | "away";

export type PresenceStatus =
  (typeof PRESENCE_STATUS)[keyof typeof PRESENCE_STATUS];

export interface PresenceResponse {
  userId?: string;
  status?: PresenceStatus;
  lastSeen?: Date;
  customStatus?: PresenceStatus;
  isOnline?: boolean;
  deviceId?: string;
}

export interface UserState {
  availability: PresenceResponse | null;
  otherAvailability: PresenceResponse | null;
  isFollowing: boolean;
  otherUser: UserData | null;
  setOtherUser: (user: UserData | null) => void;
  setAvailability: (availability: PresenceResponse) => void;
  setOtherAvailability: (availability: PresenceResponse) => void;
  updateProfile: (updates: Partial<UserData>) => void;
  updateUserProfile: (role: ActiveRole, data?: FormData) => Promise<void>;
  fetchUserProfile: (userId?: string) => Promise<void>;
  toggleFollow: (providerId: string) => Promise<void>;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isOnboardingComplete: boolean;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  onboardingData: { [key: string]: any };
  setOnboardingData: (data: { [key: string]: any }) => void;
}

export type LayoutView =
  | "Home"
  | "Updates"
  | "Chat"
  | "Profile"
  | "Map"
  | "Job-Post";
export type DisplayStyle = "Grid" | "List";
export type SortBy =
  | "Relevance"
  | "Newest"
  | "Oldest"
  | "Location"
  | "Top Rated"
  | "Most Reviewed";

export interface ProviderState {
  isSearching: boolean;
  displayStyle: DisplayStyle;
  setDisplayStyle: (style: DisplayStyle) => void;
  sortBy: sortByType;
  categories: string[];
  setCategories: (categories: string[]) => void;
  setSortBy: (sortBy: SortBy) => void;
  searchResults: SearchResultData;
  filteredProviders: ProviderData[];
  setFilteredProviders: (providers: ProviderData[]) => void;
  savedProviders: ProviderData[];
  savedJobs: JobData[];
  setSavedJobs: (job: JobData) => void;
  setSavedProviders: (providerId: string) => Promise<ProviderData[] | void>;
  setSearchResults: (results: SearchResultData) => void;
  executeSearch: (params: {
    model: "providers" | "services" | "jobs";
    page: number;
    limit: number;
    engine: boolean;
    searchInput?: string;
    lat?: number;
    long?: number;
    address?: string;
    sortBy?: string;
    categories?: string[];
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
  draftJobs: JobData[];
  setDraftProjects: (projects: ServiceData[]) => void;
  setDraftJobs: (projects: JobData[]) => void;
  removeDraftJob: (id: string) => void;
  cachedJobs: JobData[];
  setCachedJobs: (jobs: JobData[]) => void;
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
  pickDocument: () => void;
  removeLocalFile: (uri: string) => void;
  removeServerFiles: (fileUrls: string[]) => Promise<void>;
  clearFiles: () => void;
}

export interface ChatState {
  chats: Chat[];
  filteredChats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  currentPage: number;
  nextCursor: Date | null;
  chatLoading: boolean;
  chatError: string | null;
  createChat: (
    participantIds: string,
    isGroup?: boolean,
    groupInfo?: Partial<Chat["groupInfo"]>
  ) => Promise<void>;
  fetchChats: () => Promise<void>;
  sendTextMessage: (text: string, replyTo?: string) => Promise<void>;
  sendMediaMessage: (
    type: Message["type"],
    file: any,
    options?: any,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
  loadMessages: (cursor?: Date) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  addNewMessage: (message: Message) => void;
  replaceTempMessage: (chatId: string, message: Message) => void;
  clearMessages: () => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  markAsDelivered: () => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  typingUsers: string[];
  hasMoreMessages: boolean;
  setFilteredChats: (chats: Chat[]) => void;
}

export type GlobalStore = AuthState &
  GlobalState &
  OnboardingState &
  UserState &
  ProviderState &
  LocationState &
  ServiceState &
  MediaState &
  ChatState;
