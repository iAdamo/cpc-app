import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
// import { Image } from "@/components/ui/image";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ScrollView } from "@/components/ui/scroll-view";
import { ThreeDotsIcon } from "@/components/ui/icon";
import useGlobalStore from "@/store/globalStore";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import MediaScroll from "./MediaScroll";
import { Dimensions, View, StyleSheet, Image } from "react-native";
import { ListRenderItem } from "react-native";
import { ProviderData } from "@/types";

const { width } = Dimensions.get("window");

// const renderChatItem: ListRenderItem<Chat> = ({ item: chat }) => {

const renderFeaturedCompanies: ListRenderItem<ProviderData> = ({
  item: providers,
}) => {
  return (
    <VStack className="flex-1 mt-8 gap-2">
      <Heading size="xl" className="font-medium px-4 text-brand-primary">
        Featured Companies
      </Heading>
      {[providers].map((provider) => (
        <VStack key={provider._id} className="justify-center h-80 bg-white">
          <HStack space="lg" className="items-center p-4 w-full">
            <Avatar size="md">
              <AvatarFallbackText>
                provider.activeRoleId?.providerName
              </AvatarFallbackText>
              <AvatarImage
                source={{
                  uri:
                    typeof provider.providerLogo === "string"
                      ? provider.providerLogo
                      : undefined,
                }}
              />
            </Avatar>
            <VStack className="justify-between">
              <Heading>{provider.providerName}</Heading>
              <Text>{provider.subcategories}</Text>
            </VStack>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto rotate-90 bg-black/30 border-0"
            >
              <ButtonIcon as={ThreeDotsIcon} size="xl" className="text-white" />
            </Button>
          </HStack>
          <MediaScroll
            mediaItems={(provider.providerImages || []).map((m) =>
              typeof m === "string"
                ? { type: "image", uri: m }
                : {
                    type: (m as any).type || "image",
                    uri: (m as any).uri || (m as any).url || "",
                  }
            )}
          />
        </VStack>
      ))}
    </VStack>
  );
};

export default renderFeaturedCompanies;
