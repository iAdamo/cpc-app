import { VStack } from "./ui/vstack";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { Heading } from "./ui/heading";
import React from "react";
import { Card } from "./ui/card";
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
// ...existing imports...

const ProviderCard = ({ provider }: { provider: any }) => {
  const { displayStyle } = useGlobalStore();
  const isGrid = displayStyle === "Grid";

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/providers/[id]",
          params: { id: provider.id },
        })
      }
      className={`${isGrid ? "w-[48%] mb-4" : "w-full mb-4"}`}
    >
      <Card
        className={`rounded-lg p-0 ${isGrid ? "w-full h-72" : "w-full h-40"}`}
      >
        {isGrid ? (
          <VStack className="flex-1">
            <Box className="relative w-full h-1/2 mb-2 bg-red-600">
              <Image
                source={{ uri: provider.profilePicture }}
                alt={provider.providerName}
                className="w-full h-full rounded-xl bg-gray-200"
              />
              {/* Heart icon at top-left */}
              <Box className="absolute top-2 left-2 z-50">
                <Icon size="sm" as={HeartIcon} className="text-red-500" />
              </Box>
              {/* Star icon and rating at top-right */}
              <Box className="absolute top-2 right-2 z-10 flex flex-row items-center">
                <Icon as={StarIcon} className="w-6 h-6 text-yellow-500" />
                <Text className="ml-1 text-yellow-500 font-bold">
                  {provider.rating}
                </Text>
              </Box>
            </Box>
            <VStack className="flex-1 justify-between">
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
              <Box className="absolute top-2 left-2 z-10">
                <Icon as={HeartIcon} className="w-6 h-6 text-red-500" />
              </Box>
              {/* Star icon and rating at top-right */}
              <Box className="absolute top-2 right-2 z-10 flex flex-row items-center">
                <Icon as={StarIcon} className="w-6 h-6 text-yellow-500" />
                <Text className="ml-1 text-yellow-500 font-bold">
                  {provider.rating}
                </Text>
              </Box>
            </Box>
            <VStack className="flex-1 justify-between">
              <Heading size="md" className="font-medium">
                {provider.providerName}
              </Heading>
              <Text className="text-gray-500">{provider.category}</Text>
              <Text className="mt-2 text-gray-600 line-clamp-2">
                {provider.providerDescription}
              </Text>
              <HStack className="items-center">
                <Icon
                  as={ChevronRightIcon}
                  size="sm"
                  className="text-yellow-500 w-4 h-4"
                />
                <Text className="ml-1 text-yellow-500">
                  {provider.rating} ({provider.reviews} reviews)
                </Text>
              </HStack>
              <HStack space="xs" className="items-center">
                <Icon as={MapPinIcon} size="sm" className="text-gray-500" />
                <Text className=" text-gray-500">{provider.location}</Text>
              </HStack>
            </VStack>
          </HStack>
        )}
      </Card>
    </Pressable>
  );
};

export default ProviderCard;
