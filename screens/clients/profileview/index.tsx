import React from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { ChevronRightIcon } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { Switch } from "@/components/ui/switch";
import useGlobalStore from "@/store/globalStore";

const field = {
  info: [
    {
      text: "Account Settings",
      icon: ChevronRightIcon,
      action: () => {
        // handle account settings navigation
      },
    },
    {
      text: "Notifications",
      icon: ChevronRightIcon,
      action: () => {
        // handle notifications navigation
      },
    },
    {
      text: "Help & Support",
      icon: ChevronRightIcon,
      action: () => {
        // handle help navigation
      },
    },
  ],
};

const ProfileScreen = () => {
  const { user, switchRole, setSwitchRole } = useGlobalStore();

  return (
    <VStack className="flex-1 bg-white">
      <Text size="xl" className="mb-4 mt-8 text-center font-bold">
        Profile
      </Text>
      <HStack className="items-center justify-between px-6 py-4">
        <Text size="lg">Provider Mode</Text>
        <Switch
          size="md"
          trackColor={{ false: "#d4d4d4", true: "#525252" }}
          thumbColor="#fafafa"
          ios_backgroundColor="#d4d4d4"
          value={switchRole === "Provider"}
          onToggle={() =>
            setSwitchRole(user?.activeRoleId ? "Provider" : switchRole)
          }
        />
      </HStack>
      <VStack className="mt-6">
        {field.info.map((tab, index) => (
          <Pressable
            key={index}
            className="flex flex-row items-center gap-4 px-4"
            onPress={tab.action}
          >
            {tab.icon && (
              <Icon as={tab.icon} className="w-7 h-7 text-brand-secondary" />
            )}
            <HStack
              className={`flex-1 py-5 items-center justify-between ${
                index !== field.info.length - 1
                  ? "border-b border-gray-200"
                  : ""
              }`}
            >
              <Text size="xl">{tab.text}</Text>
              <Icon as={ChevronRightIcon} className="w-6 h-6 text-gray-400" />
            </HStack>
          </Pressable>
        ))}
      </VStack>
    </VStack>
  );
};
