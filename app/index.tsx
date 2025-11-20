import React, { useEffect, useRef } from "react";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import useGlobalStore from "@/store/globalStore";

export default function App() {
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (isAuthenticated) {
  //       if (!isOnboardingComplete) {
  //         router.replace("/onboarding");
  //       } else if (!user?.isEmailVerified) {
  //         useGlobalStore.setState({ currentStep: 3 });
  //         router.replace("/onboarding");
  //       } else {
  //         router.replace(switchRole === "Client" ? "/providers" : "/clients");
  //       }
  //     } else {
  //       router.replace("/auth/signin");
  //     }
  //   }, 2000); // 2 seconds delay

  //   return () => clearTimeout(timer); // Cleanup the timer on unmount
  // }, []);

  const { isAuthenticated, isOnboardingComplete, switchRole, user } =
    useGlobalStore();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("App Layout Effect Triggered");
    const timer = setTimeout(() => {
      // avoid running while auth state is unknown (optional)
      console.debug("App Layout Effect:", {
        isAuthenticated,
        isOnboardingComplete,
        user,
      });
      if (typeof isAuthenticated === "undefined") return;

      let target:
        | "/auth/signin"
        | "/onboarding"
        | "/providers"
        | "/clients"
        | null = null;

      if (!isAuthenticated) {
        target = !isOnboardingComplete ? "/onboarding" : "/auth/signin";
      } else {
        if (!isOnboardingComplete) target = "/onboarding";
        else if (user?.isEmailVerified === false) {
          useGlobalStore.setState({ currentStep: 3 });
          useGlobalStore.setState({ isOnboardingComplete: false });
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
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [isAuthenticated, isOnboardingComplete, user]);
  
  return (
    <VStack className="flex-1 bg-brand-primary">
      <VStack className="items-center mt-80 flex-1 gap-2">
        <Text className="text-white text-center font-bold" size="5xl">
          Companies Center
        </Text>
        <Text className="text-white" size="xl">
          The Center For All Your Service Needs
        </Text>
      </VStack>
      <Center className="mb-4">
        <Text size="2xs" className="text-white">
          Powered By
        </Text>
        <Text size="2xs" className="text-white">
          Sanuxtech
        </Text>
      </Center>
    </VStack>
  );
}

// import ProfileScreen from "@/screens/providers/profile";

// export default ProfileScreen;

// import Profile from "@/screens/profile";

// export default Profile;
