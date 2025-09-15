import { useState, useEffect } from "react";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
// import { Image } from "@/components/ui/image";
import useGlobalStore from "@/store/globalStore";
import { Image } from "react-native";
import { useRouter } from "expo-router";

const FinalPage = () => {
  const { updateUserProfile, completeOnboarding, isLoading, setCurrentStep } =
    useGlobalStore();
  const router = useRouter();
  // Call updateUserProfile when this component mounts
  useEffect(() => {
    const finalizeProfile = async () => {
      await updateUserProfile();
      completeOnboarding();
      setTimeout(() => {
        router.replace("/providers");
      }, 3000); // Wait 3 seconds before navigating
    };

    finalizeProfile();
  }, []);

  return (
    <Center className="h-full bg-white px-6">
      <VStack className="w-full h-full justify-center items-center gap-6">
        {isLoading ? (
          <Center className="gap-6">
            <Spinner size="large" className="text-brand-primary" />
            <Text size="lg" className="text-gray-600 text-center">
              Finalizing your profile...
            </Text>
          </Center>
        ) : (
          <Center className="gap-6">
            <Image
              source={require("@/assets/images/success-img.png")}
              className="w-32 h-32"
            />
            <Heading size="2xl" className="text-brand-primary text-center">
              All Set!
            </Heading>
            <Text size="lg" className="text-gray-600 text-center">
              Your profile has been successfully created. You can now explore
              and use the app.
            </Text>
          </Center>
        )}
      </VStack>
    </Center>
  );
};

export default FinalPage;
