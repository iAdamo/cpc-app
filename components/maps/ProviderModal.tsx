import React from "react";
import { Linking } from "react-native";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { Button, ButtonText } from "../ui/button";
import { ScrollView } from "../ui/scroll-view";
import { LocationObject } from "expo-location";
import { locationService } from "@/utils/GetDistance";
import RatingSection from "../RatingFunction";
import { ProviderData, SubcategoryData } from "@/types";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetScrollView,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import ProfileAvatar from "../ProfileAvatar";
import useGlobalStore from "@/store/globalStore";
import { router } from "expo-router";

interface ProviderModalProps {
  provider: ProviderData;
  userLocation?: LocationObject | null;
  visible: boolean;
  onClose: () => void;
  onFocusLocation?: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({
  provider,
  userLocation,
  visible,
  onClose,
  onFocusLocation,
}) => {
  const { createChat, selectedChat, setCurrentView } = useGlobalStore();

  const providerLat = provider.location?.primary?.coordinates?.[1];
  const providerLon = provider.location?.primary?.coordinates?.[0];

  const distance =
    userLocation && providerLat != null && providerLon != null
      ? locationService.calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          providerLat,
          providerLon
        )
      : null;

  // const handleCall = () => {
  //   const phone = provider.providerPhoneNumber || provider.providerEmail || "";
  //   if (phone) Linking.openURL(`tel:${phone}`);
  // };

  const handleMessage = async () => {
    onClose();
    await createChat(provider.owner);
    if (!selectedChat) return;
    setCurrentView("Chat");
    router.push({
      pathname: "/chat/[id]",
      params: { id: selectedChat._id },
    });
  };

  const handleHire = () => {
    // Implement hire functionality
    console.log("Hire provider:", provider._id);
  };

  const getAvailabilityColor = (availability?: string) => {
    switch ((availability || "").toLowerCase()) {
      case "online":
      case "available":
        return "#4CAF50";
      case "busy":
        return "#FF9800";
      case "offline":
        return "#9E9E9E";
      default:
        return "#4CAF50";
    }
  };

  const description = provider.providerDescription || "";
  const address =
    provider.location?.primary?.address?.address ||
    provider.location?.primary?.address?.city ||
    "";
  const availability = provider.availability
    ? provider.availability
    : provider.isOnline
    ? "Online"
    : undefined;

  return (
    <Actionsheet isOpen={visible} onClose={onClose} className="">
      <ActionsheetBackdrop />
      <ActionsheetContent
        style={{ maxHeight: "70%" }}
        className="pt-2 items-start p-0"
      >
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        {/* Header */}
        <VStack className="w-full p-4  border-b border-gray-200">
          <ProfileAvatar provider={provider} />
        </VStack>
        <ActionsheetScrollView className="px-2">
          {/* Service info */}
          <ActionsheetItem className="data-[active=true]:bg-transparent flex-col items-start">
            <Heading size="md" className="text-brand-primary">
              Information
            </Heading>
            <Text className="text-typography-500 font-medium">
              {description}
            </Text>
          </ActionsheetItem>

          {/* Location */}
          <ActionsheetItem className="data-[active=true]:bg-transparent flex-col items-start">
            <Heading size="md" className="text-typography-800">
              Location
            </Heading>
            <Text className="text-typography-500 font-medium">{address}</Text>
            {distance !== null && (
              <Text className="text-[#007AFF] font-bold">
                {distance < 1
                  ? `${Math.round(distance * 1000)} meters away`
                  : `${distance.toFixed(1)} km away`}
              </Text>
            )}
          </ActionsheetItem>

          {/* Availability */}
          <ActionsheetItem className="data-[active=true]:bg-transparent flex-col items-start">
            <Heading size="md" className="text-typography-800">
              Availability
            </Heading>
            <HStack className="items-center">
              <VStack
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getAvailabilityColor(availability) }}
              />
              <Text className="text-typography-500 font-medium">
                {availability || "Available"}
              </Text>
            </HStack>
          </ActionsheetItem>

          {/* Contact / specialties */}
          <ActionsheetItem className="data-[active=true]:bg-transparent flex-col items-start">
            {/* provider.providerPhoneNumber && (
              <>
                <Heading size="md" className="text-typography-800">
                  Contact
                </Heading>
                <Text className="text-green-600 font-bold">
                  {provider.providerPhoneNumber}
                </Text>
              </>
            ) */}

            {provider.subcategories && provider.subcategories.length > 0 && (
              <VStack className="">
                <Heading size="md" className="text-typography-900 mb-2">
                  Specialties
                </Heading>
                <HStack className=" flex-wrap">
                  {provider.subcategories.map(
                    (s: SubcategoryData, idx: number) => (
                      <Text
                        key={idx}
                        size="sm"
                        className="text-blue-800 font-medium bg-blue-200 px-2 py-1 rounded-xl"
                      >
                        {s.name}
                      </Text>
                    )
                  )}
                </HStack>
              </VStack>
            )}
          </ActionsheetItem>
        </ActionsheetScrollView>
        {/* Action buttons */}
        <ActionsheetItem className="p-4 border-t border-gray-200 w-full justify-between data-[active=true]:bg-transaprent">
          <Button
            size="lg"
            variant="outline"
            onPress={() => {
              onClose(), onFocusLocation;
            }}
            className="border-gray-300 data-[active=true]:border-gray-400"
          >
            <ButtonText className="text-gray-600">View on Map</ButtonText>
          </Button>
          {/* <Button
            size="lg"
            variant="outline"
            onPress={handleMessage}
            className="border-gray-300 data-[active=true]:border-gray-400"
          >
            <ButtonText className="text-gray-600">Chat</ButtonText>
          </Button> */}
          <Button
            size="lg"
            onPress={handleMessage}
            className="bg-blue-600 data-[active=true]:bg-blue-500"
          >
            <ButtonText className="text-white">Chat Now</ButtonText>
          </Button>
        </ActionsheetItem>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ProviderModal;

//  <ScrollView
//                     className="max-h-96 w-full self-start"
//                     showsVerticalScrollIndicator={false}
//                   ></ScrollView>
