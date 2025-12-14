import { useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import chatService from "@/services/chatService";
import { ChatList } from "./ChatList";
import useGlobalStore from "@/store/globalStore";

const Chat = () => {
  const { fetchChats, chatLoading, switchRole, user, filteredChats, chats } =
    useGlobalStore();

  useEffect(() => {
    fetchChats();

    return () => {
      chatService.leaveCurrentChat();
    };
  }, [fetchChats]);

  return (
    <VStack className="flex-1">
      <ChatList chats={chats} />
    </VStack>
  );
};

export default Chat;
