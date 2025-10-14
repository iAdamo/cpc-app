import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import {
  FileType,
  MediaPickerProps,
  MediaServiceInterface,
  MediaSource,
  ValidationConstraints,
  ValidationResult,
} from "@/types";

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

      const mediaTypes = options.mediaTypes || "images";
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: options.mediaTypes,
        allowsMultipleSelection: options.allowsMultipleSelection ?? true,
        quality: options.quality ?? (mediaTypes === "videos" ? undefined : 1),
        videoMaxDuration: options.videoMaxDuration ?? 60,
        ...options,
      };

      if (source === "gallery") {
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
        // console.log("Picked from gallery:", result);
      } else {
        result = await ImagePicker.launchCameraAsync(pickerOptions);
      }

      if (result.canceled) {
        return [];
      }

      const files: FileType[] = await Promise.all(
        result.assets.map(async (asset) => {
          // console.log("Processing asset:", asset);
          // For iOS, we might need to fetch additional info using FileSystem
          // For simplicity, we'll assume asset contains all necessary info
          // In a real-world scenario, consider using FileSystem.getInfoAsync(asset.uri)
          let fileInfo: FileSystem.FileInfo | null = null;
          try {
            fileInfo = await FileSystem.getInfoAsync(asset.uri, { size: true });
            console.log("File info:", fileInfo);
          } catch (e) {
            console.warn("Failed to get file info:", e);
          }
          return {
            uri: asset.uri,
            name: asset.fileName || asset.uri.split("/").pop() || "unknown",
            type: asset.type as FileType["type"],
            size:
              fileInfo && "size" in fileInfo
                ? (fileInfo as any).size
                : asset.fileSize,
            duration: asset.duration != null ? asset.duration : undefined, // in seconds, for videos
            width: asset.width, // in pixels, for images
            height: asset.height, // in pixels, for images
          };
        })
      );
      // return {
      //       uri: asset.uri,
      //       name: asset.fileName ?? asset.uri.split("/").pop() ?? undefined,
      //       type: asset.type as "image" | "video",
      //       size: asset.fileSize,
      //       width: asset.width,
      //       height: asset.height,
      //       duration: asset.duration ? Math.round(asset.duration) : undefined,
      //     };
      //   })
      // );
      // // console.log("Processed files:", files);
      // return files;
      return files;
    } catch (error) {
      console.error("Error picking media:", error);
      throw error;
    }
  }

  async pickDocument(
    options: DocumentPicker.DocumentPickerOptions
  ): Promise<FileType[]> {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "application/rtf",
      ],
      multiple: options.multiple || false,
      copyToCacheDirectory: options.copyToCacheDirectory || true,
      ...options,
    });
    if (result.canceled) {
      return [];
    }
    const files = Array.isArray(result.assets)
      ? result.assets
      : [result.assets];
    return files.map((file) => ({
      uri: file.uri,
      name: file.name,
      type: file.mimeType as FileType["type"],
      size: file.size,
    }));
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
    constraints: ValidationConstraints = {}
  ): ValidationResult {
    const {
      maxCount = 5,
      maxSize = 10 * 1024 * 1024,
      maxDuration,
      allowedTypes = ["image", "video"],
    } = constraints;

    if (files.length > maxCount) {
      return {
        valid: false,
        error: `Too many files selected. Maximum allowed: ${maxCount}`,
      };
    }

    const invalidTypeFiles = files.filter(
      (file) => !file.type || !allowedTypes.includes(file.type)
    );

    if (invalidTypeFiles.length > 0) {
      const invalidTypes = [...new Set(invalidTypeFiles.map((f) => f.type))];
      return {
        valid: false,
        error: `Invalid file type${
          invalidTypes.length > 1 ? "s" : ""
        }: ${invalidTypes.join(", ")}. Please select ${allowedTypes.join(
          " or "
        )} files only.`,
      };
    }

    // Size validation with better formatting
    for (const file of files) {
      if (file.size && file.size > maxSize) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
        return {
          valid: false,
          error: `"${
            file.name || "File"
          }" is too large (${fileSizeMB}MB). Maximum size: ${maxSizeMB}MB`,
        };
      }
    }

    // Duration validation
    if (maxDuration !== undefined) {
      const longVideos = files.filter(
        (file) =>
          file.type === "video" && file.duration && file.duration > maxDuration
      );

      if (longVideos.length > 0) {
        const formatDuration = (seconds: number) => {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins}:${secs.toString().padStart(2, "0")}`;
        };

        return {
          valid: false,
          error: `Video${longVideos.length > 1 ? "s" : ""} exceed${
            longVideos.length > 1 ? "" : "s"
          } the maximum duration of ${formatDuration(maxDuration)}`,
        };
      }
    }

    return { valid: true };
  }
}

export default MediaService.getInstance();
