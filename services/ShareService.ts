import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { Share } from "react-native";
import * as Linking from "expo-linking";
import { Alert, Platform } from "react-native";

export class ShareService {
  static generateDynamicLink = (
    userId: string,
    content?: { type: string; id: string; name?: string }
  ): string => {
    const baseUrl = "https://companiescenterllc.com";

    if (content) {
      switch (content.type) {
        case "providers":
          return `${baseUrl}/providers/${
            content.id
          }?ref=${userId}&name=${encodeURIComponent(content.name || "")}`;
        case "service":
          return `${baseUrl}/service/${
            content.id
          }?ref=${userId}&name=${encodeURIComponent(content.name || "")}`;
        case "profile":
          return `${baseUrl}/profile/${content.id}?ref=${userId}`;
        default:
          return `${baseUrl}/invite?ref=${userId}`;
      }
    }
    return `${baseUrl}/invite?ref=${userId}`;
  };

  static shareContent = async (
    userId: string,
    options?: {
      providerName?: string;
      contentType?: string;
      contentId?: string;
      contentName?: string;
    }
  ) => {
    const applicationName = Application.applicationName;

    const sharedLink =
      options?.contentType && options?.contentId
        ? this.generateDynamicLink(userId, {
            type: options.contentType,
            id: options.contentId,
            name: options.contentName,
          })
        : this.generateDynamicLink(userId);

    let shareMessage = "";

    if (options?.contentType === "providers" && options?.providerName) {
      shareMessage = `Check out ${options.providerName} on ${applicationName}! Discover and connect with top service providers. Download now: ${sharedLink}`;
    } else {
      shareMessage = `Join me on ${applicationName}! Discover and connect with top service providers. Download now: ${sharedLink}`;
    }

    try {
      await Share.share({
        message: shareMessage,
        url: sharedLink,
        title: `Share ${applicationName}`,
      });
    } catch (error: any) {
      if (error?.message?.includes("User did not share")) {
        // User cancelled share dialog, do nothing
        return;
      }
      // Fallback: copy to clipboard
      await Clipboard.setStringAsync(shareMessage);
      Alert.alert("Success", "Invite link copied to clipboard!");
    }
  };

  static parseIncomingLink = (
    url: string
  ): {
    referrerId?: string;
    screen?: string;
    id?: string;
    name?: string;
  } => {
    try {
      const parsedUrl = Linking.parse(url);
      const queryParams = parsedUrl.queryParams || {};
      const path = parsedUrl.path || "";

      const result: any = {};

      if (queryParams.ref) {
        result.referrerId = queryParams.ref;
      }

      if (path.includes("/providers/")) {
        result.screen = "providers";
        result.id = path.split("/providers/")[1]?.split("?")[0];
        result.name = queryParams.name
          ? decodeURIComponent(queryParams.name as string)
          : undefined;
      } else if (path.includes("/service/")) {
        result.screen = "service";
        result.id = path.split("/service/")[1]?.split("?")[0];
      } else if (path.includes("/profile/")) {
        result.screen = "profile";
        result.id = path.split("/profile/")[1]?.split("?")[0];
      } else if (path.includes("/invite")) {
        result.screen = "invite";
      }
      return result;
    } catch (error) {
      console.error("Error parsing incoming link:", error);
      return {};
    }
  };

  // Get install referrer (for Android)
  static getInstallReferrer = async (): Promise<string | null> => {
    if (Platform.OS !== "android") return null;

    try {
      const referrer = await Application.getInstallReferrerAsync();
      const params = new URLSearchParams(referrer);
      return params.get("ref");
    } catch (error) {
      console.error("Error getting install referrer:", error);
      return null;
    }
  };
}
