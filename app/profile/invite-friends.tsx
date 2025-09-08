import { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Share } from "react-native";
import { Card } from "@/components/ui/card";
import { Icon, UsersIcon } from "@/components/ui/icon";

const INVITE_MESSAGE =
  "Join me on CPC App! Discover and connect with top service providers. Download now: https://yourapp.link";

const InviteFriends = () => {
  const [email, setEmail] = useState("");

  const handleShare = async () => {
    try {
      await Share.share({
        message: INVITE_MESSAGE,
      });
    } catch (error) {
      // Optionally handle error
    }
  };

  const handleSendEmail = () => {
    // Here you could integrate with your backend to send an invite email
    // For now, just clear the input
    setEmail("");
    alert("Invitation sent!");
  };

  return (
    <VStack className="flex-1 bg-white px-6 py-10 space-y-8">
      <VStack className="pt-14">
      <HStack className="justify-center items-center mb-4">
        <Icon as={UsersIcon} className="w-10 h-10 text-brand-primary mr-2" />
        <Heading size="2xl" className="text-brand-primary">
          Invite Friends
        </Heading>
      </HStack>
      <Card className="p-6 mb-4 bg-brand-primary/10">
        <Text size="lg" className="text-brand-primary mb-2">
          Share the app with your friends!
        </Text>
        <Button className="w-full mb-2" onPress={handleShare}>
          <ButtonText>Share Invite Link</ButtonText>
        </Button>
      </Card>
      <Card className="p-6">
        <Text size="lg" className="mb-2">
          Or invite by email:
        </Text>
        <HStack className="items-center space-x-2">
          <Input className="flex-1">
            <InputField
              placeholder="Enter friend's email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
          <Button onPress={handleSendEmail} isDisabled={!email}>
            <ButtonText>Send</ButtonText>
          </Button>
        </HStack>
      </Card>
    </VStack>
    </VStack>
  );
};

export default InviteFriends;
