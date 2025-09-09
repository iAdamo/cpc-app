import React from "react";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Icon, ThreeDotsIcon } from "@/components/ui/icon";
import { MapPinIcon } from "lucide-react-native";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import useGlobalStore from "@/store/globalStore";
import ProfileSection from "./ProfileSection";
import { useNavigation } from "expo-router";
import {
  UserRoundIcon,
  BookmarkCheckIcon,
  StarIcon,
  NavigationIcon,
  SettingsIcon,
  BellDotIcon,
  SirenIcon,
  HandshakeIcon,
} from "lucide-react-native";
import { router } from "expo-router";

const Profile = () => {
  const { user, currentLocation, switchRole, setSwitchRole } = useGlobalStore();

  const profileSections = [
    {
      title: "Companies Center",
      items: [
        {
          text: "Personal Information",
          icon: UserRoundIcon,
          action: () => router.push("/profile/personal-info"),
        },
        {
          text: "Saved Companies",
          icon: BookmarkCheckIcon,
          action: () => router.push("/profile/saved-companies"),
        },
        {
          text: "Reviews & Ratings",
          icon: StarIcon,
          action: () => router.push("/profile/reviews-ratings"),
        },
        {
          text: "Invite Friends",
          icon: NavigationIcon,
          action: () => router.push("/profile/invite-friends"),
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          text: "Account",
          icon: SettingsIcon,
          action: () => router.push("/profile/settings"),
        },
        {
          text: "Notifications",
          icon: BellDotIcon,
          action: () => router.push("/profile/notifications"),
        },
      ],
    },
    {
      title: "Resources",
      items: [
        {
          text: "Privacy Policy",
          icon: SirenIcon,
          action: () => router.push("/profile/privacy-policy"),
        },
        {
          text: "Terms & Conditions",
          icon: HandshakeIcon,
          action: () => router.push("/profile/terms"),
        },
      ],
    },
  ];

  return (
    <VStack className="flex-1 bg-white">
      {/* Header */}
      <VStack className="relative">
        <VStack className="bg-brand-secondary/70 h-48 pt-20">
          <HStack className="w-full px-4 justify-between items-center">
            <HStack space="md" className="items-center">
              <Avatar size="lg">
                <AvatarFallbackText>
                  {`${user?.firstName} ${user?.lastName}`}
                </AvatarFallbackText>
                <AvatarImage source={{ uri: user?.profilePicture }} />
              </Avatar>
              <VStack>
                <Heading className="text-yellow-900">{`${user?.firstName} ${user?.lastName}`}</Heading>
                <HStack space="xs" className="items-center">
                  <Icon size="sm" as={MapPinIcon} className="text-yellow-900" />
                  <Text className="text-yellow-900">
                    {`${currentLocation?.region} ${currentLocation?.country}`}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
            <Button
              variant="outline"
              className="px-2 border-gray-100/30 bg-white/20 rounded-xl"
            >
              <ButtonIcon
                as={ThreeDotsIcon}
                className="rotate-90 w-6 h-6 text-yellow-900"
              />
            </Button>
          </HStack>
        </VStack>
        <Card className="flex-row rounded-xl justify-between items-center p-0 px-4 mx-4 bottom-6 shadow-lg bg-white">
          <Text size="lg" className="font-medium">
            Switch to Company
          </Text>
          <Switch
            size="md"
            value={switchRole === "Provider"}
            onToggle={() =>
              setSwitchRole(user?.activeRoleId ? "Provider" : switchRole)
            }
          />
        </Card>
      </VStack>

      {/* Sections */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {profileSections.map((section, idx) => (
          <ProfileSection
            key={idx}
            title={section.title}
            items={section.items}
          />
        ))}
      </ScrollView>
    </VStack>
  );
};

export default Profile;
