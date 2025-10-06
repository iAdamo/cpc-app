import { useState, useEffect, useCallback } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { ScrollView, Keyboard } from "react-native";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  AvatarBadge,
} from "@/components/ui/avatar";
import {
  Icon,
  ChevronLeftIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowLeftIcon,
  LinkIcon,
  PaperclipIcon,
  PhoneIcon,
  ThreeDotsIcon,
} from "@/components/ui/icon";
import { FlatList, ListRenderItem } from "react-native";
import useGlobalStore from "@/store/globalStore";
import { Message } from "@/types";
import { useLocalSearchParams } from "expo-router";
import {
  CameraIcon,
  MicIcon,
  NavigationIcon,
  PinIcon,
  PinOff,
} from "lucide-react-native";
import { KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import chatService from "@/services/chatService";

const MessageView = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, selectedChat, messages, hasMoreMessages, loadMoreMessages } =
    useGlobalStore();

  if (!selectedChat || selectedChat._id !== id) return <Text>Loading...</Text>;

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item: message }) => {
      return (
        <Pressable
          className={`p-2 m-1 max-w-[80%] flex-1 ${
            message.senderId._id === user?._id
              ? "bg-blue-500 self-end rounded-r rounded-bl"
              : "bg-gray-200 self-start rounded-l rounded-br"
          }`}
        >
          <Text
            className={`${
              message.senderId._id === user?._id ? "text-white" : "text-black"
            }`}
          >
            {message.content?.text}
          </Text>
        </Pressable>
      );
    },
    []
  );

  const Headerbar = () => {
    // console.log(selectedChat.participants[0]);
    const otherParticipant = selectedChat.participants[0];

    // online status
    const [isOnline, setIsOnline] = useState<boolean | null>(null);
    useEffect(() => {
      let isMounted = true;
      const checkStatus = async () => {
        if (user?._id) {
          const status = await chatService.checkOnlineStatus(
            otherParticipant._id
          );
          if (isMounted) setIsOnline(status);
        }
      };
      checkStatus();
      return () => {
        isMounted = false;
      };
    }, [otherParticipant._id]);

    return (
      <VStack className="mt-16">
        <HStack>
          <HStack className="flex-1 items-center gap-2">
            <Button
              variant="outline"
              className="border-0 p-0 w-10 h-10 data-[active=true]:bg-transparent"
              onPress={() => {
                Keyboard.dismiss();
                router.back();
              }}
            >
              <ButtonIcon as={ArrowLeftIcon} />
            </Button>
            <HStack className="items-center gap-2">
              <Avatar size="md">
                <AvatarFallbackText>
                  {otherParticipant?.activeRoleId?.providerName}
                </AvatarFallbackText>
                <AvatarImage
                  source={
                    typeof otherParticipant?.activeRoleId?.providerLogo ===
                    "string"
                      ? { uri: otherParticipant?.activeRoleId?.providerLogo }
                      : undefined
                  }
                />
                {/** online status */}
                <AvatarBadge
                  size="lg"
                  className={` ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
                />
              </Avatar>
              <VStack>
                <Heading>
                  {otherParticipant?.activeRoleId?.providerName}
                </Heading>
                <Text size="sm" className="text-typography-500">
                  {isOnline ? "Online" : "Offline"}
                </Text>
              </VStack>
            </HStack>
          </HStack>
          <HStack>
            <Button
              variant="outline"
              className="border-0 p-0 w-10 h-10 data-[active=true]:bg-transparent"
            >
              <ButtonIcon as={PhoneIcon} className="text-brand-primary" />
            </Button>
            <Button
              variant="outline"
              className="border-0 p-0 w-10 h-10 data-[active=true]:bg-transparent"
            >
              <ButtonIcon
                as={ThreeDotsIcon}
                className="text-brand-primary rotate-90"
              />
            </Button>
          </HStack>
        </HStack>
      </VStack>
    );
  };

  const FooterTextInput = () => {
    const [inputMessage, setInputMessage] = useState<string>("");
    return (
      <VStack
        className="flex-1 justify-end"
        // onLayout={
        // avoid keyboard
      >
        <HStack space="sm" className="justify-center items-center">
          <Button
            variant="outline"
            className="border-0 p-0 w-10 h-10 data-[active=true]:bg-transparent"
          >
            <ButtonIcon
              as={PaperclipIcon}
              className="text-brand-primary w-7 h-7"
            />
          </Button>
          <Textarea className="flex-1 h-14 rounded-xl border-0 bg-typography-50 data-[focus=true]:border-brand-primary/30 focus:bg-white">
            <TextareaInput
              placeholder="Write your message"
              onChangeText={(text) => setInputMessage(text)}
              value={inputMessage}
              className=" focus:bg-blue-50 text-lg rounded-xl "
              multiline
              numberOfLines={99999999999}
            />
          </Textarea>
          {inputMessage ? (
            <Button
              variant="outline"
              className="border-0  ml-2 bg-brand-primary data--[active=true]:bg-transparent"
            >
              <ButtonIcon
                as={NavigationIcon}
                className="text-brand-secondary"
              />
            </Button>
          ) : (
            <HStack className="items-center">
              <Button
                variant="outline"
                className="border-0 p-0 w-10 h-10 data-[active=true]:bg-transparent"
              >
                <ButtonIcon
                  as={CameraIcon}
                  className="text-brand-primary w-7 h-7"
                />
              </Button>
              <Button
                variant="outline"
                className="border-0 p-0 w-10 h-10 data-[active=true]:bg-transparent"
              >
                <ButtonIcon
                  as={MicIcon}
                  className="text-brand-primary w-7 h-7"
                />
              </Button>
            </HStack>
          )}
        </HStack>
      </VStack>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : -10}
    >
      <VStack className="flex-1 bg-white p-4">
        <Headerbar />
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          onEndReached={hasMoreMessages ? loadMoreMessages : undefined}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={() => (
            <VStack className="flex-1 h-[100%]">
              <Heading>Hello</Heading>
            </VStack>
          )}
        />
        <FooterTextInput />
      </VStack>
    </KeyboardAvoidingView>
  );
};

export default MessageView;
