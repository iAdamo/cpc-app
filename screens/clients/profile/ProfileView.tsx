import React from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  ChevronRightIcon,
  HandshakeIcon,
  MapPinIcon,
  SirenIcon,
  BellDotIcon,
  NavigationIcon,
  UserRoundIcon,
  BookmarkCheckIcon,
  StarIcon,
  SettingsIcon,
} from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { Switch } from "@/components/ui/switch";
import { ScrollView } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ThreeDotsIcon } from "@/components/ui/icon";
import useGlobalStore from "@/store/globalStore";

const ProfileView = () => {
  const field = [
    {
      title: "Companies Center",
      info: [
        {
          text: "Personal Information",
          icon: UserRoundIcon,
          action: () => {},
        },
        {
          text: "Saved Companies",
          icon: BookmarkCheckIcon,
          action: () => {},
        },
        {
          text: "Reviews & Ratings",
          icon: StarIcon,
          action: () => {},
        },
        {
          text: "Invite Friends",
          icon: NavigationIcon,
          action: () => {},
        },
      ],
    },
    {
      title: "Settings",
      info: [
        {
          text: "Account",
          icon: SettingsIcon,
          action: () => {},
        },
        {
          text: "Notifications",
          icon: BellDotIcon,
          action: () => {},
        },
      ],
    },
    {
      title: "Resources",
      info: [
        {
          text: "Privacy Policy",
          icon: SirenIcon,
          action: () => {},
        },
        {
          text: "Terms & Conditions",
          icon: HandshakeIcon,
          action: () => {},
        },
      ],
    },
  ];
  const { user, currentLocation, switchRole, setSwitchRole } = useGlobalStore();

  return (
    <VStack className="flex-1 bg-white">
      <VStack className="relative">
        <VStack className="bg-brand-secondary/70 h-48 pt-20">
          <HStack className="w-full px-4 justify-between items-center">
            <HStack space="md" className="items-center">
              <Avatar size="lg">
                <AvatarFallbackText>{`${user?.firstName} ${user?.lastName}`}</AvatarFallbackText>
                <AvatarImage source={{ uri: user?.profilePicture }} />
              </Avatar>
              <HStack>
                <VStack>
                  <Heading className="text-yellow-900">{`${user?.firstName} ${user?.lastName}`}</Heading>
                  <HStack space="xs" className="items-center">
                    <Icon
                      size="sm"
                      as={MapPinIcon}
                      className="text-yellow-900"
                    />
                    <Text className="text-yellow-900">
                      {`${currentLocation?.region} ${currentLocation?.country}`}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </HStack>
            <Button
              variant="outline"
              onPress={() => {}}
              className="px-2 border-gray-100/30 bg-white/20 rounded-xl blur-md"
            >
              <ButtonIcon
                as={ThreeDotsIcon}
                className="rotate-90 w-6 h-6 text-yellow-900"
              />
            </Button>
          </HStack>
        </VStack>
        <Card className="flex-row rounded-xl justify-between items-center p-3 mx-4 bottom-6 shadow-lg bg-white">
          <Text size="lg" className="font-medium">
            Switch to Company
          </Text>
          <Switch
            size="md"
            trackColor={{ false: "#102343", true: "#525252" }}
            thumbColor="#fafafa"
            ios_backgroundColor="#d4d4d4"
            value={switchRole === "Provider"}
            onToggle={() =>
              setSwitchRole(user?.activeRoleId ? "Provider" : switchRole)
            }
          />
        </Card>
      </VStack>
      <ScrollView showsVerticalScrollIndicator={false}>
        {field.map((section, index) => (
          <VStack key={index} className="mt-4">
            <Heading className="px-4 mb-4 text-brand-primary">
              {section.title}
            </Heading>
            <VStack className="bg-white border-y border-gray-200">
              {section.info.map((item, idx) => (
                <Pressable
                  key={idx}
                  className="flex flex-row items-center gap-4 pl-4 data-[active=true]:bg-gray-100"
                  onPress={item.action}
                >
                  {item.icon && (
                    <Icon
                      as={item.icon}
                      className="w-7 h-7 text-brand-primary"
                    />
                  )}
                  <HStack
                    className={`flex-1 py-5 pr-4 items-center justify-between ${
                      idx !== section.info.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <Text size="xl">{item.text}</Text>
                    <Icon
                      as={ChevronRightIcon}
                      className="w-6 h-6 text-gray-400"
                    />
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </VStack>
        ))}
      </ScrollView>
    </VStack>
  );
};

export default ProfileView;
