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
import { ProviderData } from "@/types";

const ProfileInfo = ({ provider }: { provider: any | null }) => {
  return (
    <VStack className="bg-white">
      {/* Profile Info Section */}
      <VStack className="">
        <HStack className="justify-between">
          <Card className="w-1/2 gap-2 items-start">
            <Heading className="font-semibold">
              {provider?.providerName || "Alejandro De'Armas"}
            </Heading>
            <Text>{provider.category || "Tree Felling"}</Text>
            <HStack space="xs" className="items-center ">
              <Icon as={MapPinIcon} size="sm" className="text-gray-500" />
              <Text className="break-words">{provider.location || "Florida, United States"}</Text>
            </HStack>
          </Card>
          <Card className="gap-2 items-end">
            <HStack space="xs" className="items-center">
              <Icon as={DotIcon} className="text-green-500 " />
              <Text className="text-green-500">Unavailable</Text>
            </HStack>
            <Text>Last active 2 hours ago</Text>
            <HStack className="gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-0 bg-gray-200/50 px-2"
              >
                <ButtonIcon as={PhoneIcon} className="text-brand-primary" />
                <ButtonText className="text-brand-primary">Call</ButtonText>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-0 bg-gray-200/50 px-2"
              >
                <ButtonIcon
                  as={MessageSquareTextIcon}
                  className="text-brand-primary"
                />
                <ButtonText className="text-brand-primary">Message</ButtonText>
              </Button>
            </HStack>
          </Card>
        </HStack>
      </VStack>
    </VStack>
  );
};

export default ProfileInfo;
