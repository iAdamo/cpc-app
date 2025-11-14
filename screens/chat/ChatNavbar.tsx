import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { PhoneCallIcon } from "lucide-react-native";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import useGlobalStore from "@/store/globalStore";
import { LinearGradient } from "expo-linear-gradient";
import { SearchIcon } from "@/components/ui/icon";
import SearchBar from "@/components/SearchEngine";
import { Chat } from "@/types";

const ChatNavbar = ({ chats }: { chats: Chat[] }) => {
  const { switchRole } = useGlobalStore();
  const isProvider = switchRole === "Provider";

  return (
    <VStack className="bg-white">
      <HStack className="w-full relative">
        <LinearGradient
          colors={
            isProvider
              ? ["#fffbe020", "#facc1530"] // yellow gradient for Provider
              : ["#ffffff20", "#2563eb50"] // blue gradient for others
          }
          style={{
            position: "absolute",
            width: "100%",
            height: 130,
          }}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </HStack>
      <VStack className="pt-10">
        <HStack className="p-4 justify-between">
          <Heading size="2xl" className="font-medium text-brand-primary">
            Chats
          </Heading>
          <HStack space="sm">
            {/* <Button
              variant="outline"
              className="bg-brand-primary/40 rounded-3xl px-4"
            >
              <ButtonIcon as={PhoneCallIcon} className="text-brand-primary" />
            </Button> */}
            <Button
              variant="outline"
              className="bg-brand-primary/40 rounded-3xl px-4"
            >
              <ButtonIcon as={SearchIcon} className="text-brand-primary" />
            </Button>
          </HStack>
        </HStack>
        {/* <HStack className="w-full p-4 items-center">
            <Avatar size="md">
              <AvatarFallbackText>{`${user?.firstName} ${user?.lastName}`}</AvatarFallbackText>
              <AvatarImage
                source={{
                  uri:
                    typeof user?.activeRoleId?.providerLogo === "string"
                      ? user.activeRoleId.providerLogo
                      : undefined,
                }}
              />
            </Avatar>


          </HStack> */}
        {/** Search bar */}
        <SearchBar chats={chats} />
      </VStack>
    </VStack>
  );
};

export default ChatNavbar;
