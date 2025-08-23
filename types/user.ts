import { CompanyData } from "./company";

export interface UserData {
  id: string;
  _id: string;
  token: string;
  username: string;
  firstName?: string;
  lastName?: string;
  activeRole: "Client" | "Company" | "Admin";
  email: string;
  phoneNumber: string;
  profilePicture?: string;
  purchasedServices: any[];
  admins: any[];
  createdAt: string;
  activeRoleId?: CompanyData;
  verified: boolean;
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
