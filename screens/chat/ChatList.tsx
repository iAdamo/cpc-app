import { FlatList, ListRenderItemInfo } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Chat } from "@/types";
import useGlobalStore from "@/store/globalStore";
import { useEffect, useCallback } from "react";
import chatService from "@/services/chatService";
import { Spinner } from "@/components/ui/spinner";
import NoActiveChat from "./NoActiveChat";
import ChatItem from "./ChatItem";
import ChatNavbar from "./ChatNavbar";

export const ChatList: React.FC = () => {
  const { fetchChats, chatLoading, switchRole, user, filteredChats, chats } =
    useGlobalStore();

  useEffect(() => {
    fetchChats();

    return () => {
      chatService.leaveCurrentChat();
    };
  }, [fetchChats]);

  // Remember to return participants data from the BE
  // console.log("Chats in ChatList:",chats[0], chats[0].participants);

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

  // console.log("Filtered Chats:", filteredChats);
  return (
    <VStack className="flex-1">
      <ChatNavbar chats={chats} />
      <FlatList
        data={filteredChats.length > 0 ? filteredChats : chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        onRefresh={fetchChats}
        refreshing={chatLoading}
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
        // stickyHeaderIndices={[0]}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={10}
        // removeClippedSubviews
      />
    </VStack>
  );
};
