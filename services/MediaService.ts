import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { FileType, MediaServiceInterface, MediaSource } from "@/types";

class MediaService implements MediaServiceInterface {
  private static instance: MediaService;

  private constructor() {}

  static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  async pickMedia(
    source: MediaSource,
    options: ImagePicker.ImagePickerOptions = {}
  ): Promise<FileType[]> {
    try {
      const hasPermission = await this.hasPermission(source);
      if (!hasPermission) {
        const granted = await this.requestPermission(source);
        if (!granted) {
          throw new Error(`Permission required to access ${source}`);
        }
      }

      let result: ImagePicker.ImagePickerResult;

      if (source === "gallery") {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          quality: 1,
          ...options,
        });
      } else {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          ...options,
        });
      }

      if (result.canceled) {
        return [];
      }

      const files: FileType[] = await Promise.all(
        result.assets.map(async (asset) => {
          const info = await FileSystem.getInfoAsync(asset.uri);
          return {
            uri: asset.uri,
            name: asset.fileName ?? asset.uri.split("/").pop() ?? undefined,
            type: asset.type ?? "image",
            size: info.exists && "size" in info ? info.size : undefined,
          };
        })
      );
      return files;
    } catch (error) {
      console.error("Error picking media:", error);
      throw error;
    }
  }

  async hasPermission(source: MediaSource): Promise<boolean> {
    if (source === "camera") {
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      return cameraStatus.granted;
    } else {
      const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      return galleryStatus.granted;
    }
  }
  async requestPermission(source: MediaSource): Promise<boolean> {
    if (source === "camera") {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      return cameraStatus.granted;
    } else {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return galleryStatus.granted;
    }
  }

  validateFiles(
    files: FileType[],
    maxCount: number = 5,
    maxSize: number = 10 * 1024 * 1024
  ): { valid: boolean; error?: string } {
    if (files.length > maxCount) {
      return { valid: false, error: `Maximum ${maxCount} files allowed` };
    }

    for (const file of files) {
      if (file.size && file.size > maxSize) {
        return {
          valid: false,
          error: `File ${file.name || "unknown"} exceeds maximum size of ${
            maxSize / 1024 / 1024
          }MB`,
        };
      }
    }

    return { valid: true };
  }
}

export default MediaService.getInstance();
