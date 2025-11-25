import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Link, LinkText } from "@/components/ui/link";
import { MessageSquareTextIcon, PhoneIcon } from "lucide-react-native";
import { ProviderData, EditableFields, Presence } from "@/types";
import useGlobalStore from "@/store/globalStore";
import { Badge, BadgeText } from "@/components/ui/badge";
import { router } from "expo-router";
import { getLastSeen } from "@/services/axios/chat";
import DateFormatter from "@/utils/DateFormat";
import PresenceBadge from "@/components/PresenceBadge";

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
  const [presence, setPresence] = useState<Presence>();
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
        const presence = await getLastSeen(provider.owner);
        if (!mounted) return;
        if (presence) setPresence(presence);
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
    const selectedChat = useGlobalStore.getState().selectedChat;
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
            <PresenceBadge presence={presence} className="" iconSize={12} />
            {switchRole === "Client" && user?._id !== provider.owner && (
              <VStack className="items-end gap-2">
                {!presence?.isOnline && (
                  <Text>{DateFormatter.toRelative(presence?.lastSeen!)}</Text>
                )}
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
