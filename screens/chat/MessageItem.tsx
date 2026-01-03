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

const resolveMediaUrl = (mediaUrl: any): string => {
  if (!mediaUrl) return "";
  if (Array.isArray(mediaUrl)) return resolveMediaUrl(mediaUrl[0]);
  if (typeof mediaUrl === "string") return mediaUrl;
  if (typeof mediaUrl === "object") return mediaUrl.url || mediaUrl.uri || "";
  return "";
};

const MessageItem = memo(
  ({ message, user }: { message: Message; user: UserData }) => {
    const [viewMedia, setViewMedia] = useState<string | undefined>("");
     const isOwnMessage = message.senderId === user?._id;

    const handlePress = () => {
      if (message.type === "image" || message.type === "video") {
        const url = resolveMediaUrl(message.content?.mediaUrl);
        setViewMedia(url);
      } else if (message.type === "file") {
        const fileUrl = resolveMediaUrl(message.content?.mediaUrl);
        if (fileUrl) openFile(fileUrl);
      }
    };

    return (
      <VStack className="">
        {!!viewMedia && (
          <MediaView
            isOpen={!!viewMedia}
            onClose={() => setViewMedia("")}
            url={viewMedia}
          />
        )}

        <Pressable
          className={`p-2  ${
            message.type !== "text" && message.type !== "image" && "w-[80%]"
          }  ${isOwnMessage ? "self-end" : "self-start"}`}
          onPress={handlePress}
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
                : " bg-gray-200 rounded-r-xl rounded-bl-xl"
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
                source={{ uri: resolveMediaUrl(message.content?.mediaUrl) }}
                className="w-full h-64 rounded-lg"
                alt="Message-Media"
                resizeMode="cover"
              />
            ) : message.type === "video" ? (
              <HStack space="sm" className="justify-center items-center">
                <Text
                  className={`${
                    isOwnMessage
                      ? "text-typography-200 rounded-br-xl rounded-l-xl"
                      : " text-brand-primary rounded-r-xl rounded-bl-xl"
                  }`}
                >
                  {resolveMediaUrl(message.content?.mediaUrl)
                    .toString()
                    .split("/")
                    .pop()}
                </Text>
                <Icon
                  size="xl"
                  as={FilePlayIcon}
                  className={`${
                    isOwnMessage
                      ? "text-typography-200 rounded-br-xl rounded-l-xl"
                      : " text-brand-primary rounded-r-xl rounded-bl-xl"
                  }`}
                />
              </HStack>
            ) : (
              <HStack space="sm" className="justify-center items-center">
                <Text className="text-white">
                  {resolveMediaUrl(message.content?.mediaUrl)
                    .toString()
                    .split("/")
                    .pop()}
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
