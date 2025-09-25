import { ImagePickerOptions } from "expo-image-picker";

export type FileType = {
  uri: string;
  name?: string;
  type?: "image" | "video";
  size?: number;
  duration?: number; // in seconds, for videos
  width?: number; // in pixels, for images
  height?: number; // in pixels, for images
};

export type MediaSource = "gallery" | "camera";
// export type MediaType = "images" | "videos" | "livePhoto" | "pairedVideo";

export interface ValidationConstraints {
  maxCount?: number;
  maxSize?: number;
  maxDuration?: number; // Video-specific constraint (in seconds)
  allowedTypes?: ("image" | "video")[]; // New constraint for allowed media types
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface MediaServiceInterface {
  pickMedia(
    source: MediaSource,
    options?: ImagePickerOptions
  ): Promise<FileType[]>;
  hasPermission(source: MediaSource): Promise<boolean>;
  requestPermission(source: MediaSource): Promise<boolean>;
  validateFiles(
    files: FileType[],
    constraints?: ValidationConstraints
  ): ValidationResult;
}

// export interface MediaPickerOptions {
//   maxFiles?: number;
//   maxSize?: number;
//   mediaTypes?: MediaType;
//   allowsMultipleSelection?: boolean;
//   quality?: number;
//   videoMaxDuration?: number;
//   videoQuality?: "low" | "medium" | "high";
// }

export interface MediaPickerProps {
  maxFiles?: number;
  maxSize?: number; // in MB
  onFilesChange?: (files: FileType[]) => void;
  allowedTypes?: ("image" | "video")[]; // New prop to specify allowed types
  initialFiles?: FileType[];
  label?: string;
  classname?: string; // Additional class names for styling
}
