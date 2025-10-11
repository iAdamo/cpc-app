import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { Image } from "@/components/ui/image";
import useGlobalStore from "@/store/globalStore";

const NoActiveChat = () => {
  const { switchRole } = useGlobalStore();
  return (
    <VStack className="flex-1 px-6">
      <Center className="flex-1">
        <Image
          source={require("../../assets/images/no-chats.png")}
          className="w-96 h-96 object-cover"
          alt="no-active-chat"
        />
        <Text size="lg" className="text-center">
          {switchRole === "Client"
            ? "You have no active chats. Start a conversation by selecting a provider!"
            : "You have no active chats. Engage with clients to start conversations!"}
        </Text>
      </Center>

    </VStack>
  );
};

export default NoActiveChat;
