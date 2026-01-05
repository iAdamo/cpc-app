import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { LocationPermission } from "@/components/LocationPermission";
import { Linking } from "react-native";
import { ShareService } from "@/services/shareService";
import { useEffect } from "react";
import { router } from "expo-router";
import { BottomNavbar, TopNavbar } from "@/components/layout/Navbar";

export default function AppLayout() {
  useEffect(() => {
    // Handle initial URL
    const handleInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const linkData = ShareService.parseIncomingLink(initialUrl);
        handleDeepLink(linkData);
      }
    };

    handleInitialUrl();

    // Listen for incoming links
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const linkData = ShareService.parseIncomingLink(url);
      handleDeepLink(linkData);
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = (linkData: any) => {
    // Navigate to appropriate screen
    if (linkData.screen === "providers" && linkData.id) {
      router.push({ pathname: "/profile/[id]", params: linkData.id });
    } else if (linkData.screen === "ServiceDetails" && linkData.id) {
      router.push({ pathname: "/services/[id]", params: linkData.id });
    } else if (linkData.screen === "Profile" && linkData.id) {
      router.push({ pathname: "/profile/[id]", params: linkData.id });
    }
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={"transparent"}
      />
      <Stack screenOptions={{ headerShown: false }} />
      <BottomNavbar />
    </>
  );
}
