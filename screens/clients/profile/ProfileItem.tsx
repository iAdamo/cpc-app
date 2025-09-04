import React from "react";
import { Pressable } from "@/components/ui/pressable";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Icon, ChevronRightIcon } from "@/components/ui/icon";

interface ItemProps {
  text: string;
  icon: any;
  showDivider?: boolean;
  onPress: () => void;
}

const ProfileItem = ({
  text,
  icon,
  showDivider = false,
  onPress,
}: ItemProps) => (
  <Pressable
    className="flex flex-row items-center gap-4 pl-4 data-[active=true]:bg-gray-100"
    onPress={onPress}
  >
    <Icon as={icon} className="w-7 h-7 text-brand-primary" />
    <HStack
      className={`flex-1 py-5 pr-4 items-center justify-between ${
        showDivider ? "border-b border-gray-200" : ""
      }`}
    >
      <Text size="xl">{text}</Text>
      <Icon as={ChevronRightIcon} className="w-6 h-6 text-gray-400" />
    </HStack>
  </Pressable>
);

export default ProfileItem;
