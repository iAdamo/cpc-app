// components/ChatScreen.tsx
import React, { useState, useCallback, useEffect, use } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Input } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ListRenderItem,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Message } from "@/types";
import useGlobalStore from "@/store/globalStore";
import chatService from "@/services/chatService";

export const ChatScreen: React.FC = () => {
  const route = useRoute();
  const { chatId } = route.params as { chatId: string };

  const {
    messages,
    sendTextMessage,
    // sendMediaMessage,
    loadMoreMessages,
    markAsDelivered,
    startTyping,
    stopTyping,
    typingUsers,
    hasMoreMessages,
    chatLoading,
    fetchChats,
  } = useGlobalStore();
  // const { messages, sendTextMessage, loadMoreMessages, markAsDelivered, typingUsers, hasMoreMessages } = useChat(chatId);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        await fetchChats();
        await chatService.connect();
        // chatService.joinChat(chatId);
        // await chatService.getChatMessages(chatId, 1);
        // await markAsDelivered();
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      }

      return () => {
        chatService.leaveCurrentChat();
        chatService.disconnect();
      };
    };

    initializeChat();
    // fetchChats();
    // chatService.connect();
    // return () => {
    //   chatService.disconnect();
    // };
  }, []);

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleSendMessage = useCallback(() => {
    if (messageText.trim()) {
      sendTextMessage(messageText.trim());
      setMessageText("");
      stopTyping();
    }
  }, [messageText, sendTextMessage, stopTyping]);

  const handleTextChange = useCallback(
    (text: string) => {
      setMessageText(text);

      if (!isTyping) {
        startTyping();
        setIsTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
        setIsTyping(false);
      }, 1000);
    },
    [isTyping, startTyping, stopTyping]
  );

  const handlePickImage = useCallback(async () => {
    // You would use a library like react-native-image-picker here
    Alert.alert("Feature", "Image picker would be implemented here");
  }, []);

  // const renderMessage: ListRenderItem<Message> = useCallback(
  //   ({ item }) => (
  //     <View
  //       style={[
  //         styles.messageContainer,
  //         item.senderId._id === "current-user-id"
  //           ? styles.sentMessage
  //           : styles.receivedMessage,
  //       ]}
  //     >
  //       {item.replyTo && (
  //         <View style={styles.replyContainer}>
  //           <Text style={styles.replyText}>
  //             {item.replyTo.content?.text || "Media message"}
  //           </Text>
  //         </View>
  //       )}

  //       {item.type === "text" ? (
  //         <Text style={styles.messageText}>{item.content?.text}</Text>
  //       ) : (
  //         <Image
  //           source={{ uri: item.content?.mediaUrl }}
  //           style={styles.mediaMessage}
  //           resizeMode="cover"
  //         />
  //       )}

  //       <Text style={styles.messageTime}>
  //         {new Date(item.createdAt).toLocaleTimeString([], {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //         })}
  //       </Text>
  //     </View>
  //   ),
  //   []
  // );

  // Mark messages as delivered when chat is active
  //   useEffect(() => {
  //     markAsDelivered();
  //   }, [messages.length, markAsDelivered]);

  return <VStack></VStack>;
};
