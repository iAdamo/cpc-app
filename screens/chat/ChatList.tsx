// components/ChatList.tsx
import React from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ListRenderItem,
} from "react-native";
import { VStack } from "@/components/ui/vstack";
import { useNavigation } from "@react-navigation/native";
import { Chat } from "@/types";
import { useChat } from "@/hooks/useChat";
import { router } from "expo-router";
import useGlobalStore from "@/store/globalStore";
import { useEffect } from "react";
import chatService from "@/services/chatService";
import { Pressable } from "@/components/ui/pressable";
import { Image } from "@/components/ui/image";
import { Card } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import SearchBar from "@/components/SearchEngine";
import NoActiveChat from "./NoActiveChat";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icon";
import ChatNavbar from "./ChatNavbar";

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
  const renderChatItem: ListRenderItem<Chat> = ({ item: chat }) => {
    const otherParticipant = chat.participants[1];

    return (
      <Pressable className="flex-row flex-1 bg-typography-50 rounded-lg items-center p-4 m-4 ">
        <Avatar size="md">
          <AvatarFallbackText>
            {chat.participants[0]?.activeRoleId?.providerName}
          </AvatarFallbackText>
          <AvatarImage
            source={{
              uri:
                chat.type === "group"
                  ? typeof chat.groupInfo?.avatarUrl === "string"
                    ? chat.groupInfo.avatarUrl
                    : undefined
                  : typeof chat.participants[0]?.activeRoleId?.providerLogo ===
                    "string"
                  ? chat.participants[0]?.activeRoleId?.providerLogo
                  : undefined,
            }}
          />
        </Avatar>
      </Pressable>
    );
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

// components/ChatList.tsx
// import { useEffect } from "react";
// import {
//   View,
//   FlatList,
//   Text,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   ListRenderItem,
// } from "react-native";
// // import { useNavigation } from "@react-navigation/native";
// import { Card } from "@/components/ui/card";
// import { Pressable } from "@/components/ui/pressable";
// import {
//   Avatar,
//   AvatarBadge,
//   AvatarFallbackText,
//   AvatarImage,
// } from "@/components/ui/avatar";
// import { Chat } from "@/types";
// import { useChat } from "@/hooks/useChat";
// import { router } from "expo-router";
// import { VStack } from "@/components/ui/vstack";
// import chatService from "@/services/chatService";
// import useGlobalStore from "@/store/globalStore";

// export const ChatList = () => {
//   const { fetchChats, chats } = useGlobalStore();

//   useEffect(() => {
//     const initializeChat = async () => {
//       try {
//         await fetchChats();
//         await chatService.connect();
//         // chatService.joinChat(chatId);
//         // await chatService.getChatMessages(chatId, 1);
//         // await markAsDelivered();
//       } catch (error) {
//         console.error("Failed to initialize chat:", error);
//       }

//       return () => {
//         chatService.leaveCurrentChat();
//         chatService.disconnect();
//       };
//     };

//     initializeChat();
//   }, []);
//   // const navigation = useNavigation();
//   // const { chats, loading } = useChat();
//   return (
//     <VStack className="flex-1">
//       <FlatList
//         onRefresh={fetchChats}
//         data={chats}
//         keyExtractor={(chat) => chat._id}
//         renderItem={({ item: chat }: { item: Chat }) => (
//           <Pressable
//             className="flex-row items-center p-4 border-b border-gray-200"
//             // onPress={() =>
//             //   router.push({
//             //     pathname: "/chat/[chatId]",
//             //     params: { chatId: chat._id },
//             //   })
//             // }
//           >
//             <Avatar size="sm">
//               <AvatarFallbackText>
//                 {chat.participants[0]?.activeRoleId?.providerName}
//               </AvatarFallbackText>
//               <AvatarImage
//                 source={{
//                   uri:
//                     chat.type === "group"
//                       ? chat.groupInfo?.avatarUrl
//                       : chat.participants[0]?.activeRoleId?.providerLogo,
//                 }}
//               />
//             </Avatar>

//             <View className="flex-1 ml-4">
//               <Text className="text-lg font-semibold">
//                 {chat.type === "group"
//                   ? chat.groupInfo?.name
//                   : chat.participants[0]?.username}
//               </Text>
//               <Text className="text-gray-500" numberOfLines={1}>
//                 {chat.lastMessage?.text || "No messages yet"}
//               </Text>
//             </View>

//             <View className="items-end">
//               <Text className="text-gray-400 text-sm">
//                 {chat.lastMessage
//                   ? new Date(chat.lastMessage.createdAt).toLocaleTimeString(
//                       [],
//                       {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       }
//                     )
//                   : ""}
//               </Text>
//               {/* You can add unread count badge here */}
//             </View>
//           </Pressable>
//         )}
// ListHeaderComponent={<SearchBar />}
// ListFooterComponent={<View style={{ height: 100 }} />}
// refreshing={loading}
// />
{
  /* </VStack> */
}
// <TouchableOpacity
//   style={styles.chatItem}
//   //   onPress={() => navigation.navigate("Chat", { chatId: chat._id })}
// //   onPress={() =>
// //     router.push({
// //       pathname: "/chat/[chatId]",
// //       params: { chatId: chat._id },
// //     })
// //   }
// >
//   <Image
//     source={{
//       uri:
//         chat.type === "group"
//           ? chat.groupInfo?.avatarUrl
//           : chat.participants[0]?.avatarUrl,
//     }}
//     style={styles.avatar}
//     defaultSource={require("../assets/default-avatar.png")}
//   />

//   <View style={styles.chatInfo}>
//     <Text style={styles.chatName}>
//       {chat.type === "group"
//         ? chat.groupInfo?.name
//         : chat.participants[0]?.username}
//     </Text>

//     <Text style={styles.lastMessage} numberOfLines={1}>
//       {chat.lastMessage?.text || "No messages yet"}
//     </Text>
//   </View>

//   <View style={styles.chatMeta}>
//     <Text style={styles.time}>
//       {chat.lastMessage
//         ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           })
//         : ""}
//     </Text>
//     {/* You can add unread count badge here */}
//   </View>
// </TouchableOpacity>
//   );
// };
