import { ImagePickerOptions } from "expo-image-picker";

export type FileType = {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
};

export type MediaSource = "gallery" | "camera";

export interface MediaServiceInterface {
  pickMedia(
    source: MediaSource,
    options?: ImagePickerOptions
  ): Promise<FileType[]>;
  hasPermission(source: MediaSource): Promise<boolean>;
  requestPermission(source: MediaSource): Promise<boolean>;
  validateFiles(
    files: FileType[],
    maxFile?: number,
    maxSize?: number
  ): { valid: boolean; error?: string };
}

export interface MediaPickerOptions {
  maxFiles?: number;
  maxSize?: number;
}

export interface MediaPickerProps {
  maxFiles?: number;
  maxSize?: number; // in MB
  onFilesChange?: (files: FileType[]) => void;
  initialFiles?: FileType[];
  label?: string;
  classname?: string; // Additional class names for styling
}
