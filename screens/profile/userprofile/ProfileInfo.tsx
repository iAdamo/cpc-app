import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import {
  DotIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  PhoneIcon,
} from "lucide-react-native";
import { ProviderData, EditableFields } from "@/types";
import useGlobalStore from "@/store/globalStore";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { router } from "expo-router";
import { getLastSeen } from "@/services/axios/chat";
import DateFormatter from "@/utils/DateFormat";
import chatService from "@/services/chatService";
import { GooglePlaceService } from "@/services/googlePlaceService";

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
  const [lastSeen, setLastSeen] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const {
    user,
    switchRole,
    updateUserProfile,
    createChat,
    selectedChat,
    setCurrentView,
  } = useGlobalStore();
  // console.log({ provider });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const lastSeen = await getLastSeen(provider.owner);

        if (!mounted) return;
        if (lastSeen) {
          setLastSeen(lastSeen.lastSeen);
          setIsOnline(lastSeen.isOnline);
        }
      } catch (error) {
        console.error("Failed to fetch last seen:", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [provider.owner]);

  const handleJoinChat = async () => {
    await createChat(provider.owner);
    setCurrentView("Chat");
    if (!selectedChat) return;
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
            <Button
              variant="outline"
              className="h-auto py-2 border-0 bg-gray-200/50 "
            >
              <ButtonIcon as={MapPinIcon} size="md" className="text-red-600" />
              <ButtonText className=" text-sm">
                {provider.location.primary?.address?.address ||
                  "Florida, United States"}
              </ButtonText>
            </Button>
          </Card>
          <Card className="gap-2 items-end flex-1">
            <HStack space="xs" className="items-center">
              {/* availability indicator */}
              <Badge
                action={isOnline ? "success" : "muted"}
                className="px-2 py-1"
              >
                <BadgeIcon
                  as={DotIcon}
                  className={`w-3 h-3 ${
                    isOnline ? "text-green-600" : "text-gray-500"
                  }`}
                />
                <BadgeText className="text-sm">
                  {isOnline ? "Available" : "Unavailable"}
                </BadgeText>
              </Badge>
            </HStack>
            {switchRole === "Client" && user?._id === provider.owner && (
              <VStack className="items-end gap-2">
                {!isOnline && <Text>{DateFormatter.toRelative(lastSeen)}</Text>}
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
