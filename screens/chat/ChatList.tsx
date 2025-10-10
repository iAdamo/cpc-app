import { FlatList, ListRenderItem } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { useNavigation } from "@react-navigation/native";
import { Chat } from "@/types";
import { router } from "expo-router";
import useGlobalStore from "@/store/globalStore";
import { useEffect } from "react";
import chatService from "@/services/chatService";
import { Pressable } from "@/components/ui/pressable";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import NoActiveChat from "./NoActiveChat";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icon";
import ChatNavbar from "./ChatNavbar";
import { UserData, ProviderData } from "@/types";
import DateFormatter from "@/utils/DateFormat";

export const ChatList: React.FC = () => {
  const navigation = useNavigation();
  const { fetchChats, chats, chatLoading, switchRole, user } = useGlobalStore();

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
  }, [fetchChats]);

  // console.log("Chats in ChatList:", chats);

  const renderChatItem: ListRenderItem<Chat> = ({ item: chat }) => {
    // Assuming 'participants' is an array and you want the participant that is not the current user
    const otherParticipant: Partial<UserData & ProviderData> = Array.isArray(
      chat?.participants
    )
      ? chat.participants.find((p: any) => p._id !== user?._id) || {}
      : {};

    // console.log(otherParticipant);
    // console.log("otherParticipant", otherParticipant);

    return otherParticipant && Object.keys(otherParticipant).length > 0 ? (
      <Pressable
        className="flex-row flex-1 gap-4 rounded-lg items-center p-4 mt-4"
        onPress={() => {
          useGlobalStore.setState({ selectedChat: chat }),
            router.push({
              pathname: "/chat/[id]",
              params: { id: chat._id },
            });
        }}
      >
        <Avatar size="lg">
          <AvatarFallbackText>
            {/* {(otherParticipant &&
              (("providerName" in otherParticipant &&
                otherParticipant.providerName) ||
                ("firstName" in otherParticipant &&
                  otherParticipant.firstName))) ||
              ""} */}
            {otherParticipant.providerName ||
              (otherParticipant.firstName || "") +
                " " +
                (otherParticipant.lastName || "")}
          </AvatarFallbackText>
          <AvatarImage
            source={{
              uri:
                chat.type === "group"
                  ? typeof chat.groupInfo?.avatarUrl === "string"
                    ? chat.groupInfo.avatarUrl
                    : undefined
                  : typeof otherParticipant?.providerLogo === "string"
                  ? otherParticipant.providerLogo
                  : typeof otherParticipant?.profilePicture === "string"
                  ? otherParticipant.profilePicture
                  : undefined,
            }}
          />
        </Avatar>
        <HStack className="flex-1 justify-between items-center">
          <VStack space="sm" className="flex-1">
            <Heading size="lg" className="font-medium">
              {otherParticipant.providerName ||
                (otherParticipant.firstName || "") +
                  " " +
                  (otherParticipant.lastName || "")}
            </Heading>
            <Text size="md" className="text-typography-500 line-clamp-1">
              {(typeof chat?.lastMessage === "string"
                ? chat.lastMessage
                : chat?.lastMessage?.text) || "No messages yet"}
            </Text>
          </VStack>
          <VStack className="items-end h-full justify-between">
            <Text size="sm" className="text-typography-500 items-start">
              {chat?.lastMessage
                ? DateFormatter.toRelative(chat.lastMessage.createdAt)
                : ""}
            </Text>
            <Center className="bg-brand-primary h-6 w-6 rounded-full">
              <Text size="md" className="text-brand-secondary font-medium">
                1
              </Text>
            </Center>
          </VStack>
        </HStack>
      </Pressable>
    ) : null;
  };

  return (
    <VStack className="flex-1">
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        // refreshing={chatLoading}
        // onRefresh={() => fetchChats}
        ListEmptyComponent={() => <NoActiveChat />}
        ListHeaderComponent={() => (
          <>
            <ChatNavbar />
            <Input className="m-4 rounded-2xl border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
              <InputSlot className="pl-4">
                <InputIcon
                  size="xl"
                  as={SearchIcon}
                  className="text-gray-400"
                />
              </InputSlot>
              <InputField
                placeholder="Search Chats"
                className="placeholder:text-lg placeholder:text-gray-400"
                // onChangeText={(text) => setFilterQuery(text)}
              />
            </Input>
          </>
        )}
        StickyHeaderComponent={() => <ChatNavbar />}
      />
    </VStack>
  );
};
