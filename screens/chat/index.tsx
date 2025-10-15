import { useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import ChatNavbar from "./ChatNavbar";
import SearchBar from "@/components/SearchEngine";
import chatService from "@/services/chatService";
import useGlobalStore from "@/store/globalStore";
import { ChatList } from "./ChatList";

const Chat = () => {
  return (
    <VStack className="flex-1">
      <ChatList />
    </VStack>
  );
};

export default Chat;
