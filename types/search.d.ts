import { ProviderData } from "./provider";
import { ServiceData } from "./service";
import { JobData } from "./service";

export interface SearchResultData {
  providers: ProviderData[];
  services: ServiceData[];
  jobs: JobData[];
  // pagination metadata returned by the backend
  page?: number;
  totalPages?: number;
}
