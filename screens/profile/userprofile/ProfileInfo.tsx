import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Link, LinkText } from "@/components/ui/link";
import { MessageSquareTextIcon, PhoneIcon } from "lucide-react-native";
import { ProviderData, EditableFields } from "@/types";
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
  const { user, switchRole, createChat, setCurrentView } = useGlobalStore();

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

  const { otherAvailability } = useProfilePresence(provider);

  return (
    <VStack
      onLayout={onLayout}
      className={`bg-white ${isSticky ? "pt-8" : ""}`}
    >
      {/* Profile Info Section */}
      <VStack className="rounded-lg shadow-lg p-4 m-4 bg-white">
        <HStack className="">
          <Card className="w-1/2 gap-2 p-0 items-start rounded-none">
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
          <Card className="gap-2 items-end flex-1 rounded-none p-0">
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
      </VStack>
    </VStack>
  );
};

export default ProfileInfo;
