import React, { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import {
  DotIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  PhoneIcon,
} from "lucide-react-native";
import { ProviderData, EditableFields } from "@/types";
import useGlobalStore from "@/store/globalStore";
import appendFormData from "@/utils/AppendFormData";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { router } from "expo-router";

const ProfileInfo = ({
  provider,
  isSticky,
  isEditable,
  editingFields,
  handleSave,
  handleEditStart,
  handleCancelEdit,
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
    isAvailable,
    createChat,
    selectedChat,
    setCurrentView,
  } = useGlobalStore();
  // console.log({ provider });

  const handleJoinChat = async () => {
    setCurrentView("Chat");
    await createChat(provider.owner);
    if (!selectedChat) {
      router.push({
        pathname: "/chat/[id]",
        params: { id: useGlobalStore.getState().selectedChat?._id || "" },
      });
      return;
    }
    router.push({
      pathname: "/chat/[id]",
      params: { id: selectedChat._id },
    });
  };

  return (
    <VStack
      onLayout={onLayout}
      className={`bg-white ${isSticky ? "pt-8" : ""}`}
    >
      {/* Profile Info Section */}
      <VStack className="">
        <HStack className="justify-between">
          <Card className="w-1/2 gap-2 items-start">
            <HStack space="xs" className="">
              <Heading size="xl" className="">
                {provider?.providerName || "Alejandro De'Armas"}
              </Heading>
              <Badge
                action={provider?.isVerified ? "success" : "muted"}
                className="ml-2"
              >
                <BadgeText>
                  {provider?.isVerified ? "Verified" : "Unverified"}
                </BadgeText>
              </Badge>
            </HStack>

            <Text size="lg" className="font-bold">
              {provider.subcategories[0].name || "Tree Felling"}
            </Text>
            <HStack space="xs" className="items-center ">
              <Icon as={MapPinIcon} size="md" className="text-red-600" />
              <Text className="break-words">
                {provider.location.primary?.address?.address ||
                  "Florida, United States"}
              </Text>
            </HStack>
          </Card>
          <Card className="gap-2 items-end flex-1">
            <HStack space="xs" className="items-center">
              {/* availability indicator */}
              <Badge
                action={isAvailable ? "success" : "muted"}
                className="px-2 py-1"
              >
                <BadgeIcon
                  as={DotIcon}
                  className={`w-3 h-3 ${
                    isAvailable ? "text-green-600" : "text-gray-500"
                  }`}
                />
                <BadgeText className="text-sm">
                  {isAvailable ? "Available" : "Unavailable"}
                </BadgeText>
              </Badge>
            </HStack>
            {switchRole === "Client" && user?._id !== provider.owner && (
              <VStack>
                <Text>Last active 2 hours ago</Text>
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
