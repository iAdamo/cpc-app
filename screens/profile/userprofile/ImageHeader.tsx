import { useState, useEffect, useCallback } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { AddIcon } from "@/components/ui/icon";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ImageBackground, StyleSheet } from "react-native";
import {
  ChevronLeftIcon,
  ThreeDotsIcon,
  CheckIcon,
} from "@/components/ui/icon";
import { router } from "expo-router";
import { Divider } from "@/components/ui/divider";
import { ProviderData } from "@/types";
import useGlobalStore from "@/store/globalStore";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { socketService, PresenceEvents } from "@/services/socketService";

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "space-between",
  },
});
const ImageHeader = ({ provider }: { provider: ProviderData }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [subData, setSubData] = useState<{
    providerId?: string;
    followersCount?: number;
    isFollowing?: boolean;
    followedBy?: string[];
  }>();
  const { user } = useGlobalStore();

  // setSubData((prev) => ({
  //   ...prev,
  //   isFollowing: provider.followedBy.some((p) => p._id === user?._id),
  // }));

  const handleFollow = useCallback(async () => {
    if (!provider || !provider._id) return;
    try {
      socketService.emitEvent(PresenceEvents.SUBSCRIBE, {
        userIds: [provider.owner],
      });
    } catch (error) {
      console.error("Error handling follow subscription:", error);
    }
  }, [provider]);

  useEffect(() => {
    setSubData((prev) => ({
      ...prev,
      isFollowing: provider.followedBy.some((id) => id === user?._id),
    }));
  }, []);

  useEffect(() => {
    const handleSubscribedEvent = (data: {
      providerId: string;
      followersCount: number;
      isFollowing: boolean;
      followedBy: string[];
    }) => {
      // console.debug({ data });
      if (!data.providerId || data.providerId !== provider._id) return;
      setSubData(data);
      useGlobalStore.setState((state) => {
        state.isFollowing = data.isFollowing;
      });
    };

    socketService.onEvent(
      PresenceEvents.SUBSCRIBED,
      handleSubscribedEvent as any
    );

    return () => {
      socketService.offEvent(PresenceEvents.SUBSCRIBED, handleSubscribedEvent);
    };
  }, [handleFollow]);

  const options = [
    { label: "Report", action: () => alert("Report") },
    { label: "Block", action: () => alert("Block") },
    { label: "Share", action: () => alert("Share") },
  ];

  // console.log(provider.providerImages[0]);

  // useEffect(() => {
  //   useGlobalStore.setState((state) => {
  //     state.isFollowing = Boolean(
  //       otherUser?.activeRoleId?.followedBy?.includes(state.user?._id || "")
  //     );
  //   });
  // }, [otherUser, isFollowing, user]);

  return (
    <VStack className="h-72">
      <ImageBackground
        source={{
          uri:
            typeof provider.providerImages[0] === "string"
              ? provider.providerImages[0]
              : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        }}
        style={styles.header}
      >
        <HStack className="justify-between items-center pt-14 px-4">
          <Button
            variant="outline"
            onPress={() => router.back()}
            className="px-2 border-gray-100/30 bg-gray-800/20 rounded-xl blur-md"
          >
            <ButtonIcon as={ChevronLeftIcon} className="text-white w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            onPress={() => setShowOptions((prev) => !prev)}
            className="px-2 border-gray-100/30 bg-gray-800/20 rounded-xl blur-md"
          >
            <ButtonIcon
              as={ThreeDotsIcon}
              className="rotate-90 text-white w-6 h-6"
            />
          </Button>
        </HStack>
        <HStack className="w-full bg-white/20 backdrop-blur-3xl px-4 py-2 justify-between items-center">
          <HStack>
            <VStack>
              <Heading className="text-white">{provider.reviewCount}</Heading>
              <Text className="text-white">
                {provider.reviewCount === 1 ? "review" : "reviews"}
              </Text>
            </VStack>
            <Divider orientation="vertical" className="mx-4 h-5 self-center" />
            <VStack>
              <Heading className="text-white">
                {subData?.followersCount || provider.followersCount}
              </Heading>
              <Text className="text-white">
                {subData?.followersCount || provider.followersCount === 1
                  ? "follower"
                  : "followers"}
              </Text>
            </VStack>
            {/* <Divider orientation="vertical" className="mx-4 h-5 self-center" />
            <VStack>
              <Heading className="text-white">30yrs</Heading>
              <Text className="text-white">exp</Text>
            </VStack> */}
          </HStack>
          {user?._id !== provider.owner && (
            <Button
              size="sm"
              variant="outline"
              className={
                subData?.isFollowing
                  ? "border-green-500 bg-green-600/20"
                  : "border-white bg-transparent"
              }
              onPress={handleFollow}
            >
              <ButtonIcon
                as={subData?.isFollowing ? CheckIcon : AddIcon}
                className={`${
                  subData?.isFollowing ? "text-white/80" : "text-white"
                } w-4 h-4`}
              />
              <ButtonText
                className={`${
                  subData?.isFollowing ? "text-white/80" : "text-white"
                }`}
              >
                {subData?.isFollowing ? "Following" : "Follow"}
              </ButtonText>
            </Button>
          )}
        </HStack>
      </ImageBackground>
      <Actionsheet isOpen={showOptions} onClose={() => setShowOptions(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Heading className="text-brand-primary font-medium self-start py-4 pl-6 border-b border-gray-200 w-full">
            Options
          </Heading>
          {options.map((option, index) => (
            <ActionsheetItem
              key={index}
              onPress={() => {
                option.action();
                setShowOptions(false);
              }}
              className="pl-6"
            >
              <ActionsheetItemText size="xl" className="">
                {option.label}
              </ActionsheetItemText>
            </ActionsheetItem>
          ))}
        </ActionsheetContent>
      </Actionsheet>
    </VStack>
  );
};

export default ImageHeader;
