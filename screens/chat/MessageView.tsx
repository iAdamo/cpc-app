import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Pressable } from "@/components/ui/pressable";
import {
  Button,
  ButtonIcon,
  ButtonText,
  ButtonSpinner,
} from "@/components/ui/button";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  AvatarBadge,
} from "@/components/ui/avatar";
import { Fab, FabIcon } from "@/components/ui/fab";
import {
  Icon,
  ArrowLeftIcon,
  PaperclipIcon,
  PhoneIcon,
  ThreeDotsIcon,
} from "@/components/ui/icon";
import { Keyboard, View, FlatList, ActivityIndicator } from "react-native";
import useGlobalStore from "@/store/globalStore";
import { MediaItem, Message } from "@/types";
import { useLocalSearchParams } from "expo-router";
import {
  MicIcon,
  SendHorizonalIcon,
  ChevronsDownIcon,
} from "lucide-react-native";
import { router } from "expo-router";
import MessageItem from "./MessageItem";
import DateHeader from "@/components/DateHeader";
import AttactmentOptions from "./AttachmentPopover";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Anime, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import DateFormatter from "@/utils/DateFormat";
import { useMessageEvents } from "@/hooks/useMessageEvents";
import chatService from "@/services/chatService";
import { SocketEvents, socketService } from "@/services/socketService";
import { ChatItem } from "@/types";
import { groupMessages } from "@/utils/GroupedMessages";
import { current } from "immer";

const MessageView = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    user,
    selectedChat,
    messages,
    hasMoreMessages,
    loadMoreMessages,
    sendTextMessage,
    switchRole,
    setProgress,
    progress,
    sendMediaMessage,
    startTyping,
    stopTyping,
    chatLoading,
    groupedMessages,
    clearMessages,
  } = useGlobalStore();

  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  if (!selectedChat || selectedChat._id !== id) {
    router.back();
    return null;
  }

  const isClient = switchRole === "Client";

  const otherUser = isClient
    ? selectedChat.providerUserId // provider's USER account
    : selectedChat.clientUserId; // client's USER account

  const provider = selectedChat.providerUserId.activeRoleId; // business entity
  const { status, lastSeen, isTyping } = useMessageEvents(otherUser._id);

  // Display name logic
  const displayName = isClient
    ? provider?.providerName ?? "Provider" // Client sees provider name
    : `${otherUser.firstName ?? ""} ${otherUser.lastName ?? ""}`.trim() ||
      "Client";

  // Avatar URI logic
  const avatarUri = isClient
    ? (provider?.providerLogo as MediaItem)?.thumbnail // Client sees provider logo
    : (otherUser.profilePicture as MediaItem)?.thumbnail;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, []);

  const scrollToBottom = (animated = true) => {
    flatListRef.current &&
      groupedMessages.length > 0 &&
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
  };

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollButton(offsetY > 50);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ChatItem; index: number }) => {
      if (item.type === "header") {
        return <DateHeader title={item.label} />;
      }

      return <MessageItem key={index} message={item.message} user={user!} />;
    },
    [user]
  );

  // Fix TypeScript error for getItemLayout
  const getItemLayout = useCallback(
    (data: ArrayLike<any> | null | undefined, index: number) => {
      let offset = 0;
      if (data) {
        for (let i = 0; i < index; i++) {
          const item = data[i];
          if (item) {
            offset += item.type === "header" ? 40 : 80;
          }
        }
      }
      return {
        length: data && data[index]?.type === "header" ? 40 : 80,
        offset,
        index,
      };
    },
    []
  );

  const Headerbar = () => {
    return (
      <VStack className="mt-16 mb-4">
        <HStack>
          <HStack className="flex-1 items-center gap-2">
            <Button
              variant="outline"
              className="border-0 p-0 w-10 h-10"
              onPress={() => {
                Keyboard.dismiss();
                router.back();
              }}
            >
              <ButtonIcon as={ArrowLeftIcon} />
            </Button>

            <HStack className="items-center gap-2">
              <Avatar size="md">
                <AvatarFallbackText>{displayName}</AvatarFallbackText>

                <AvatarImage source={{ uri: avatarUri }} />

                <AvatarBadge
                  size="lg"
                  className={
                    status === "online" ? "bg-green-500" : "bg-gray-400"
                  }
                />
              </Avatar>

              <VStack className="flex-1">
                <Heading>{displayName}</Heading>

                <Text size="sm" className="text-typography-500">
                  {status}
                  {lastSeen ? ` • ${DateFormatter.toRelative(lastSeen)}` : ""}
                </Text>
              </VStack>
            </HStack>
          </HStack>

          <HStack>
            <Button variant="outline" className="border-0 p-0 w-10 h-10">
              <ButtonIcon as={PhoneIcon} className="text-brand-primary" />
            </Button>

            <Button variant="outline" className="border-0 p-0 w-10 h-10">
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
    const typingTimeout = useRef<number | null>(null);

    const handleSendMessage = useCallback(async () => {
      if (inputMessage.trim().length === 0 || isSending) return;

      const messageText = inputMessage.trim();
      setInputMessage("");
      setIsSending(true);

      try {
        await sendTextMessage(messageText);
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsSending(false);
        // Auto-scroll to bottom after sending
        // setTimeout(() => {
        //   scrollToBottom(true);
        // }, 50);
      }
    }, [inputMessage, isSending, sendTextMessage]);

    const mapMimeTypeToMessageType = (
      mimeType: string
    ): "text" | "image" | "video" | "audio" | "file" | "system" => {
      if (mimeType.startsWith("image")) return "image";
      if (mimeType.startsWith("video")) return "video";
      if (mimeType.startsWith("audio")) return "audio";
      if (
        mimeType === "application/pdf" ||
        mimeType === "application/msword" ||
        mimeType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/vnd.ms-excel" ||
        mimeType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimeType === "text/plain" ||
        mimeType === "application/rtf"
      ) {
        return "file";
      }
      return "file";
    };

    const handleSendMedia = useCallback(async (files: any[]) => {
      for (const file of files) {
        if (file.type) {
          const fileType = mapMimeTypeToMessageType(file.type);
          try {
            setIsSending(true);
            await sendMediaMessage(fileType, file, {}, setProgress);
          } catch (error) {
            console.error("Failed to send media message:", error);
          } finally {
            setIsSending(false);
          }
        }
      }
    }, []);

    // Handle incoming real-time messages
    useEffect(() => {
      const handleNewMessage = (envelope: any) => {
        const message: Message = envelope.payload;

        if (message.chatId === selectedChat?._id) {
          // Check if this is replacing a temp message

          useGlobalStore.setState((state) => {
            const filteredMessages = state.messages.filter(
              (msg) => !msg.isOptimistic
            );

            const exists = filteredMessages.some(
              (msg) => msg._id === message._id
            );

            if (exists) {
              state.groupedMessages;
              return {
                messages: filteredMessages,
                groupedMessages: groupMessages({ messages: filteredMessages }),
              };
            }

            return {
              messages: [...filteredMessages, message],
              groupedMessages: groupMessages({
                messages: [...filteredMessages, message],
              }),
            };
          });
        }
      };

      chatService.onNewMessage(handleNewMessage);

      return () => {
        socketService.offEvent(
          SocketEvents.CHAT_MESSAGE_SENT,
          handleNewMessage
        );
      };
    }, [selectedChat?._id, messages]);

    const handleInputChange = (text: string) => {
      setInputMessage(text);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (text.length > 0) {
        startTyping();
        typingTimeout.current = setTimeout(() => {
          stopTyping();
        }, 2000);
      } else {
        stopTyping();
      }
    };

    return (
      <VStack className="py-2 ">
        <HStack space="sm" className=" justify-center items-center px-1">
          <HStack
            space="sm"
            className="bg-white pr-4 flex-1 rounded-full items-center"
          >
            <AttactmentOptions onSendMedia={handleSendMedia} />

            <Textarea className="flex-1 h-14 rounded-xl border-0 bg-typography-50 data-[focus=true]:border-brand-primary/30 focus:bg-white">
              <TextareaInput
                placeholder="Write your message..."
                onChangeText={handleInputChange}
                value={inputMessage}
                className="bg-white text-lg rounded-xl "
                multiline
                textAlignVertical="center"
                editable={!isSending}
              />
            </Textarea>
          </HStack>
          {inputMessage ? (
            <Pressable
              className="bg-brand-primary rounded-full w-14 h-14 justify-center items-center"
              onPress={handleSendMessage}
              disabled={isSending}
            >
              <Icon as={SendHorizonalIcon} className="w-7 h-7 text-white" />
            </Pressable>
          ) : (
            <HStack className="items-center">
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

  const useGradualAnimation = () => {
    const height = useSharedValue(0);
    useKeyboardHandler(
      {
        onMove: (event) => {
          "worklet";
          height.value = Math.max(event.height, 0);
        },
      },
      []
    );
    return { height };
  };
  const { height } = useGradualAnimation();

  const fakeView = useAnimatedStyle(
    () => ({
      height: Math.abs(height.value),
    }),
    []
  );

  return (
    <>
      <View style={{ flex: 1 }}>
        <Headerbar />
        <FlatList
          ref={flatListRef}
          data={groupedMessages}
          invertStickyHeaders={true}
          stickyHeaderIndices={groupedMessages
            .map((item, index) => (item.type === "header" ? index : null))
            .filter((i) => i !== null)}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === "message" ? item.id : `header-${item.label}-${index}`
          }
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.2}
          // getItemLayout={getItemLayout}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          inverted
          // initialNumToRender={20}
          // maxToRenderPerBatch={10}
          removeClippedSubviews={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
          ListFooterComponent={
            chatLoading && hasMoreMessages ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" />
                <Text className="text-typography-500 mt-2">
                  Loading older messages...
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !chatLoading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <Text className="text-typography-500">No messages yet</Text>
              </View>
            ) : null
          }
          // Remove maintainVisibleContentPosition if it causes issues
        />

        {isTyping && (
          <VStack className="w-full items-start px-6 pb-2">
            <Text className="text-xs text-gray-500">Is typing...</Text>
          </VStack>
        )}

        {progress > 0 && progress < 100 && (
          <Progress
            value={progress}
            className="h-1 rounded-full w-3/4 mx-auto mb-2"
          >
            <ProgressFilledTrack className="bg-brand-secondary" />
          </Progress>
        )}

        {showScrollButton && (
          <Fab
            placement="bottom center"
            accessibilityLabel="Scroll to bottom"
            className="bg-gray-100 shadow-lg mb-16 data-[active=true]:bg-gray-200"
            onPress={() => scrollToBottom()}
          >
            <FabIcon as={ChevronsDownIcon} className="text-brand-primary" />
          </Fab>
        )}
      </View>
      <FooterTextInput />
      <Anime.View style={fakeView} />
    </>
  );
};

export default MessageView;
