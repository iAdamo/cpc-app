import { useState, useEffect, useCallback } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import { Keyboard } from "react-native";
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
import { CameraIcon, MicIcon, SendIcon, Clock3Icon } from "lucide-react-native";
import { KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import chatService from "@/services/chatService";

const MessageView = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    user,
    selectedChat,
    messages,
    hasMoreMessages,
    loadMoreMessages,
    loadMessages,
    sendTextMessage,
  } = useGlobalStore();

  const [isSending, setIsSending] = useState(false);

  if (!selectedChat || selectedChat._id !== id) return <Text>Loading...</Text>;

  useEffect(() => {
    if (!selectedChat) return;
    console.log("Initializing chat...");

    // Join chat room via WebSocket
    chatService.joinChat(selectedChat);

    // Load initial messages
    loadMessages(1);

    const handleNewMessage = ({ message }: { message: Message }) => {
      console.log("New message received:", message);

      useGlobalStore.setState((state) => ({
        messages: state.messages.filter((msg) => !msg.isOptimistic),
      }));

      useGlobalStore.setState((state) => {
        if (state.messages.find((msg) => msg._id === message._id)) {
          return state;
        }
        return { messages: [message, ...state.messages] };
      });
    };

    const handleUserTyping = (data: { userId: string; typing: boolean }) => {
      useGlobalStore.setState((state) => ({
        typingUsers: data.typing
          ? [
              ...state.typingUsers.filter((id) => id !== data.userId),
              data.userId,
            ]
          : state.typingUsers.filter((id) => id !== data.userId),
      }));
    };

    const handleMessageError = (error: any) => {
      console.error("Message error:", error);
    };

    // Set up event listeners
    chatService.onNewMessage(handleNewMessage);
    chatService.onUserTyping(handleUserTyping);
    chatService.onMessageError(handleMessageError);

    return () => {
      console.log("Cleaning up chat...");
      chatService.leaveCurrentChat();
      chatService.offEvent("new_message", handleNewMessage);
      chatService.offEvent("user_typing", handleUserTyping);
      chatService.offEvent("message_error", handleMessageError);
    };
  }, [selectedChat]);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item: message }) => {
      const isOwnMessage = message.senderId._id === user?._id;

      return (
        <Pressable
          className={`p-2 my-1 ${isOwnMessage ? "self-end" : "self-start"}`}
        >
          <VStack
            className={`p-2 max-w-[80%] ${
              isOwnMessage
                ? "bg-blue-500 rounded-br-xl rounded-l-xl "
                : " bg-gray-200 rounded-r-xl rounded-bl-xl"
            }`}
          >
            <Text
              size="lg"
              className={`font-medium ${
                isOwnMessage ? "text-white" : "text-brand-primary"
              }`}
            >
              {message.content?.text}
            </Text>
            {message.isOptimistic && (
              <Icon
                size="xs"
                className="text-gray-100 self-end mt-1"
                as={Clock3Icon}
              />
            )}
          </VStack>
          <Text
            size="xs"
            className={`mt-1 ${
              isOwnMessage ? "text-gray-500 self-end" : "text-gray-500 self-end"
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {message.isOptimistic && (
            <Text size="xs" className="text-yellow-300 mt-1">
              Sending...
            </Text>
          )}
        </Pressable>
      );
    },
    [user]
  );

  const Headerbar = () => {
    const otherParticipant = selectedChat.participants[0];
    const [isOnline, setIsOnline] = useState<boolean | null>(null);

    useEffect(() => {
      let isMounted = true;
      const checkStatus = async () => {
        if (user?._id) {
          try {
            const status = await chatService.checkOnlineStatus(
              otherParticipant._id
            );
            if (isMounted) setIsOnline(status);
          } catch (error) {
            console.error("Error checking online status:", error);
          }
        }
      };
      checkStatus();

      return () => {
        isMounted = false;
      };
    }, [otherParticipant._id, user?._id]);

    return (
      <VStack className="mt-16 mb-4">
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
                <AvatarBadge
                  size="lg"
                  className={`${isOnline ? "bg-green-500" : "bg-gray-400"}`}
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

    const handleSendMessage = async () => {
      if (inputMessage.trim().length === 0 || isSending) return;

      const messageText = inputMessage.trim();
      setInputMessage("");
      setIsSending(true);

      const optimisticMessage: Partial<Message> = {
        _id: `temp-${Date.now()}`,
        content: { text: messageText },
        senderId: user!,
        chatId: selectedChat._id,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      try {
        useGlobalStore.setState((state) => ({
          messages: [optimisticMessage as Message, ...state.messages],
        }));
        // Send message via WebSocket
        await sendTextMessage(messageText);
      } catch (error) {
        console.error("Failed to send message:", error);
        // You might want to remove the optimistic message or mark it as failed
        // useGlobalStore.getState().removeMessage(optimisticMessage._id ?? "");
        useGlobalStore.setState((state) => ({
          messages: state.messages.filter(
            (msg) => msg._id !== optimisticMessage._id
          ),
        }));
      } finally {
        setIsSending(false);
      }
    };

    return (
      <VStack className="py-2 bg-white">
        <HStack space="sm" className="justify-center items-center px-2">
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
              placeholder="Write your message..."
              onChangeText={setInputMessage}
              value={inputMessage}
              className=" focus:bg-blue-50 text-lg rounded-xl "
              multiline
              textAlignVertical="center"
              // onSubmitEditing={handleSendMessage}
              editable={!isSending}
            />
          </Textarea>
          {inputMessage ? (
            <Button
              variant="outline"
              className="border-0 ml-2 bg-brand-primary data-[active=true]:bg-transparent"
              onPress={handleSendMessage}
              isDisabled={isSending}
            >
              {isSending ? (
                <Spinner size="small" color="white" />
              ) : (
                <ButtonIcon
                  as={SendIcon}
                  className="text-white transform rotate-45"
                />
              )}
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <VStack className="flex-1">
        <Headerbar />
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          inverted
          renderItem={renderMessage}
          onEndReached={hasMoreMessages ? loadMoreMessages : undefined}
          onEndReachedThreshold={0.1}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          ListEmptyComponent={() => (
            <VStack className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500 text-center">
                No messages yet.{"\n"}Start a conversation!
              </Text>
            </VStack>
          )}
        />
        <FooterTextInput />
      </VStack>
    </KeyboardAvoidingView>
  );
};

export default MessageView;
