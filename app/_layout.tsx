import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Slot } from "expo-router";
import { StatusBar, Platform } from "react-native";
import Toast from "react-native-toast-message";
import useGlobalStore from "@/store/globalStore";
import { router } from "expo-router";
import { ShareService } from "@/services/shareService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../global.css";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const checkForReferral = async () => {
    try {
      // Only check on Android
      if (Platform.OS === "android") {
        const referrerId = await ShareService.getInstallReferrer();

        if (referrerId) {
          await AsyncStorage.setItem("referrerId", referrerId);
          console.log("Found referrer:", referrerId);
        }
      }
    } catch (error) {
      console.error("Error checking for referral:", error);
      // Don't throw - we don't want to block app startup for referral errors
    }
  };

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Use proper error handling for the splash screen
      const prepare = async () => {
        try {
          await checkForReferral();
        } catch (e) {
          // Handle error but don't block app
          console.warn("Referral check failed, continuing anyway");
        } finally {
          // Always hide splash screen regardless of referral result
          await SplashScreen.hideAsync();
        }
      };

      prepare();
    }
  }, [loaded]);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { error, success, clearError, clearSuccess, info, clearInfo } =
    useGlobalStore();

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: error,
        visibilityTime: 3000,
        onHide: clearError,
      });
    }
  }, [error, clearError]);

  useEffect(() => {
    if (success) {
      Toast.show({
        type: "success",
        text1: success,
        visibilityTime: 3000,
        onHide: clearSuccess,
      });
    }
  }, [success, clearSuccess]);

  useEffect(() => {
    if (info) {
      Toast.show({
        type: "info",
        text1: info,
        visibilityTime: 3000,
        onHide: clearInfo,
      });
    }
  }, [info, clearInfo]);

  return (
    <GluestackUIProvider>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor={"transparent"}
      />
      <Slot />
      <Toast position="bottom" />
    </GluestackUIProvider>
  );
}
