import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Icon, ChevronDownIcon } from "@/components/ui/icon";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  BellDotIcon,
  NavigationIcon,
  PhoneCallIcon,
} from "lucide-react-native";
import {
  Button,
  ButtonText,
  ButtonIcon,
  ButtonSpinner,
} from "@/components/ui/button";
import {
  HouseIcon,
  CircleDotDashedIcon,
  MessagesSquareIcon,
  CircleUserRoundIcon,
} from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";
import { LinearGradient } from "expo-linear-gradient";

const ChatNavbar = () => {
  const { user, currentLocation, getCurrentLocation, isLoading, switchRole } =
    useGlobalStore();
  const isProvider = switchRole === "Provider";

  return (
    <VStack className="bg-white">
      <HStack className="w-full relative">
        <LinearGradient
          colors={
            isProvider
              ? ["#fffbe020", "#facc1530"] // yellow gradient for Provider
              : ["#ffffff20", "#2563eb50"] // blue gradient for others
          }
          style={{
            position: "absolute",
            width: "100%",
            height: 130,
          }}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </HStack>
      <VStack className="pt-10 gap-4">
        <HStack className="p-4 justify-between">
          <Heading size="2xl" className="font-medium text-brand-primary">
            Chats
          </Heading>
          <Button variant="outline" className="bg-brand-primary/40 rounded-3xl px-4">
            <ButtonIcon as={PhoneCallIcon} className="text-brand-primary" />
            <ButtonText className="text-brand-primary">Call</ButtonText>
          </Button>
        </HStack>
        {/* <HStack className="w-full p-4 items-center">
            <Avatar size="md">
              <AvatarFallbackText>{`${user?.firstName} ${user?.lastName}`}</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri:
                    typeof user?.activeRoleId?.providerLogo === "string"
                      ? user.activeRoleId.providerLogo
                      : undefined,
                }}
              />
            </Avatar>


          </HStack> */}
        {/** Search bar */}
        {/* <SearchBar /> */}
      </VStack>
    </VStack>
  );
};

export default ChatNavbar;
