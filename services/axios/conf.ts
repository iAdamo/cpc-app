import axios, { InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import useGlobalStore from "@/store/globalStore";
import Constants from "expo-constants";
import { AxiosError } from "axios";
import { getDeviceId, getSessionId } from "@/utils/device";

const createClient = () => {
  const apiClient = axios.create({
    baseURL: Constants.expoConfig?.extra?.apiUrl || "http://localhost:3333/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Attach token before request
  apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await SecureStore.getItemAsync("accessToken"); // saved after login
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.debug(config.url);
        if (config.url?.startsWith("auth")) {
          const deviceId = await getDeviceId();
          const sessionId = await getSessionId();

          config.headers["x-device-id"] = deviceId;
          config.headers["x-session-id"] = sessionId;
        }
        // console.log(config.headers);
      } catch (err) {
        console.error("Error reading token", err);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle response errors
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      console.log("API error:", error.response.data);
      const { logout, setError } = useGlobalStore.getState();
      if (error.response?.status === 403 || error.response?.status === 401) {
        // token expired or forbidden
        // console.warn("Forbidden - maybe token expired, redirect to login");
        await logout();
      } else if (error.message === "Network Error") {
        setError("Please check your internet connection.");
      } else if (!error.response) {
        console.error("Server is unavailable. Please try again later.");
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
};

export class ApiClientSingleton {
  public axiosInstance: ReturnType<typeof createClient>;
  public static instance: ApiClientSingleton;

  private constructor() {
    this.axiosInstance = createClient();
  }

  public static getInstance(): ApiClientSingleton {
    if (!ApiClientSingleton.instance) {
      ApiClientSingleton.instance = new ApiClientSingleton();
      Object.freeze(ApiClientSingleton.instance);
    }
    return ApiClientSingleton.instance;
  }

  public getAxiosInstance() {
    return this.axiosInstance;
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
    });

    return response.data;
  }
}
