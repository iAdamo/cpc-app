import { ProviderData } from "./provider";
import { ServiceData } from "./service";

export interface SearchResultData {
  providers: ProviderData[];
  services: ServiceData[];
};
