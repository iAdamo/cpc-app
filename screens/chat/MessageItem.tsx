import { memo } from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import { Message } from "@/types";
import { Clock3Icon } from "lucide-react-native";
import DateFormatter from "@/utils/DateFormat";
import { UserData } from "@/types";

const MessageItem = memo(
  ({ message, user }: { message: Message; user: UserData }) => {
    // console.log("Rendering MessageItem:", message.senderId._id, user?._id);
    const isOwnMessage = message.senderId._id === user?._id;

    return (
      <Pressable
        className={`p-2 my-1 ${isOwnMessage ? "self-end" : "self-start"}`}
      >
        <VStack
          className={`p-2 max-w-[80%] ${
            isOwnMessage
              ? "bg-blue-500 rounded-br-xl rounded-l-xl "
              : " bg-gray-200 rounded-r-xl rounded-bl-xl"
          }`}
        >
          <Text
            size="lg"
            className={`font-medium ${
              isOwnMessage ? "text-white" : "text-brand-primary"
            }`}
          >
            {message.content?.text}
          </Text>
          {message.isOptimistic && (
            <Icon
              size="xs"
              className="text-gray-100 self-end mt-1"
              as={Clock3Icon}
            />
          )}
        </VStack>
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
