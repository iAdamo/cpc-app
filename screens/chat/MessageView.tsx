import { useState, useEffect, useCallback, useRef } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
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
import { MicIcon, SendIcon, ChevronsDownIcon } from "lucide-react-native";
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
    otherAvailability,
    chatLoading,
    loadMessages,
    addNewMessage,
    replaceTempMessage,
    clearMessages,
  } = useGlobalStore();

  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [flatMessages, setFlatMessages] = useState<
    Array<Message | { type: "date"; title: string }>
  >([]);
  const flatListRef = useRef<FlatList>(null);
  const isLoadingMoreRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);
  const isInitialMountRef = useRef(true);

  if (!selectedChat || selectedChat._id !== id) {
    router.back();
    return null;
  }

  const isClient = switchRole === "Client";
  const otherParticipant = selectedChat?.participants[0];
  const { status, lastSeen, isTyping } = useMessageEvents(otherParticipant._id);

  // Group messages by date for rendering - FIXED VERSION
  // Group messages by date for rendering - HANDLE OPTIMISTIC MESSAGES
 useEffect(() => {
   if (!messages.length) {
     setFlatMessages([]);
     return;
   }

   // 1️⃣ Sort ALL messages oldest → newest
   const sortedMessages = [...messages].sort(
     (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
   );

   // 2️⃣ Group messages by date (in natural order)
   const groupedByDate = new Map<string, Message[]>();

   sortedMessages.forEach((message) => {
     const date = new Date(message.createdAt);
     let title: string;

     if (DateFormatter.isToday(date)) {
       title = "Today";
     } else if (DateFormatter.isYesterday(date)) {
       title = "Yesterday";
     } else {
       title = DateFormatter.format(date, "MMM d, yyyy");
     }

     if (!groupedByDate.has(title)) {
       groupedByDate.set(title, []);
     }

     groupedByDate.get(title)!.push(message);
   });

   // 3️⃣ Flatten into FlatList data
   const flatArray: Array<Message | { type: "date"; title: string }> = [];

   groupedByDate.forEach((sectionMessages, title) => {
     flatArray.push({ type: "date", title });
     flatArray.push(...sectionMessages);
   });

   setFlatMessages(flatArray);

   // 4️⃣ Auto-scroll logic
   if (shouldAutoScrollRef.current) {
     requestAnimationFrame(() => {
       flatListRef.current?.scrollToEnd({ animated: true });
     });
   }
 }, [messages]);


  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, []);

  const scrollToBottom = (animated = true) => {
    if (!flatListRef.current || flatMessages.length === 0) return;
    flatListRef.current.scrollToEnd({ animated });
  };

  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const offsetY = contentOffset.y;
      const contentHeight = contentSize.height;
      const viewportHeight = layoutMeasurement.height;

      // Distance from bottom (regular list, not inverted)
      const distanceFromBottom = contentHeight - (offsetY + viewportHeight);

      // Show/hide scroll button based on distance from bottom
      const isNearBottom = distanceFromBottom < 100;
      setShowScrollButton(!isNearBottom);

      // Load more messages when reaching top
      if (
        offsetY < 100 &&
        hasMoreMessages &&
        !chatLoading &&
        !isLoadingMoreRef.current
      ) {
        console.log("Loading older messages from top...");
        isLoadingMoreRef.current = true;
        loadMoreMessages().finally(() => {
          isLoadingMoreRef.current = false;
        });
      }

      // Track if user is near bottom to auto-scroll on new messages
      shouldAutoScrollRef.current = isNearBottom;
    },
    [hasMoreMessages, chatLoading, loadMoreMessages]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (item.type === "date") {
        return <DateHeader title={item.title} />;
      }

      return <MessageItem key={item._id} message={item} user={user!} />;
    },
    [user]
  );

  const keyExtractor = useCallback((item: any, index: number) => {
    if (item.type === "date") {
      return `date-${item.title}-${index}`;
    }
    return item._id || `message-${index}`;
  }, []);

  // Fix TypeScript error for getItemLayout
  const getItemLayout = useCallback(
    (data: ArrayLike<any> | null | undefined, index: number) => {
      let offset = 0;
      if (data) {
        for (let i = 0; i < index; i++) {
          const item = data[i];
          if (item) {
            offset += item.type === "date" ? 40 : 80;
          }
        }
      }
      return {
        length: data && data[index]?.type === "date" ? 40 : 80,
        offset,
        index,
      };
    },
    []
  );

  const Headerbar = () => {
    const otherParticipant = selectedChat?.participants[0];

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
                  {isClient
                    ? otherParticipant?.activeRoleId?.providerName
                    : otherParticipant?.firstName +
                      " " +
                      otherParticipant?.lastName}
                </AvatarFallbackText>
                <AvatarImage
                  source={{
                    uri: isClient
                      ? (
                          otherParticipant.activeRoleId
                            ?.providerLogo as MediaItem
                        )?.thumbnail
                      : (otherParticipant.profilePicture as MediaItem)
                          ?.thumbnail,
                  }}
                />
                <AvatarBadge
                  size="lg"
                  className={`${
                    status === "online" ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </Avatar>
              <VStack className="flex-1">
                <Heading className="">
                  {isClient
                    ? otherParticipant?.activeRoleId?.providerName
                    : (otherParticipant?.firstName || "") +
                      " " +
                      (otherParticipant?.lastName || "")}
                </Heading>

                <Text size="sm" className="text-typography-500">
                  {status} {DateFormatter.toRelative(lastSeen)}
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
        setTimeout(() => {
          scrollToBottom(true);
        }, 50);
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
              return { messages: filteredMessages };
            }

            return { messages: [...filteredMessages, message] };
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
    }, [selectedChat?._id, messages, addNewMessage, replaceTempMessage]);

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
            <Button
              className="bg-brand-primary rounded-full w-12 h-12 justify-center items-center"
              onPress={handleSendMessage}
              isDisabled={isSending}
            >
              {isSending ? (
                <ButtonSpinner size="small" color="white" />
              ) : (
                <ButtonIcon as={SendIcon} className="w-6 h-6" />
              )}
            </Button>
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
          data={flatMessages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          // REMOVED: inverted={true} - Using regular scrolling now
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            // For short chats: push content to bottom, for long chats: let it grow
            flexGrow: flatMessages.length < 10 ? 1 : 0,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
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
            onPress={() => scrollToBottom(true)}
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
