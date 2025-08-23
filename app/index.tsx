import React, { useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { StatusBar } from "react-native";

const Index = () => {
  // set timeout and push to login screen
  useEffect(() => {
    setTimeout(() => {
      router.replace("auth/signin" as any);
    }, 10000);
  }, []);

  return (
    <VStack className="flex-1 bg-brand-primary">
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={"#CD5C5C"}
      />
      <VStack className="items-center mt-80 flex-1 gap-2">
        <Text className="text-white" size="6xl">
          Safety Pro
        </Text>
        <Text className="text-white" size="xl">
         Companies Center
        </Text>
      </VStack>
      <Center className="mb-4">
        <Text size="2xs" className="text-white">
          Powered By
        </Text>
        <Text size="2xs" className="text-white">
          Sanux Technologies
        </Text>
      </Center>
    </VStack>
  );
};

export default Index;
