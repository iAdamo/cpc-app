import { VStack } from "./ui/vstack";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { Heading } from "./ui/heading";
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
import { usePathname, useLocalSearchParams } from "expo-router";
import RatingSection from "./RatingFunction";
import { ShareService } from "@/services/shareService";
import { ProviderData, MediaItem } from "@/types";

const ProviderCard = ({ provider }: { provider: ProviderData }) => {
  const {
    user,
    displayStyle,
    setDisplayStyle,
    setSavedProviders,
    savedProviders,
  } = useGlobalStore();
  const pathname = usePathname();
  const { section } = useLocalSearchParams<{ section: string }>();

  const isSavedPro = section === "saved-companies";
  isSavedPro && displayStyle === "Grid" && setDisplayStyle("List");
  const isGrid = displayStyle === "Grid";

  const savedProviderIds = savedProviders.map((provider) => provider._id);
  const isSaved = savedProviderIds.includes(provider._id);

  const handleSaveToggle = async () => {
    await setSavedProviders(provider._id);
  };

  // console.log("Rendering ProviderCard:", provider);

  return (
    <Card
      className={`rounded-lg p-0 ${
        isGrid ? "mb-4 h-72 w-1/2" : "mb-4 h-40 ml-2"
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
          <VStack className="flex-1 w-full">
            <Box className="relative w-full h-[50%] mb-2">
              <Image
                source={
                  typeof (provider.providerImages[0] as MediaItem).thumbnail ===
                  "string"
                    ? {
                        uri: (provider.providerImages[0] as MediaItem)
                          .thumbnail,
                      }
                    : undefined
                }
                alt={provider.providerName}
                className="w-full h-full rounded-xl bg-gray-200"
              />
              {/* Heart icon at top-left */}
              <HStack className="absolute">
                <HStack className="justify-between items-center w-full px-1.5 pt-1.5">
                  <Button
                    variant="outline"
                    onPress={handleSaveToggle}
                    className="bg-white/80 rounded-full border-0 h-7 w-12"
                  >
                    <ButtonIcon
                      as={HeartIcon}
                      className={`text-black/40 ${
                        isSaved
                          ? "fill-red-600 text-red-400"
                          : "fill-white text-black/50"
                      }`}
                    />
                  </Button>
                  {/* Star icon and rating at top-right */}
                </HStack>
              </HStack>
            </Box>
            <VStack className="flex-1 pr-2">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/profile/[id]",
                    params: { id: provider.owner },
                  })
                }
                className="flex-1 gap-1 justify-between flex-col pr-2"
              >
                <HStack space="sm" className="items-center">
                  <Avatar size="sm">
                    <AvatarFallbackText>
                      {provider.providerName}
                    </AvatarFallbackText>
                    <AvatarImage
                      source={
                        typeof (provider?.providerLogo as MediaItem)
                          .thumbnail === "string"
                          ? {
                              uri: (provider.providerLogo as MediaItem)
                                .thumbnail,
                            }
                          : undefined
                      }
                    />
                  </Avatar>
                  <Heading
                    size="md"
                    className="flex-1 line-clamp-1 text-brand-primary"
                  >
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
                  <Icon as={MapPinIcon} size="sm" className="text-red-400" />
                  <Text className=" text-gray-500 line-clamp-1 flex-1">
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
                source={
                  typeof (provider.providerImages[0] as MediaItem).thumbnail ===
                  "string"
                    ? {
                        uri: (provider.providerImages[0] as MediaItem)
                          .thumbnail,
                      }
                    : undefined
                }
                alt={provider.providerName}
                className="w-full h-full rounded-xl bg-gray-200"
              />
              {/* Heart icon at top-left */}
              <HStack className="absolute">
                <HStack className="justify-between items-center w-full px-1.5 pt-1.5">
                  <Button
                    variant="outline"
                    onPress={handleSaveToggle}
                    className="bg-white/80 rounded-full border-0 h-8 w-8"
                  >
                    <ButtonIcon
                      as={HeartIcon}
                      className={`text-black/40 ${
                        isSaved
                          ? "fill-red-600 text-red-400"
                          : "fill-white text-black/50"
                      }`}
                    />
                  </Button>
                  {/* Star icon and rating at top-right */}
                </HStack>
              </HStack>
            </Box>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/profile/[id]",
                  params: { id: provider.owner },
                })
              }
              className="flex-1"
            >
              <VStack className="flex-1 justify-between pb-2">
                <VStack space="xs">
                  <HStack space="sm" className="items-center">
                    <Avatar size="sm">
                      <AvatarFallbackText>
                        {provider.providerName}
                      </AvatarFallbackText>
                      <AvatarImage
                        source={
                          typeof (provider?.providerLogo as MediaItem)
                            .thumbnail === "string"
                            ? {
                                uri: (provider.providerLogo as MediaItem)
                                  .thumbnail,
                              }
                            : undefined
                        }
                      />
                    </Avatar>
                    <Heading
                      size="md"
                      className="flex-1 line-clamp-1 text-brand-primary"
                    >
                      {provider.providerName}
                    </Heading>
                  </HStack>
                  <Text className="font-medium">
                    {provider?.subcategories[0].name}
                  </Text>
                </VStack>
                <Text className="text-gray-600 break-words line-clamp-2">
                  {provider.providerDescription}
                </Text>
                <HStack space="xs" className="items-center">
                  <Icon as={MapPinIcon} size="sm" className="text-red-400" />
                  <Text className=" text-gray-500 line-clamp-1 flex-1">
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
