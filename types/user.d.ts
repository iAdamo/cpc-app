import { ProviderData } from "./provider";


export interface MediaItem {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  index?: number;
}

export interface UserData {
  id: string;
  _id: string;
  accessToken: string;
  firstName: string;
  lastName: string;
  activeRole: "Client" | "Provider";
  email: string;
  homeAddress: string;
  language: string;
  emailEditCount: number;
  phoneNumber: string;
  followingCount: number;
  followedProviders: ProviderData[];
  phoneEditCount: number;
  profilePicture?: MediaItem;
  purchasedServices: any[];
  createdAt: string;
  updatedAt: string;
  activeRoleId?: Partial<ProviderData>;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  clients: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
  }[];
  hiredCompanies: ProviderData[];
  owner: string;
}

export type EditableFields = keyof UserData | keyof ProviderData;
