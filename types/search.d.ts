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

export interface MediaVideoItem {
  type: "video";
  video: {
    type: string;
    url: string;
    thumbnail?: string | null;
    index?: number;
    [key: string]: any;
  };
  provider: ProviderData;
}

export interface MediaAdItem {
  type: "ad";
  provider: ProviderData
}

export type MediaFeedItem = MediaVideoItem | MediaAdItem;

export interface MediaFeedResponse {
  items: MediaFeedItem[];
  page: number;
  hasMore: boolean;
}
