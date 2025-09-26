import { StateCreator } from "zustand";
import { GlobalStore, MediaState, FileType, MediaSource } from "@/types";
import MediaService from "@/services/MediaService";

export const mediaSlice: StateCreator<GlobalStore, [], [], MediaState> = (
  set,
  get
) => ({
  selectedFiles: [],
  pickMedia: async (
    source: MediaSource,
    pickerOptions = {},
    maxFiles = 1,
    maxSize = 5
  ) => {
    try {
      set({ isLoading: true });
      const files = await MediaService.pickMedia(source, pickerOptions);
      const validation = MediaService.validateFiles(
        files,
        { maxCount: maxFiles - get().selectedFiles.length,
          maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
        }
      );
      if (!validation.valid) {
        console.log("Validation error:", validation.error);
        set({
          error: validation.error || "Invalid files selected",
          isLoading: false,
        });
        return;
      }
      set((state) => ({
        selectedFiles: [...state.selectedFiles, ...files].slice(0, maxFiles),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error?.message || "Failed to pick media",
        isLoading: false,
      });
    }
  },
  removeFile: (uri: string) => {
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((file) => file.uri !== uri),
    }));
  },
  clearFiles: () => {
    set({ selectedFiles: [] });
  },
});
