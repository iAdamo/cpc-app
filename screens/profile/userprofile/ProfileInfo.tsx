import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Link, LinkText } from "@/components/ui/link";
import { MessageSquareTextIcon, PhoneIcon } from "lucide-react-native";
import {
  ProviderData,
  EditableFields,
  EventEnvelope,
  ResEventEnvelope,
  PresenceResponse,
  Presence,
} from "@/types";
import useGlobalStore from "@/store/globalStore";
import { Badge, BadgeText } from "@/components/ui/badge";
import { router } from "expo-router";
import { getLastSeen } from "@/services/axios/chat";
import DateFormatter from "@/utils/DateFormat";
import PresenceBadge from "@/components/PresenceBadge";
import { socketService } from "@/services/socketService";
import { PresenceEvents } from "@/services/socketService";

const ProfileInfo = ({
  provider,
  isSticky,
  onLayout,
}: {
  provider: ProviderData;
  isSticky: boolean;
  isEditable: boolean;
  editingFields: Partial<Record<EditableFields, string>>;
  handleSave: () => void;
  handleEditStart: (fields: Partial<Record<EditableFields, string>>) => void;
  handleCancelEdit: () => void;
  onLayout: any;
}) => {
  const {
    user,
    switchRole,
    updateUserProfile,
    createChat,
    selectedChat,
    setCurrentView,
    otherAvailability,
    setOtherAvailability,
    currentView,
  } = useGlobalStore();

  // console.log({ provider });
  const handleJoinChat = async () => {
    await createChat(provider.owner);
    setCurrentView("Chat");
    const selectedChat = useGlobalStore.getState().selectedChat;
    if (!selectedChat) return;
    router.push({
      pathname: "/chat/[id]",
      params: { id: selectedChat._id },
    });
  };

  useEffect(() => {
    if (user?._id === provider.owner) return;
    // Request current presence
    socketService.emitEvent(PresenceEvents.GET_STATUS, {
      targetId: provider.owner,
    });
    const handleStatusResponse = (envelope: ResEventEnvelope) => {
      let data: PresenceResponse;
      data = envelope.payload;
      console.log({ data });

      if (envelope.targetId === user?._id || data.userId !== envelope.targetId)
        return;

      setOtherAvailability({
        lastSeen: data.lastSeen,
        status: data.customStatus || data?.status,
        isOnline: data.isOnline,
      });
    };

    // When presence changes
    const handleStatusChange = (envelope: EventEnvelope) => {
      console.log("change", { envelope });

      const data = envelope.payload;
      if (data.userId !== user?._id) return;
      // console.log(envelope.payload);

      setOtherAvailability({
        lastSeen: data.lastSeen,
        status: data.status,
        isOnline: data.isOnline,
      });
    };

    socketService.onEvent(PresenceEvents.STATUS_CHANGE, handleStatusChange);
    socketService.onEvent(PresenceEvents.STATUS_RESPONSE, handleStatusResponse);
    return () => {
      socketService.offEvent(PresenceEvents.STATUS_CHANGE, handleStatusChange);
      socketService.offEvent(
        PresenceEvents.STATUS_RESPONSE,
        handleStatusResponse
      );
    };
  }, []);

  return (
    <VStack
      onLayout={onLayout}
      className={`bg-white ${isSticky ? "pt-8" : ""}`}
    >
      {/* Profile Info Section */}
      <VStack className="">
        <HStack className="">
          <Card className="w-1/2 gap-2 items-start">
            <HStack space="xs">
              <Heading size="xl" className="flex-1">
                {provider?.providerName || "Alejandro De'Armas"}
              </Heading>
              <Badge
                action={provider?.isVerified ? "success" : "muted"}
                className="ml-2 h-6"
              >
                <BadgeText>
                  {provider?.isVerified ? "Verified" : "Unverified"}
                </BadgeText>
              </Badge>
            </HStack>

            <Text size="lg" className="font-bold">
              {provider.subcategories[0].name || "Tree Felling"}
            </Text>
            <Link
              className=" rounded-md data-[active=true]:bg-blue-200"
              onPress={() => setCurrentView("Map")}
            >
              {/* <ButtonIcon as={MapPinIcon} size="md" className="text-red-600" /> */}
              <LinkText className=" font-medium data-[active=true]:text-blue-200">
                {provider.location.primary?.address?.address ||
                  "Florida, United States"}
              </LinkText>
            </Link>
          </Card>
          <Card className="gap-2 items-end flex-1">
            {/** Presence badge */}
            <PresenceBadge
              presence={otherAvailability}
              className=""
              iconSize={12}
            />
            {switchRole === "Client" && user?._id !== provider.owner && (
              <VStack className="items-end gap-2">
                <HStack className="gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => {}}
                    className="border-0 bg-gray-200/50 px-2"
                  >
                    <ButtonIcon as={PhoneIcon} className="text-brand-primary" />
                    <ButtonText className="text-brand-primary">Call</ButtonText>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-0 bg-gray-200/50 px-2"
                    onPress={handleJoinChat}
                  >
                    <ButtonIcon
                      as={MessageSquareTextIcon}
                      className="text-brand-primary"
                    />
                    <ButtonText className="text-brand-primary">
                      Message
                    </ButtonText>
                  </Button>
                </HStack>
              </VStack>
            )}
          </Card>
        </HStack>
        {/* <SocialMediaDetails
          provider={provider}
          isEditable={isEditable}
        /> */}
      </VStack>
    </VStack>
  );
};

export default ProfileInfo;
