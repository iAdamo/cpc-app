import { useState, useEffect, useCallback, use } from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ThreeDotsIcon } from "@/components/ui/icon";
import { Icon, AddIcon, CloseIcon, ShareIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import {
  FlagIcon,
  UserRoundPlusIcon,
  UserRoundXIcon,
  HeartPlusIcon,
  HeartMinusIcon,
  StarIcon,
  MapPinIcon,
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
import { router } from "expo-router";
import RatingSection from "@/components/RatingFunction";
import { getFeaturedProviders, globalSearch } from "@/services/axios/search";
import { current } from "immer";

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

// Featured provider badge component
const FeaturedBadge = () => (
  <Badge action="success" className="ml-2">
    <BadgeText>⭐ Featured</BadgeText>
  </Badge>
);

function FeaturedCompanyItem({ provider }: { provider: ProviderData }) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  return (
    <VStack className="justify-center h-72 bg-white gap-2">
      <HStack space="lg" className="items-center w-full px-4">
        <Pressable
          onPress={() => {
            router.push({
              pathname: "/profile/[id]",
              params: { id: provider.owner },
            });
          }}
          className="flex flex-row gap-4 mt-4 items-start"
        >
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
          <VStack className="items-start">
            <HStack space="sm" className="items-start">
              <Heading className="">{provider.providerName}</Heading>
              <Badge
                // action={!provider?.isVerified ? "success" : "muted"}
                action="success"
                className=""
              >
                <BadgeText>
                  {!provider?.isVerified ? "Verified" : "Unverified"}
                </BadgeText>
              </Badge>
            </HStack>
            <HStack space="md" className="items-end">
              <Text size="sm" className="font-medium">
                {provider.subcategories[0].name}
              </Text>
              <RatingSection
                rating={provider.averageRating}
                reviewCount={provider.reviewCount}
              />
            </HStack>

            {provider.location?.primary?.address && (
              <HStack className="">
                <Icon
                  as={MapPinIcon}
                  size="sm"
                  className="text-gray-500 mr-2"
                />
                <Text size="xs" className="text-gray-600">
                  {[
                    provider.location.primary.address.city,
                    provider.location.primary.address.state,
                    provider.location.primary.address.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </HStack>
            )}
          </VStack>
        </Pressable>
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
// Empty state component
const EmptyFeaturedState = () => (
  <VStack className="items-center justify-center py-12 px-4">
    <Icon as={StarIcon} size="xl" className="text-gray-300 mb-4" />
    <Heading size="lg" className="text-gray-500 mb-2">
      No Featured Providers
    </Heading>
    <Text className="text-gray-400 text-center">
      There are no featured providers in your area yet.
    </Text>
  </VStack>
);

// Loading skeleton
const LoadingSkeleton = () => (
  <VStack className="h-72 bg-gray-100 rounded-lg mb-4 p-4 animate-pulse">
    <HStack className="items-center">
      <Box className="w-12 h-12 bg-gray-300 rounded-full" />
      <VStack className="ml-4 flex-1">
        <Box className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
        <Box className="h-3 bg-gray-300 rounded w-1/2" />
      </VStack>
    </HStack>
    <Box className="mt-4 h-40 bg-gray-300 rounded" />
  </VStack>
);

export default function FeaturedCompanies() {
  const { currentLocation } = useGlobalStore();
  const [featuredProviders, setFeaturedProviders] = useState<ProviderData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredRatio, setFeaturedRatio] = useState<number>(0);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    hasMore: true,
  });

  const loadFeaturedProviders = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getFeaturedProviders({
        page,
        limit: 10,
        lat: currentLocation?.coords.latitude?.toString(),
        long: currentLocation?.coords.longitude?.toString(),
        state: currentLocation?.region || "",
        country: currentLocation?.country || "",
        radius: "20000", // 20km radius for broader local results
      });

      if (isRefresh || page === 1) {
        setFeaturedProviders(result.providers);
      } else {
        setFeaturedProviders((prev) => [...prev, ...result.providers]);
      }

      setFeaturedRatio(result.featuredRatio || 0);
      setPageInfo({
        page: result.page,
        totalPages: result.totalPages,
        hasMore: result.page < result.totalPages,
      });
    } catch (error) {
      console.error("Error loading featured providers:", error);
      // Fallback to search endpoint if location endpoint fails
      try {
        const fallbackResult = await globalSearch({
          model: "providers",
          page,
          limit: 10,
          engine: true,
          featured: true,
          lat: currentLocation?.coords.latitude?.toString(),
          long: currentLocation?.coords.longitude?.toString(),
          state: currentLocation?.region || "",
          country: currentLocation?.country || "",
        });

        if (isRefresh || page === 1) {
          setFeaturedProviders(fallbackResult.providers);
        } else {
          setFeaturedProviders((prev) => [
            ...prev,
            ...fallbackResult.providers,
          ]);
        }
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeaturedProviders(1);
  }, [currentLocation]);

  const handleRefresh = () => {
    loadFeaturedProviders(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && pageInfo.hasMore) {
      loadFeaturedProviders(pageInfo.page + 1);
    }
  };

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ProviderData>) => {
      return (
        <Box className="px-4">
          <FeaturedCompanyItem provider={item} />
        </Box>
      );
    },
    []
  );

  const renderHeader = () => (
    <VStack className="px-4 pt-6 pb-4 bg-white">
      <HStack className="items-center justify-between">
        <Heading size="xl" className="text-brand-primary">
          Featured Companies
        </Heading>
      </HStack>
    </VStack>
  );

  const renderFooter = () => {
    if (loading && !refreshing && featuredProviders.length > 0) {
      return <LoadingSkeleton />;
    }

    if (!pageInfo.hasMore && featuredProviders.length > 0) {
      return (
        <Box className="py-6 items-center">
          <Text className="text-gray-500">No more featured providers</Text>
        </Box>
      );
    }

    return null;
  };

  if (loading && featuredProviders.length === 0) {
    return (
      <VStack className="flex-1 bg-gray-50">
        {renderHeader()}
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </VStack>
    );
  }

  return (
    <FlatList
      data={featuredProviders}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={!loading ? <EmptyFeaturedState /> : null}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#007AFF"]}
          tintColor="#007AFF"
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <Box className="h-2" />}
    />
  );
}
