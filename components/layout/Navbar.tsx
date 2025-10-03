import { useState, useEffect } from "react";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Pressable } from "../ui/pressable";
import { Text } from "../ui/text";
import { Heading } from "../ui/heading";
import { Icon, ChevronDownIcon } from "../ui/icon";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { BellDotIcon, NavigationIcon } from "lucide-react-native";
import { Button, ButtonText, ButtonIcon, ButtonSpinner } from "../ui/button";
import {
  HouseIcon,
  CircleDotDashedIcon,
  MessagesSquareIcon,
  CircleUserRoundIcon,
} from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";
import { LinearGradient } from "expo-linear-gradient";
import SearchBar from "../SearchEngine";
import ProfilePic from "../profile/ProfilePic";

export const BottomNavbar = () => {
  const { currentView, setCurrentView, switchRole } = useGlobalStore();
  const isProvider = switchRole === "Provider";
  const buttons = [
    { icon: HouseIcon, label: "Home" },
    { icon: CircleDotDashedIcon, label: "Updates" },
    { icon: MessagesSquareIcon, label: "Chat" },
    { icon: CircleUserRoundIcon, label: "Profile" },
  ];
  return (
    <HStack className="p-2 justify-between bg-white items-center border border-t border-gray-300 fixed bottom-0">
      {buttons.map((button, index) => (
        <Pressable
          key={index}
          onPress={() => setCurrentView(button.label as any)}
          className="flex-1 items-center"
        >
          <VStack className="items-center">
            <Icon
              as={button.icon}
              size="lg"
              className={`w-7 h-7 ${
                currentView === button.label
                  ? isProvider
                    ? "text-brand-secondary"
                    : "text-brand-primary"
                  : "text-gray-500"
              }`}
            />
            <Text
              className={`${
                currentView === button.label
                  ? isProvider
                    ? "text-brand-secondary"
                    : "text-brand-primary"
                  : "text-gray-500"
              } mt-1`}
            >
              {button.label}
            </Text>
          </VStack>
        </Pressable>
      ))}
    </HStack>
  );
};

export const TopNavbar = () => {
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
        <HStack className="w-full p-4 items-center">
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
          {isProvider && (
            <Heading className="ml-4 text-typography-700">Tasks</Heading>
          )}
          <HStack className="items-center gap-2 ml-auto">
            {!isProvider && (
              <Button
                size="sm"
                className={`h-10 ${
                  isProvider
                    ? "bg-brand-secondary data-[active=true]:bg-brand-secondary"
                    : "bg-brand-primary data-[active=true]:bg-brand-secondary"
                } rounded-full`}
                onPress={getCurrentLocation}
              >
                <ButtonIcon as={NavigationIcon} />
                {isLoading ? (
                  <ButtonSpinner />
                ) : (
                  <ButtonText className="line-clamp-1 max-w-32">
                    {`${
                      currentLocation
                        ? `${currentLocation.city}, ${currentLocation.region}, ${currentLocation.isoCountryCode}`
                        : "Get Location"
                    }`}
                  </ButtonText>
                )}
                <ButtonIcon as={ChevronDownIcon} />
              </Button>
            )}
            <Button
              className={`rounded-full h-0 w-0 p-5 ${
                isProvider ? "bg-brand-secondary/30" : "bg-brand-primary/30"
              }`}
            >
              <ButtonIcon
                as={BellDotIcon}
                className={
                  isProvider ? "text-brand-secondary" : "text-brand-primary"
                }
              />
            </Button>
          </HStack>
        </HStack>
        {/** Search bar */}
        {/* <SearchBar /> */}
      </VStack>
    </VStack>
  );
};
