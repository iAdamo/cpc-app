export interface OnboardingData {
  role: string;
  firstName: string;
  lastName: string;
  profilePicture: File | null;
  companyName: string;
  companyDescription: string;
  companyEmail: string;
  companyPhoneNumber: string;
  companyAddress: string;
  companyImages: File[] | null;
  notificationEnabled: boolean;
  zip: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy?: "exact" | "approximate" | "manual";
  state: string;
  country: string;
  address?: string;
  selectedServices?: {
    category: string;
    subcategories?: string[];
  };
  subcategories?: Subcategory[];
  availableCategories?: ServiceCategory[];
}
