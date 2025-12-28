import { memo } from "react";
import { Pressable } from "@/components/ui/pressable";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Chat, MediaItem } from "@/types";
import { router } from "expo-router";
import useGlobalStore from "@/store/globalStore";
import DateFormatter from "@/utils/DateFormat";

function ChatItem({ chat, switchRole }: { chat: Chat; switchRole: string }) {
  const otherParticipant = chat.participants[0];
  const isClient = switchRole === "Client";
  const { user, messages } = useGlobalStore();
  const userId = user?._id ?? "";

  return (
    <Pressable
      className="flex-row flex-1 gap-4 rounded-lg items-center p-4 mt-4"
      onPress={() => {
        useGlobalStore.setState({ selectedChat: chat });
        router.push({ pathname: "/chat/[id]", params: { id: chat._id } });
      }}
    >
      <Avatar size="lg">
        <AvatarFallbackText>
          {isClient
            ? otherParticipant.activeRoleId?.providerName
            : otherParticipant.firstName + otherParticipant.lastName}
        </AvatarFallbackText>
        <AvatarImage
          source={{
            uri:
              chat.type === "group"
                ? typeof chat.groupInfo?.avatarUrl === "string"
                  ? chat.groupInfo.avatarUrl
                  : undefined
                : isClient
                ? (otherParticipant.activeRoleId?.providerLogo as MediaItem)
                    ?.thumbnail
                : (otherParticipant.profilePicture as MediaItem)?.thumbnail,
          }}
        />
      </Avatar>
      <HStack className="flex-1 justify-between items-center">
        <VStack space="sm" className="flex-1">
          <Heading size="lg" className="font-medium">
            {isClient
              ? otherParticipant.activeRoleId?.providerName
              : (otherParticipant.firstName || "") +
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
          <Text size="sm" className="text-typography-500 items-start flex-1">
            {chat?.lastMessage
              ? DateFormatter.toRelative(chat.lastMessage.createdAt)
              : ""}
          </Text>
          {chat.unreadCounts && chat.unreadCounts[userId] > 0 && (
            <Text
              size="md"
              className="w-7 h-7 text-center py-1 bg-red-600 rounded-full text-white font-medium self-center"
            >
              {chat.unreadCounts[userId]}
            </Text>
          )}
        </VStack>
      </HStack>
    </Pressable>
  );
}
export default memo(ChatItem);
