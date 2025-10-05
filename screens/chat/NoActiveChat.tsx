import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { Image } from "@/components/ui/image";

const NoActiveChat = () => {
  return (
    <VStack className="flex-1 mt-16 px-6">
      <Center className="flex-1">
        <Image
          source={require("../../assets/images/no-chats.png")}
          className="w-96 h-96 object-cover"
          alt="no-active-chat"
        />
      </Center>
      <Text className="text-lg text-gray-600 text-center">
        No active chats. Start a new conversation to connect!
      </Text>
    </VStack>
  );
};

export default NoActiveChat;
