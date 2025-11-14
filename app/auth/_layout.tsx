import { useEffect, useRef } from "react";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "react-native";
import useGlobalStore from "@/store/globalStore";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { current } from "immer";

// ...existing code...
export default function AppLayout() {
  const { user, isAuthenticated, isOnboardingComplete } = useGlobalStore();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    // avoid running while auth state is unknown (optional)
    if (typeof isAuthenticated === "undefined") return;

    let target:
      | "/auth/signin"
      | "/onboarding"
      | "/providers"
      | "/clients"
      | null = null;

    if (!isAuthenticated) {
      target = !isOnboardingComplete ? "/onboarding" : null;
    } else {
      if (!isOnboardingComplete) target = "/onboarding";
      else if (!user?.isEmailVerified) {
        useGlobalStore.setState({ currentStep: 3 });
        target = "/onboarding";
      } else {
        target = user?.activeRole === "Client" ? "/providers" : "/clients";
      }
    }

    if (target && lastRedirectRef.current !== target) {
      console.log(`Redirecting to: ${target}`);
      lastRedirectRef.current = target;
      router.replace(target);
    }
  }, []);

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
