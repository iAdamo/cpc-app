import React, { useEffect } from "react";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "react-native";
import useGlobalStore from "@/store/globalStore";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppLayout() {
  const { user, isAuthenticated, isOnboardingComplete } = useGlobalStore();
  useEffect(() => {
    if (isAuthenticated && !isOnboardingComplete) {
      router.replace("/onboarding");
    } else if (isAuthenticated && isOnboardingComplete) {
      if (user?.activeRole === "Client") {
        router.replace("/providers");
      } else {
        router.replace("/clients");
      }
    } else if (!isAuthenticated && !isOnboardingComplete) {
      router.replace("/onboarding");
    } else if (!isAuthenticated && isOnboardingComplete) {
      router.replace("/auth/signin");
    }
  }, [isAuthenticated, isOnboardingComplete]);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={"#FFFFFF"}
      />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
