import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Link, LinkText } from "@/components/ui/link";
import { MessageSquareTextIcon, PhoneIcon } from "lucide-react-native";
import { ProviderData, EditableFields, PresenceResponse } from "@/types";
import useGlobalStore from "@/store/globalStore";
import { Badge, BadgeText } from "@/components/ui/badge";
import { router } from "expo-router";
import PresenceBadge from "@/components/PresenceBadge";
import { useProfilePresence } from "@/hooks/useProfilePresence";

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
  const { user, switchRole, createChat, setCurrentView, availability } =
    useGlobalStore();

  const isCurrentUser = user?._id === provider.owner;

  // console.log({ provider });
  const handleJoinChat = async () => {
    const chatId = await createChat(provider.owner);
    if (!chatId) return;
    setCurrentView("Chat");
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId },
    });
  };

  const { otherAvailability } = useProfilePresence(provider);

  return (
    <VStack
      onLayout={onLayout}
      className={`bg-white ${isSticky ? "pt-8" : ""}`}
    >
      {/* Profile Info Section */}
      <VStack className="">
        <Card className="flex-row">
          <VStack className="w-1/2 gap-2 items-start">
            <HStack space="xs">
              <Heading size="lg" className="flex-1">
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

            <Text size="md" className="font-bold">
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
          </VStack>
          <VStack className="gap-2 items-end flex-1 ">
            {/** Presence badge */}
            <PresenceBadge
              presence={
                isCurrentUser
                  ? ({
                      customStatus: "online",
                      isOnline: true,
                      status: "online",
                    } as PresenceResponse)
                  : otherAvailability
              }
              className=""
              iconSize={12}
            />

            {switchRole === "Client" && !isCurrentUser && (
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
          </VStack>
        </Card>
      </VStack>
    </VStack>
  );
};

export default ProfileInfo;
