import { CompanyData } from "./company";

export interface UserData {
  id: string;
  _id: string;
  accessToken: string;
  firstName?: string;
  lastName?: string;
  activeRole: "Client" | "Company" | "Admin";
  email: string;
  language: string;
  emailEditCount: number;
  phoneNumber: string;
  phoneEditCount: number;
  profilePicture?: string;
  purchasedServices: any[];
  createdAt: string;
  updatedAt: string;
  activeRoleId?: Partial<CompanyData>;
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
  hiredCompanies: CompanyData[];
  owner: string;
}
