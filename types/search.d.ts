import { ProviderData } from "./provider";
import { ServiceData } from "./service";
import { JobData } from "./service";

export interface SearchResultData {
  providers: ProviderData[];
  services: ServiceData[];
  jobs: JobData[];
};
