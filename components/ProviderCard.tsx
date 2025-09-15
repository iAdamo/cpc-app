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
import RatingSection from "./RatingFunction";
import { ShareService } from "@/services/ShareService";
import { ProviderData } from "@/types";

const ProviderCard = ({ provider }: { provider: ProviderData }) => {
  const {
    user,
    displayStyle,
    setDisplayStyle,
    setSavedProviders,
    savedProviders,
  } = useGlobalStore();
  const pathname = usePathname();

  const isSavedPro = pathname === "/profile/saved-companies";
  isSavedPro && displayStyle === "Grid" && setDisplayStyle("List");
  const isGrid = displayStyle === "Grid";

  const savedProviderIds = savedProviders.map((p) => p._id);
  const isSaved = savedProviderIds.includes(provider._id);

  const handleSaveToggle = async () => {
    await setSavedProviders(provider._id);
  };

  return (
    <Card
      className={`rounded-lg p-0 ${
        isGrid ? "w-[49%] mb-4 h-72" : "w-full mb-4 h-40"
      }`}
    >
      {isGrid ? (
        <Pressable
          className="flex-1"
          onLongPress={() =>
            ShareService.shareContent(user ? user._id : "", {
              providerName: provider.providerName,
              contentType: "providers",
              contentId: provider._id,
              contentName: provider.providerName,
            })
          }
        >
          <VStack className="flex-1">
            <Box className="relative w-full h-1/2 mb-2">
              <Image
                source={{ uri: provider.providerImages[0] }}
                alt={provider.providerName}
                className="w-full h-full rounded-xl bg-gray-200"
              />
              {/* Heart icon at top-left */}
              <HStack className="absolute">
                <HStack className="justify-between items-center w-full px-3">
                  <Button
                    variant="link"
                    onPress={handleSaveToggle}
                    className=""
                  >
                    <ButtonIcon
                      as={HeartIcon}
                      className={`w-6 h-6 text-black/40 ${
                        isSaved
                          ? "fill-red-600 text-red-400"
                          : "fill-white text-white"
                      }`}
                    />
                  </Button>
                  {/* Star icon and rating at top-right */}
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/profile/reviews-ratings/[id]",
                        params: { id: provider._id },
                      })
                    }
                    className="flex flex-row items-center"
                  >
                    <RatingSection rating={provider.averageRating} />
                  </Pressable>
                </HStack>
              </HStack>
            </Box>
            <VStack className="flex-1 justify-between">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/providers/[id]",
                    params: { id: provider._id },
                  })
                }
                className="flex-1 gap-1"
              >
                <HStack space="sm" className="items-center">
                  <Avatar size="sm">
                    <AvatarFallbackText>
                      {provider.providerName}
                    </AvatarFallbackText>
                    <AvatarImage source={{ uri: user?.profilePicture }} />
                  </Avatar>
                  <Heading size="md" className="break-words text-brand-primary">
                    {provider.providerName}
                  </Heading>
                </HStack>
                <Text className="font-medium">
                  {provider?.subcategories[0].name}
                </Text>
                <Text className="text-gray-600 line-clamp-2">
                  {provider.providerDescription}
                </Text>
                <HStack space="xs" className="items-center">
                  <Icon as={MapPinIcon} size="sm" className="text-red-500" />
                  <Text className=" text-gray-500 line-clamp-1">
                    {provider?.location?.primary?.address?.address}
                  </Text>
                </HStack>
              </Pressable>
            </VStack>
          </VStack>
        </Pressable>
      ) : (
        <Pressable
          className="flex-1"
          onLongPress={() =>
            ShareService.shareContent(user ? user._id : "", {
              providerName: provider.providerName,
              contentType: "providers",
              contentId: provider._id,
              contentName: provider.providerName,
            })
          }
        >
          <HStack className="h-full">
            <Box className="relative w-1/2 h-full mr-4">
              <Image
                source={{ uri: provider.providerImages[0] }}
                alt={provider.providerName}
                className="w-full h-full rounded-xl bg-gray-200"
              />
              {/* Heart icon at top-left */}
              <HStack className="absolute">
                <HStack className="justify-between items-center w-full px-3">
                  <Button
                    variant="link"
                    onPress={handleSaveToggle}
                    className=""
                  >
                    <ButtonIcon
                      as={HeartIcon}
                      className={`w-6 h-6 text-black/40 ${
                        isSaved
                          ? "fill-red-600 text-red-400"
                          : "fill-white text-white"
                      }`}
                    />
                  </Button>
                  {/* Star icon and rating at top-right */}
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/profile/reviews-ratings/[id]",
                        params: { id: provider._id },
                      })
                    }
                    className="flex flex-row items-center"
                  >
                    <RatingSection rating={provider.ratings} />
                  </Pressable>
                </HStack>
              </HStack>
            </Box>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/providers/[id]",
                  params: { id: provider._id },
                })
              }
              className="flex-1"
            >
              <VStack className="flex-1 gap-1">
                <HStack space="sm" className="items-center">
                  <Avatar size="sm">
                    <AvatarFallbackText>
                      {provider.providerName}
                    </AvatarFallbackText>
                    <AvatarImage source={{ uri: user?.profilePicture }} />
                  </Avatar>
                  <Heading size="md" className="break-words text-brand-primary">
                    {provider.providerName}
                  </Heading>
                </HStack>

                <Text className="font-medium">
                  {provider.subcategories[0].name}
                </Text>
                <Text className="text-gray-600 break-words line-clamp-2">
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
                  <Text className=" text-gray-500 line-clamp-1">
                    {provider?.location?.primary?.address?.address}
                  </Text>
                </HStack>
              </VStack>
            </Pressable>
          </HStack>
        </Pressable>
      )}
    </Card>
  );
};

export default ProviderCard;
