import { useState, memo } from "react";
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
import MediaView from "@/components/media/MediaView";
import { FilePlayIcon, FileTextIcon } from "lucide-react-native";
import openFile from "@/components/media/OpenFile";

const MessageItem = memo(
  ({ message, user }: { message: Message; user: UserData }) => {
    // console.log("Rendering MessageItem:", message);
    const [viewMedia, setViewMedia] = useState<string | undefined>("");
    const isOwnMessage =
      message.senderId._id === user?._id && user.activeRole === "Client";

    return (
      <VStack className="">
        {!!viewMedia && (
          <MediaView
            isOpen={!!viewMedia}
            onClose={() => setViewMedia("")}
            url={viewMedia ? viewMedia : ""}
          />
        )}
        <Pressable
          className={`p-2  ${
            message.type !== "text" && message.type !== "image" && "w-[80%]"
          }  ${isOwnMessage ? "self-end" : "self-start"}`}
          onPress={() => {
            if (message.type === "image" || message.type === "video") {
              setViewMedia(message.content?.mediaUrl);
            } else if (message.type === "file") {
              openFile(message.content?.mediaUrl || "");
            }
          }}
        >
          <HStack
            space="sm"
            className={`p-2 items-center justify-end ${
              message.type === "text" || message.type === "image"
                ? "max-w-[80%]"
                : "h-12"
            } ${
              isOwnMessage
                ? "bg-brand-primary rounded-br-xl rounded-l-xl"
                : " bg-gray-100 rounded-r-xl rounded-bl-xl"
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
              <Text
                size="lg"
                className={`font-medium ${
                  isOwnMessage
                    ? "text-typography-200 rounded-br-xl rounded-l-xl"
                    : " text-brand-primary rounded-r-xl rounded-bl-xl"
                }`}
              >
                {message.content?.text}
              </Text>
            ) : message.type === "image" ? (
              <Image
                source={{ uri: message.content?.mediaUrl }}
                className="w-full h-64 rounded-lg"
                alt="Message-Media"
                resizeMode="cover"
              />
            ) : message.type === "video" ? (
              <HStack space="sm" className="justify-center items-center">
                <Text className="text-white">
                  {message.content?.mediaUrl?.split("/").pop()}
                </Text>
                <Icon size="xl" as={FilePlayIcon} className="text-white" />
              </HStack>
            ) : (
              <HStack space="sm" className="justify-center items-center">
                <Text className="text-white">
                  {message.content?.mediaUrl?.split("/").pop()}
                </Text>
                <Icon size="xl" as={FileTextIcon} className="text-white" />
              </HStack>
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
      </VStack>
    );
  }
);

MessageItem.displayName = "MessageItem";

export default MessageItem;
