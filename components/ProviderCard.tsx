import { VStack } from "./ui/vstack";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { Heading } from "./ui/heading";
import React from "react";
import { Card } from "./ui/card";
import { Button, ButtonIcon } from "./ui/button";
import { Icon, ChevronRightIcon } from "./ui/icon";
import { Pressable } from "./ui/pressable";
import { Box } from "./ui/box";
import useGlobalStore from "@/store/globalStore";
import { Image } from "./ui/image";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { MapPinIcon } from "lucide-react-native";
import { router } from "expo-router";
import { HeartIcon, StarIcon } from "lucide-react-native";
import { usePathname } from "expo-router";
import { fill } from "lodash";
import { ProviderData } from "@/types";
import RatingSection from "./RatingFunction";

const ProviderCard = ({ provider }: { provider: any }) => {
  const { displayStyle, setDisplayStyle, setSavedProviders, savedProviders } =
    useGlobalStore();
  const pathname = usePathname();

  const isSavedPro = pathname === "/profile/saved-companies";
  isSavedPro && displayStyle === "Grid" && setDisplayStyle("List");
  const isGrid = displayStyle === "Grid";

  const savedProviderIds = savedProviders.map((p) => p.id);
  const isSaved = savedProviderIds.includes(provider.id);

  const handleSaveToggle = () => {
    if (isSaved) {
      setSavedProviders(savedProviders.filter((p) => p.id !== provider.id));
    } else {
      setSavedProviders([...savedProviders, provider]);
    }
  };

  return (
    <Card
      className={`rounded-lg p-0 ${
        isGrid ? "w-[49%] mb-4 h-72" : "w-full mb-4 h-40"
      }`}
    >
      {isGrid ? (
        <VStack className="flex-1">
          <Box className="relative w-full h-1/2 mb-2">
            <Image
              source={{ uri: provider.profilePicture }}
              alt={provider.providerName}
              className="w-full h-full rounded-xl bg-gray-200"
            />
            {/* Heart icon at top-left */}
            <HStack className="absolute">
              <HStack className="justify-between items-center w-full px-3">
                <Button variant="link" onPress={handleSaveToggle} className="">
                  <ButtonIcon
                    as={HeartIcon}
                    className={`w-6 h-6 text-black/40 ${
                      isSaved && "fill-red-600 text-red-400"
                    }`}
                  />
                </Button>
                {/* Star icon and rating at top-right */}
                <Box className="flex flex-row items-center">
                  <Icon as={StarIcon} className="w-6 h-6 text-yellow-500" />
                  <Text className="ml-1 text-yellow-500 font-bold">
                    {provider.rating}
                  </Text>
                </Box>
              </HStack>
            </HStack>
          </Box>

          <VStack className="flex-1 justify-between">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/providers/[id]",
                  params: { id: provider.id },
                })
              }
              className="flex-1"
            >
              <HStack space="sm" className="items-center">
                <Avatar size="sm">
                  <AvatarFallbackText>
                    {provider.providerName}
                  </AvatarFallbackText>
                  <AvatarImage source={{ uri: provider.profilePicture }} />
                </Avatar>
                <Heading
                  size="md"
                  className="font-medium break-words text-brand-primary"
                >
                  {provider.providerName}
                </Heading>
              </HStack>
              <Text className="mt-2 text-gray-600 line-clamp-2">
                {provider.providerDescription}
              </Text>
              <Text className="text-gray-500">{provider.category}</Text>
              <HStack space="xs" className="items-center">
                <Icon as={MapPinIcon} size="sm" className="text-gray-500" />
                <Text className=" text-gray-500">{provider.location}</Text>
              </HStack>
            </Pressable>
          </VStack>
        </VStack>
      ) : (
        <HStack className="h-full">
          <Box className="relative w-1/2 h-full mr-4">
            <Image
              source={{ uri: provider.profilePicture }}
              alt={provider.providerName}
              className="w-full h-full rounded-xl bg-gray-200"
            />
            {/* Heart icon at top-left */}
            <HStack className="absolute">
              <HStack className="justify-between items-center w-full px-3">
                <Button variant="link" onPress={handleSaveToggle} className="">
                  <ButtonIcon
                    as={HeartIcon}
                    className={`w-6 h-6 text-black/40 ${
                      isSaved && "fill-red-600 text-red-400"
                    }`}
                  />
                </Button>
                {/* Star icon and rating at top-right */}
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/profile/reviews-ratings/[id]",
                      params: { id: provider.id },
                    })
                  }
                  className="flex flex-row items-center"
                >
                  <RatingSection rating={provider.rating} />
                </Pressable>
              </HStack>
            </HStack>
          </Box>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/providers/[id]",
                params: { id: provider.id },
              })
            }
            className="flex-1"
          >
            <VStack className="flex-1 gap-1">
              <Heading size="md" className="font-medium">
                {provider.providerName}
              </Heading>
              <Text className="text-gray-500">{provider.category}</Text>
              <Text className="mt-2 text-gray-600 break-words line-clamp-2">
                {provider.providerDescription}
              </Text>
              {/* <Pressable onPress={() => console.log("An Apple")} className="z-50">
                <HStack className="items-center">
                  <RatingSection reviewCount={provider.reviews} />
                  <Icon
                    size="sm"
                    as={ChevronRightIcon}
                    className="text-yellow-500"
                  />
                </HStack>
              </Pressable> */}
              <HStack space="xs" className="items-center">
                <Icon as={MapPinIcon} size="sm" className="text-red-500" />
                <Text className=" text-gray-500">{provider.location}</Text>
              </HStack>
            </VStack>
          </Pressable>
        </HStack>
      )}
    </Card>
  );
};

export default ProviderCard;
