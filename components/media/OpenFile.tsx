import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

const openFile = async (url: string) => {
  try {
    if (!FileSystem.cacheDirectory) {
      throw new Error("Cache directory is not available.");
    }
    const fileUri = FileSystem.cacheDirectory + url.split("/").pop();
    console.log("Downloading file to:", fileUri);
    const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
    const downloadResult = await downloadResumable.downloadAsync();
    if (!downloadResult) {
      throw new Error("File download failed.");
    }
    const { uri } = downloadResult;
    console.log("File downloaded to:", uri);

    if (Platform.OS !== "web" && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri);
      return;
    }

    if (Platform.OS === "ios") {
      await IntentLauncher.startActivityAsync("com.apple.DocumentsApp", {
        data: uri,
        flags: 1,
        type: "*/*",
      });
      return;
    }

    if (Platform.OS === "android") {
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: uri,
        flags: 1,
        type: "*/*",
      });
    } else {
      // handle ios
    }
  } catch (error) {
    throw error;
  }
};

export default openFile;
