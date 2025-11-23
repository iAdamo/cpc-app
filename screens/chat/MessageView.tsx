import {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
  useMemo,
  use,
} from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
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
import { ListRenderItem, Keyboard, View } from "react-native";
import useGlobalStore from "@/store/globalStore";
import { MediaItem, Message } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { MicIcon, SendIcon, ChevronsDownIcon } from "lucide-react-native";
import { Animated } from "react-native";
import { router } from "expo-router";
import chatService from "@/services/chatService";
import MessageItem from "./MessageItem";
import DateHeader from "@/components/DateHeader";
import { SectionList } from "react-native";
import { MessageSection } from "@/types";
import AttactmentOptions from "./AttachmentPopover";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Anime, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const MessageView = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    user,
    selectedChat,
    groupedMessages,
    hasMoreMessages,
    loadMoreMessages,
    loadMessages,
    sendTextMessage,
    switchRole,
    selectedFiles,
    setProgress,
    progress,
    sendMediaMessage,
    startTyping,
    stopTyping,
  } = useGlobalStore();

  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const flatListRef = useRef<SectionList<Message, MessageSection>>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  if (!selectedChat || selectedChat._id !== id) {
    router.back();
    return null;
  }
  const isClient = switchRole === "Client";

  useEffect(() => {
    if (!selectedChat) return;
    console.log("Initializing chat...");

    // Join chat room via WebSocket
    chatService.joinChat(selectedChat);

    // Load initial messages
    loadMessages(1);

    const handleNewMessage = ({ message }: { message: Message }) => {
      // console.log("New message received:", message);

      // remove all optimistic messages
      useGlobalStore.setState((state) => ({
        groupedMessages: state.groupedMessages.map(
          (section: MessageSection) => ({
            ...section,
            data: section.data.filter((msg) => !msg.isOptimistic),
          })
        ),
      }));

      // add to groupMessage without duplicates
      useGlobalStore.setState((state) => ({
        groupedMessages: (() => {
          const todayTitle = "Today";
          const existingSection = state.groupedMessages.find(
            (section: MessageSection) => section.title === todayTitle
          );
          if (existingSection) {
            // Avoid duplicates
            if (
              existingSection.data.find(
                (msg: Message) => msg._id === message._id
              )
            ) {
              return state.groupedMessages;
            }
            return state.groupedMessages.map((section: MessageSection) =>
              section.title === todayTitle
                ? { ...section, data: [message, ...section.data] }
                : section
            );
          } else {
            return [
              { title: todayTitle, data: [message] },
              ...state.groupedMessages,
            ];
          }
        })(),
      }));
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

  /** Scroll handler to toggle button visibility based on proximity to bottom */
  // ...existing code...
  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset } = event?.nativeEvent ?? {};
      if (!contentOffset) return;

      // For inverted lists, y=0 is bottom (latest), y increases as you scroll up
      if (contentOffset.y > 100 && !showScrollButton) {
        setShowScrollButton(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (contentOffset.y <= 100 && showScrollButton) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowScrollButton(false));
      }
    },
    [showScrollButton, fadeAnim]
  );

  const scrollToBottom = () => {
    if (!flatListRef.current || !groupedMessages.length) return;
    // For inverted SectionList, scroll to the first section's first item (index 0, 0)
    flatListRef.current.scrollToLocation({
      sectionIndex: 0,
      itemIndex: 0,
      animated: true,
      viewPosition: 0, // 0 = bottom when inverted
    });
  };

  const Headerbar = () => {
    const otherParticipant = selectedChat?.participants[0];
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
                        ).thumbnail
                      : (otherParticipant.profilePicture as MediaItem)
                          .thumbnail,
                  }}
                />
                <AvatarBadge
                  size="lg"
                  className={`${isOnline ? "bg-green-500" : "bg-gray-400"}`}
                />
              </Avatar>
              <VStack>
                <Heading>
                  {isClient
                    ? otherParticipant?.activeRoleId?.providerName
                    : (otherParticipant?.firstName || "") +
                      " " +
                      (otherParticipant?.lastName || "")}
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
    const typingTimeout = useRef<number | null>(null);

    const handleSendMessage = useCallback(async () => {
      if (inputMessage.trim().length === 0 || isSending) return;

      const messageText = inputMessage.trim();
      setInputMessage("");
      setIsSending(true);

      const optimisticMessage: Partial<MessageSection> = {
        title: "Today",
        data: [
          {
            _id: `temp-${Date.now()}`,
            content: { text: messageText },
            senderId: user!,
            chatId: selectedChat._id,
            createdAt: new Date().toISOString(),
            type: "text",
            isOptimistic: true,
          },
        ],
      };

      try {
        useGlobalStore.setState((state) => {
          const todayTitle = "Today";
          const existingSection = state.groupedMessages.find(
            (section: MessageSection) => section.title === todayTitle
          );

          if (existingSection) {
            return {
              groupedMessages: state.groupedMessages.map(
                (section: MessageSection) =>
                  section.title === todayTitle
                    ? {
                        ...section,
                        data: [optimisticMessage.data?.[0], ...section.data],
                      }
                    : section
              ),
            };
          } else {
            return {
              groupedMessages: [
                { title: todayTitle, data: [optimisticMessage.data?.[0]] },
                ...state.groupedMessages,
              ],
            };
          }
        });

        // scrollToBottom();
        await sendTextMessage(messageText);
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsSending(false);
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    }, [
      inputMessage,
      isSending,
      user,
      selectedChat,
      sendTextMessage,
      scrollToBottom,
    ]);

    // Helper to map MIME type to allowed message type
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

    // Handle sending media files from AttachmentPopover
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

    // Typing indicator logic
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
            {/* paperclip options */}
            <AttactmentOptions onSendMedia={handleSendMedia} />

            <Textarea className="flex-1 h-14 rounded-xl border-0 bg-typography-50 data-[focus=true]:border-brand-primary/30 focus:bg-white">
              <TextareaInput
                placeholder="Write your message..."
                onChangeText={handleInputChange}
                value={inputMessage}
                className="bg-white text-lg rounded-xl "
                multiline
                textAlignVertical="center"
                // onSubmitEditing={handleSendMessage}
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

  const renderSectionHeader = useCallback(
    ({ section }: { section: MessageSection }) => {
      return <DateHeader title={section.title} />;
    },
    []
  );

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item: message }) => (
      <MessageItem key={message._id} message={message} user={user!} />
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => {
      return <MessageItem key={item._id} message={item} user={user!} />;
    },
    [user]
  );

  const keyExtractor = useCallback((item: Message) => item._id, []);

  // Typing indicator UI
  const { typingUsers } = useGlobalStore();
  const otherTyping = typingUsers && typingUsers.length > 0;

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

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    };
  }, []);

  return (
    <>
      <View style={{ flex: 1 }}>
        <Headerbar />
        <SectionList
          ref={flatListRef}
          sections={groupedMessages}
          keyExtractor={keyExtractor}
          renderSectionFooter={renderSectionHeader}
          renderItem={renderMessage}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          inverted
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
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={21}
        />

        {/* Typing indicator */}
        {otherTyping && (
          <VStack className="w-full items-start px-6 pb-2">
            <Text className="text-xs text-gray-500">Is typing...</Text>
          </VStack>
        )}

        {progress > 0 && progress < 100 ? (
          <Progress
            value={progress}
            className=" h-1 rounded-full w-3/4 mx-auto mb-2"
          >
            <ProgressFilledTrack className="bg-brand-secondary" />
          </Progress>
        ) : null}
        {/* ↓ Floating scroll-to-bottom button */}
        {showScrollButton && (
          <Fab
            placement="bottom center"
            accessibilityLabel="Scroll to bottom"
            className="bg-gray-100 shadow-lg mb-16 data-[active=true]:bg-gray-200"
            onPress={scrollToBottom}
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
