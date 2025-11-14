import { FlatList, ListRenderItemInfo } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { useNavigation } from "@react-navigation/native";
import { Chat } from "@/types";
import { router } from "expo-router";
import useGlobalStore from "@/store/globalStore";
import { useEffect, useCallback } from "react";
import chatService from "@/services/chatService";
import { Pressable } from "@/components/ui/pressable";
import { Spinner } from "@/components/ui/spinner";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import NoActiveChat from "./NoActiveChat";
import ChatItem from "./ChatItem";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icon";
import ChatNavbar from "./ChatNavbar";
import { UserData, ProviderData } from "@/types";
import DateFormatter from "@/utils/DateFormat";
import SearchBar from "@/components/SearchEngine";

export const ChatList: React.FC = () => {
  const { fetchChats, chats, chatLoading, switchRole, user, filteredChats } =
    useGlobalStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await fetchChats();
        if (!mounted) return;
        await chatService.connect();
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      }
    })();

    return () => {
      mounted = false;
      chatService.leaveCurrentChat();
      // chatService.disconnect();
    };
  }, [fetchChats]);

  // console.log("Chats in ChatList:", chats);

  const renderChatItem = useCallback(
    ({ item: chat }: ListRenderItemInfo<Chat>) => {
      return (
        <VStack className="flex-1">
          <ChatItem chat={chat} switchRole={switchRole} />
        </VStack>
      );
    },
    [switchRole]
  );

  console.log("Filtered Chats:", filteredChats);
  return (
    <VStack className="flex-1">
      <ChatNavbar chats={chats} />
      <FlatList
        data={filteredChats.length > 0 ? filteredChats : chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        // onRefresh={fetchChats}
        // refreshing={chatLoading}
        ListEmptyComponent={() =>
          chatLoading ? (
            <Spinner
              size="large"
              className="flex-1 justify-center items-center"
            />
          ) : (
            <NoActiveChat />
          )
        }
        stickyHeaderIndices={[0]}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={10}
        // removeClippedSubviews
      />
    </VStack>
  );
};
