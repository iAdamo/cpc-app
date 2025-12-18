import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { router } from "expo-router";
import useGlobalStore from "@/store/globalStore";

export default function AppLayout() {
  const { isAuthenticated, isOnboardingComplete, switchRole } =
    useGlobalStore();

  useEffect(() => {
    if (isAuthenticated && isOnboardingComplete)
      router.replace(switchRole === "Client" ? "/providers" : "/clients");
  }, [router]);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="#FFFFFF"
      />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
