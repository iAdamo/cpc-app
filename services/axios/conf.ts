// api/apiClient.ts
import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import * as SecureStore from "expo-secure-store";
import useGlobalStore from "@/store/globalStore";
import Constants from "expo-constants";
import { getDeviceId, getSessionId } from "@/utils/device";

interface PendingRequest {
  config: InternalAxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  retryCount: number;
  maxRetries: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const createClient = () => {
  const apiClient = axios.create({
    baseURL: Constants.expoConfig?.extra?.apiUrl || "http://localhost:3333/api",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

  apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.debug("API Request:", config.method?.toUpperCase(), config.url);

        if (config.url?.startsWith("auth")) {
          const deviceId = await getDeviceId();
          const sessionId = await getSessionId();

          config.headers["x-device-id"] = deviceId;
          config.headers["x-session-id"] = sessionId;
        }
      } catch (err) {
        console.error("Error reading token", err);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return apiClient;
};

export class ApiClientSingleton {
  private _axiosInstance: ReturnType<typeof createClient>;
  private _pendingRequests: PendingRequest[] = [];
  private _isRetrying = false;
  private _retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private static _instance: ApiClientSingleton | null = null;

  private constructor() {
    this._axiosInstance = createClient();
    this.setupResponseInterceptor();
  }

  // Use getter methods instead of public properties
  public get axiosInstance() {
    return this._axiosInstance;
  }

  private get pendingRequests() {
    return this._pendingRequests;
  }

  private set pendingRequests(requests: PendingRequest[]) {
    this._pendingRequests = requests;
  }

  private get isRetrying() {
    return this._isRetrying;
  }

  private set isRetrying(value: boolean) {
    this._isRetrying = value;
  }

  private get retryTimeout() {
    return this._retryTimeout;
  }

  private set retryTimeout(value: ReturnType<typeof setTimeout> | null) {
    if (this._retryTimeout) {
      clearTimeout(this._retryTimeout);
    }
    this._retryTimeout = value;
  }

  private setupResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        console.log("Error", error?.response?.data);
        const { logout, setNetworkError, addFailedRequest } =
          useGlobalStore.getState();
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 403 || error.response?.status === 401) {
          await logout();
          return Promise.reject(error);
        }

        if (error.message === "Network Error" || !error.response) {
          console.error("Network Error detected:", error.message);
          setNetworkError(true);

          if (!originalRequest?._retry) {
            return new Promise((resolve, reject) => {
              const pendingRequest: PendingRequest = {
                config:
                  originalRequest ||
                  (error.config as InternalAxiosRequestConfig),
                resolve,
                reject,
                retryCount: 0,
                maxRetries: MAX_RETRIES,
              };

              addFailedRequest({
                config: pendingRequest.config,
                resolve: pendingRequest.resolve,
                reject: pendingRequest.reject,
                timestamp: Date.now(),
              });

              this.pendingRequests = [...this.pendingRequests, pendingRequest];

              if (!this.isRetrying) {
                this.scheduleRetry();
              }
            });
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private scheduleRetry() {
    this.retryTimeout = setTimeout(() => {
      this.retryPendingRequests();
    }, RETRY_DELAY_MS);
  }

  private async retryPendingRequests() {
    if (this.pendingRequests.length === 0 || this.isRetrying) {
      return;
    }

    this.isRetrying = true;
    console.log(`Retrying ${this.pendingRequests.length} pending requests...`);

    const requestsToRetry = [...this.pendingRequests];
    this.pendingRequests = [];

    for (const request of requestsToRetry) {
      try {
        if (request.retryCount < request.maxRetries) {
          request.retryCount++;

          const retryConfig = {
            ...request.config,
            _retry: true,
          };

          console.log(
            `Retry attempt ${request.retryCount}/${request.maxRetries} for:`,
            request.config.url
          );

          const response = await this.axiosInstance.request(retryConfig);
          request.resolve(response);
        } else {
          console.log(`Max retries reached for:`, request.config.url);
          request.reject(
            new Error(`Max retries (${request.maxRetries}) exceeded`)
          );
        }
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.message === "Network Error" || !error.response)
        ) {
          if (request.retryCount < request.maxRetries) {
            this.pendingRequests = [...this.pendingRequests, request];
          } else {
            request.reject(error);
          }
        } else {
          request.reject(error);
        }
      }
    }

    this.isRetrying = false;

    if (this.pendingRequests.length > 0) {
      this.scheduleRetry();
    } else {
      const { setNetworkError } = useGlobalStore.getState();
      setNetworkError(false);
    }
  }

  public async manualRetry() {
    const { clearFailedRequests } = useGlobalStore.getState();
    clearFailedRequests();

    if (this.pendingRequests.length > 0) {
      await this.retryPendingRequests();
    }

    const { setNetworkError } = useGlobalStore.getState();
    setNetworkError(false);
  }

  public getPendingRequestCount(): number {
    return this.pendingRequests.length;
  }

  public clearAllPendingRequests() {
    this.pendingRequests.forEach((request) => {
      request.reject(new Error("Request cancelled due to network error"));
    });
    this.pendingRequests = [];
    this.retryTimeout = null;
  }

  // Singleton pattern without freezing
  public static getInstance(): ApiClientSingleton {
    if (!ApiClientSingleton._instance) {
      ApiClientSingleton._instance = new ApiClientSingleton();
      // REMOVED: Object.freeze(ApiClientSingleton.instance);
    }
    return ApiClientSingleton._instance;
  }

  // Alternative: reset instance (useful for testing)
  public static resetInstance() {
    if (ApiClientSingleton._instance) {
      ApiClientSingleton._instance.clearAllPendingRequests();
      ApiClientSingleton._instance = null;
    }
  }

  public async uploadFile(
    url: string,
    file: FormData,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const response = await this.axiosInstance.post(url, file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (ProgressEvent) => {
        if (onProgress && ProgressEvent.total) {
          const progress = Math.min(
            (ProgressEvent.loaded / ProgressEvent.total) * 100,
            100
          );
          onProgress(Math.round(progress));
        }
      },
      timeout: 30000,
    });

    return response.data;
  }
}

// Export a convenient instance getter
export const apiClient = ApiClientSingleton.getInstance();
