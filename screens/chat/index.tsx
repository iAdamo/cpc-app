import { VStack } from "@/components/ui/vstack";
import { ChatList } from "./ChatList";

const Chat = () => {
  return (
    <VStack className="flex-1">
      <ChatList />
    </VStack>
  );
};

export default Chat;
