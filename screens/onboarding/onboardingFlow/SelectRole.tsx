import { useRef, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Icon, CheckIcon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import useGlobalStore from "@/store/globalStore";
import Clients from "@/assets/icons/Clients";
import Providers from "@/assets/icons/Providers";
import { UserData, OnboardingData } from "@/types";
import { router } from "expo-router";

const SelectRole = () => {
  const { setCurrentStep, currentStep, updateProfile, user, setSwitchRole } = useGlobalStore();
  const [activeRole, setActiveRole] = useState(user?.activeRole);

  const handleSubmit = () => {
    //  setSwitchRole("Client");
    // router.replace("/providers");

    updateProfile({ activeRole });
    setCurrentStep(currentStep + 1);
    return;
  };
  return (
    <VStack className="flex-1 p-4">
      <Box className="gap-20 flex-1">
        <VStack className="gap-4 ">
          <Heading size="2xl" className="text-brand-primary">
            Tell Us How You'll Use Companies Center
          </Heading>
          <Text size="lg" className="text-gray-600">
            Companies Center lets you work as a client or a service provider on
            one platform.
          </Text>
        </VStack>

        <VStack space="xl">
          <Pressable
            onPress={() => setActiveRole("Client")}
            className={`flex-row w-full h-28 p-2 border rounded-xl data-[active=true]:bg-[#F6F6F6] data-[active=true]:border-brand-primary ${
              activeRole === "Client"
                ? "border-brand-primary"
                : "border-black/10"
            }`}
          >
            <Box className="w-1/4 h-full p-2 items-center justify-between rounded-lg bg-brand-primary/40 ">
              <Box className="flex flex-col p-2 rounded-full bg-brand-primary/40 ">
                <Clients width={25} height={25} color="red" />
              </Box>
              <Text size="lg" className="font-medium text-brand-primary">
                Client
              </Text>
            </Box>
            <VStack className="w-8/12 px-2 justify-center items-start">
              <Text size="xl" className="font-medium">
                I&apos;m hiring for a project
              </Text>
            </VStack>
            {activeRole === "Client" && (
              <VStack className="w-1/12 bg-brand-primary rounded h-1/3 justify-center items-center">
                <Icon as={CheckIcon} className="text-white" />
              </VStack>
            )}
          </Pressable>
          <Pressable
            onPress={() => setActiveRole("Provider")}
            className={`flex-row w-full h-28 p-2 border rounded-xl data-[active=true]:bg-[#F6F6F6] data-[active=true]:border-brand-secondary ${
              activeRole === "Provider"
                ? "border-brand-secondary"
                : "border-black/10"
            }`}
          >
            <Box className="w-1/4 h-full p-2 items-center justify-between rounded-lg bg-brand-secondary/40 ">
              <Box className="flex flex-col p-2 rounded-full bg-brand-secondary/40 ">
                <Providers width={25} height={25} />
              </Box>
              <Text size="lg" className="font-medium text-brand-secondary">
                Provider
              </Text>
            </Box>
            <VStack className="w-8/12 px-2 justify-center items-start">
              <Text size="xl" className="font-medium">
                I&apos;d like to offer my services
              </Text>
            </VStack>
            {activeRole === "Provider" && (
              <VStack className="w-1/12 bg-brand-secondary rounded h-1/3 justify-center items-center">
                <Icon as={CheckIcon} className="text-white" />
              </VStack>
            )}
          </Pressable>
        </VStack>
      </Box>
      <Button
        size="xl"
        className="bg-brand-primary data-[active=true]:bg-brand-primary/70"
        onPress={handleSubmit}
        isDisabled={!activeRole}
      >
        <ButtonText className="text-white">{`Continue ${
          activeRole === "Client"
            ? "as Client"
            : activeRole === "Provider"
            ? "as Service Provider"
            : ""
        }`}</ButtonText>
      </Button>
    </VStack>
  );
};

export default SelectRole;
