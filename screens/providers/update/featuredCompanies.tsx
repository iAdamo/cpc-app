import { useState, useEffect, useCallback } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ThreeDotsIcon } from "@/components/ui/icon";
import { Icon, AddIcon, CloseIcon, ShareIcon } from "@/components/ui/icon";
import {
  FlagIcon,
  UserRoundPlusIcon,
  UserRoundXIcon,
  HeartPlusIcon,
  HeartMinusIcon,
} from "lucide-react-native";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import useGlobalStore from "@/store/globalStore";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import MediaScroll from "./MediaScroll";
import { Dimensions, View, StyleSheet, Image } from "react-native";
import { MediaItem, ProviderData } from "@/types";
import { ShareService } from "@/services/shareService";

const { width } = Dimensions.get("window");

const ProviderOptions = ({
  isOpen,
  onClose,
  provider,
}: {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderData;
}) => {
  const { toggleFollow, isFollowing, setSavedProviders, savedProviders } =
    useGlobalStore();
  const user = useGlobalStore((s) => s.user);

  const handleFollow = async () => {
    if (!provider || !provider._id) return;
    await toggleFollow(provider._id);
  };

  const savedProviderIds = savedProviders.map((p) => p._id);
  const isSaved = savedProviderIds.includes(provider._id);

  const handleSaveToggle = async () => {
    await setSavedProviders(provider._id);
  };

  // console.log(provider.providerImages[0]);

  // useEffect(() => {
  //   useGlobalStore.setState((state) => {
  //     state.isFollowing = Boolean(
  //       state.otherUser?.activeRoleId?.followedBy?.includes(state.user?._id || "")
  //     );
  //   });
  // }, []);

  const options = [
    {
      label: isFollowing ? "Unfollow Company" : "Follow Company",
      icon: isFollowing ? UserRoundXIcon : UserRoundPlusIcon,
      action: () => {
        handleFollow();
      },
    },
    {
      label: "Share",
      icon: ShareIcon,
      action: () => {
        ShareService.shareContent(user ? user._id : "", {
          providerName: provider.providerName || "",
          contentType: "providers",
          contentId: provider._id,
          contentName: provider.providerName || "",
        });
      },
    },
    {
      label: isSaved ? "Remove from Favorites" : "Add to Favorites",
      icon: isSaved ? HeartMinusIcon : HeartPlusIcon,
      action: () => {
        handleSaveToggle();
      },
    },
    { label: "Remove from list", icon: CloseIcon, action: () => {} },
    { label: "Report Company", icon: FlagIcon, action: () => {} },
  ];
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        {options.map((option, index) => (
          <ActionsheetItem
            key={index}
            onPress={() => {
              option.action();
            }}
            className="justify-start px-0"
          >
            <Box className="bg-brand-primary/40 rounded-full p-4">
              <Icon
                as={option.icon}
                size="lg"
                className="text-brand-primary w-5 h-5 "
              />
            </Box>
            <ActionsheetItemText className="text-gray-700 text-lg">
              {option.label}
            </ActionsheetItemText>
          </ActionsheetItem>
        ))}
      </ActionsheetContent>
    </Actionsheet>
  );
};

// Small component that renders a single provider card. Keeps local UI state contained here
function FeaturedCompanyItem({ provider }: { provider: ProviderData }) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  return (
    <VStack className="justify-center h-72 bg-white">
      <HStack space="lg" className="items-center p-4 w-full">
        <Avatar size="md">
          <AvatarFallbackText>{provider.providerName}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri:
                typeof (provider.providerLogo as MediaItem).thumbnail ===
                "string"
                  ? (provider.providerLogo as MediaItem).thumbnail
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
          className="ml-auto rotate-90 bg-black/40 border-0 w-10 h-9"
          onPress={() => setIsOptionsOpen(true)}
        >
          <ButtonIcon as={ThreeDotsIcon} size="xl" className="text-white" />
        </Button>
      </HStack>
      <MediaScroll
        mediaItems={(provider.providerImages || []).map((m) => ({
          type: (m as MediaItem).type,
          uri: (m as MediaItem).url,
          thumbnail: (m as MediaItem).thumbnail,
        }))}
      />
      {isOptionsOpen && (
        <ProviderOptions
          isOpen={isOptionsOpen}
          onClose={() => setIsOptionsOpen(false)}
          provider={provider}
        />
      )}
    </VStack>
  );
}

export default function FeaturedCompanies() {
  const { savedProviders, filteredProviders } = useGlobalStore();
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ProviderData>) => {
      return (
        <VStack>
          <FeaturedCompanyItem provider={item} />
        </VStack>
      );
    },
    []
  );

  return (
    <FlatList
      data={filteredProviders.length > 0 ? filteredProviders : savedProviders}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({});
