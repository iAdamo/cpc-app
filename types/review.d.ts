import { CompanyData } from "@/types";
import UserData from "./user";

export interface ReviewData {
  _id: string;
  description: string;
  rating: number;
  images: string[];
  status: "pending" | "approved" | "rejected";
  helpfulVotes: string[];
  providerReply?: string;
  tags: string[];
  isDeleted: boolean;
  user: UserData;
  provider: CompanyData;
  service: string;
  createdAt: string;
}
