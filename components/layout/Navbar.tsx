import { useState, useEffect } from "react";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Pressable } from "../ui/pressable";
import { Text } from "../ui/text";
import { Heading } from "../ui/heading";
import { Icon, ChevronDownIcon, AddIcon, SearchIcon } from "../ui/icon";
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
  MapPinHouseIcon,
  CirclePlusIcon,
} from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";
import { LinearGradient } from "expo-linear-gradient";
import { MediaItem } from "@/types";
import { router, usePathname } from "expo-router";
import { socketService } from "@/services/socketService";

export const BottomNavbar = () => {
  const { currentView, setCurrentView, switchRole } = useGlobalStore();
  const isProvider = switchRole === "Provider";
  const buttons = [
    { icon: HouseIcon, label: "Home", showFor: "Client" },
    { icon: CircleDotDashedIcon, label: "Updates", showFor: "Both" },
    { icon: AddIcon, label: "Job-Post", showFor: "Client" },
    // { icon: MapPinHouseIcon, label: "Nearby", showFor: "Client" },
    { icon: MessagesSquareIcon, label: "Chat", showFor: "Both" },
    { icon: CircleUserRoundIcon, label: "Profile", showFor: "Both" },
  ];

  const pathname = usePathname();

  // console.log(pathname, "Current Pathname");

  return (
    <HStack className="p-2 px-6 justify-between bg-white items-center border-t border-gray-300 fixed bottom-0">
      {buttons
        .filter(
          (button) => button.showFor === "Both" || button.showFor === switchRole
        )
        .map((button, index) => (
          <Pressable
            key={index}
            onPress={() => {
              setCurrentView(button.label as any);
              if (pathname !== "/clients" && pathname !== "/providers") {
                router.back();
              }
            }}
            className={`items-center justify-center ${
              button.icon == AddIcon &&
              "bg-brand-primary rounded-full shadow-lg"
            }`}
          >
            <VStack className="items-center justify-center">
              <Icon
                as={button.icon}
                size="lg"
                className={`w-7 h-7 ${
                  button.label === "Job-Post"
                    ? "text-white m-4"
                    : currentView === button.label
                    ? isProvider
                      ? "text-brand-secondary"
                      : "text-brand-primary"
                    : "text-gray-500"
                }`}
              />
              {button.label !== "Job-Post" && (
                <Text
                  className={`${
                    currentView === button.label
                      ? isProvider
                        ? "text-brand-secondary font-bold"
                        : "text-brand-primary font-bold"
                      : "text-gray-500"
                  } mt-1`}
                >
                  {button.label}
                </Text>
              )}
            </VStack>
          </Pressable>
        ))}
    </HStack>
  );
};

export const TopNavbar = () => {
  const {
    user,
    currentLocation,
    getCurrentLocation,
    isLoading,
    switchRole,
    setCurrentView,
  } = useGlobalStore();
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
          <Avatar
            size="md"
            className={`${
              socketService.isConnected && "border-2 border-green-500"
            }`}
          >
            <AvatarFallbackText>
              {isProvider
                ? user?.activeRoleId?.providerName
                : user?.firstName || "" + user?.lastName || ""}
            </AvatarFallbackText>
            <AvatarImage
              source={{
                uri: isProvider
                  ? (user?.activeRoleId?.providerLogo as MediaItem).thumbnail
                  : user?.profilePicture?.thumbnail,
              }}
              className=""
            />
          </Avatar>
          {isProvider && (
            <Heading className="ml-4 text-typography-700">Jobs</Heading>
          )}
          <HStack className="items-center gap-2 ml-auto">
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
            </Button>

            <Button
              variant="outline"
              className={`border-0 rounded-full h-0 w-0 p-5 ${
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
