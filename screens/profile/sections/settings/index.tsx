import { useState } from "react";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { Icon, ChevronRightIcon } from "@/components/ui/icon";
import { LogOutIcon } from "lucide-react-native";
import { router } from "expo-router";
import ChangePassword from "./ChangePassword";
import LogoutActionSheet from "@/components/LogoutActionSheet";

const AccountSettings = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [view, setView] = useState<string>("");
  const [isLogoutSheetOpen, setIsLogoutSheetOpen] = useState(false);

  const settings = [
    {
      title: "Password Management",
      items: [
        {
          text: "Change Password",
          action: () => setView("Password Management"),
        },
        {
          text: "Retrieve Password",
          action: () => router.push("/profile/saved-companies"),
        },
      ],
    },
    {
      title: "Account Management",
      items: [
        {
          text: "Deactivation and Deletion",
          action: () => router.push("/profile/settings"),
        },
      ],
    },
  ];

  return (
    <VStack className="flex-1 bg-white">
      {/* Sections */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {settings.map((setting, idx) => (
          <VStack key={idx} className="mt-4">
            <Heading size="xl" className="px-4 mb-4 text-brand-primary">
              {setting.title}
            </Heading>
            <VStack className="bg-white">
              {setting.items.map((item, indx) => (
                <Pressable
                  key={indx}
                  className="flex flex-row items-center gap-4 pl-4 bg-gray-50 data-[active=true]:bg-transparent"
                  onPress={item.action}
                >
                  <HStack
                    className={`flex-1 py-4 pr-4 items-center justify-between ${
                      idx !== setting.items.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <Text size="xl" className="font-medium">
                      {item.text}
                    </Text>
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
        <Pressable
          onPress={() => {
            setIsLogoutSheetOpen(true);
          }}
          className="flex flex-row items-center gap-4 mt-16 p-4 border-y border-gray-200 bg-gray-100 data-[active=true]:bg-transparent"
        >
          <HStack className="gap-4">
            <Icon as={LogOutIcon} className="w-6 h-6 text-red-500" />
            <Text size="xl" className="font-medium text-red-500">
              Logout
            </Text>
          </HStack>
        </Pressable>
      </ScrollView>
      <ChangePassword
        isOpen={view === "Password Management"}
        onClose={() => setView("")}
      />
      <LogoutActionSheet
        isOpen={isLogoutSheetOpen}
        onClose={() => setIsLogoutSheetOpen(false)}
      />
    </VStack>
  );
};

export default AccountSettings;
