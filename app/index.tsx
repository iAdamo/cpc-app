import React, { useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";

export default function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/signin");
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []);
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
