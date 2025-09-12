import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { ChevronLeftIcon } from "@/components/ui/icon";
import { router } from "expo-router";
import {
  Navigation2Icon,
  Share,
  Users,
  Gift,
  Copy,
  Check,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { ShareService } from "@/services/ShareService";

const InviteFriends = () => {
  return (
    <VStack className="flex-1 bg-white">
      <VStack className="mt-14">
        <Button
          size="xl"
          variant="link"
          onPress={router.back}
          className="w-40 ml-4"
        >
          <ButtonIcon
            as={ChevronLeftIcon}
            className="w-7 h-7 text-typography-700"
          />
          <ButtonText className="text-typography-700 data-[active=true]:no-underline">
            Invite Friends
          </ButtonText>
        </Button>
      </VStack>

    </VStack>
  );
};

export default InviteFriends;
