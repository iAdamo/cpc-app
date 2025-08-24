import React, { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "react-native";
import useGlobalStore from "@/store/globalStore";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppLayout() {
    const { isAuthenticated, isOnboardingComplete } =
      useGlobalStore();

    useEffect(() => {
      if (!isAuthenticated) {
        router.replace("/auth/signin");
      } else if (isAuthenticated && !isOnboardingComplete) {
        router.replace("/onboarding");
      } else if (isAuthenticated && isOnboardingComplete) {
        router.replace("/");
      }
    }, [isAuthenticated, isOnboardingComplete]);
  return (
      <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={"#FFFFFF"}
      />
      <Stack screenOptions={{ headerShown: false }} />;
    </SafeAreaView>
  );
}
