import { memo } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { Image } from "@/components/ui/image";
import { Icon } from "@/components/ui/icon";
import { Message } from "@/types";
import { Clock3Icon } from "lucide-react-native";
import DateFormatter from "@/utils/DateFormat";
import { UserData } from "@/types";

const MessageItem = memo(
  ({ message, user }: { message: Message; user: UserData }) => {
    // console.log("Rendering MessageItem:", message.senderId._id, user?._id);
    const isOwnMessage =
      message.senderId._id === user?._id && user.activeRole === "Client";

    return (
      <Pressable className={`p-2 ${isOwnMessage ? "self-end" : "self-start"}`}>
        <HStack
          space="sm"
          className={`p-2 max-w-[80%] ${
            isOwnMessage
              ? "bg-brand-primary rounded-br-xl rounded-l-xl "
              : " bg-brand-secondary rounded-r-xl rounded-bl-xl"
          }`}
        >
          {message.isOptimistic && (
            <Icon
              size="xs"
              className="text-gray-100 self-end mt-1"
              as={Clock3Icon}
            />
          )}
          {message.type === "text" ? (
            <Text size="lg" className="font-medium text-gray-100">
              {message.content?.text}
            </Text>
          ) : (
            <Image
              source={{ uri: message.content?.mediaUrl }}
              className="w-full h-60 rounded-lg"
              alt="Message-Media"
              resizeMode="cover"
            />
          )}
        </HStack>
        <Text
          size="xs"
          className={`mt-1 ${
            isOwnMessage ? "text-gray-500 self-end" : "text-gray-500 self-end"
          }`}
        >
          {DateFormatter.toTime(message.createdAt)}
        </Text>
      </Pressable>
    );
  }
);

MessageItem.displayName = "MessageItem";

export default MessageItem;
