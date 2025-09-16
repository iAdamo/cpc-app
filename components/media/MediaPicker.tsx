import { useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Image } from "@/components/ui/image";
import { Camera, Image as Gallery } from "lucide-react-native";
import { Icon, CloseIcon, TrashIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import useGlobalStore from "@/store/globalStore";
import { MediaPickerProps } from "@/types";
import { max } from "lodash";

const MediaPicker: React.FC<MediaPickerProps> = ({
  maxFiles = 5,
  maxSize = 5,
  onFilesChange,
  initialFiles = [],
  label = "",
  classname = "",
}) => {
  const { selectedFiles, isLoading, pickMedia, removeFile } = useGlobalStore();

  useEffect(() => {
    if (initialFiles.length > 0 && selectedFiles.length === 0) {
      useGlobalStore.setState({ selectedFiles: initialFiles });
      onFilesChange && onFilesChange(initialFiles);
    }
  }, [initialFiles]);

  useEffect(() => {
    onFilesChange && onFilesChange?.(selectedFiles);
  }, [selectedFiles]);

  const handlePickMedia = async (source: "gallery" | "camera") => {
    await pickMedia(
      source,
      {
        allowsMultipleSelection: source === "gallery",
        quality: source === "camera" ? 0.8 : 1,
      },
      maxFiles,
      maxSize
    );
  };

  const remainingSlots = maxFiles - selectedFiles.length;

  return (
    <VStack className="flex-1">
      {label && <Text className="font-semibold text-center">{label}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className=""
        contentContainerStyle={{
          alignItems: "center",
          gap: 16,
          justifyContent: remainingSlots > 0 ? "flex-start" : "center",
        }}
      >
        {remainingSlots > 0 && (
          <Pressable
            className={`w-44 h-44 rounded-md border-2 border-dashed border-gray-300 items-center justify-center ${classname}`}
            onPress={() => handlePickMedia("gallery")}
            disabled={isLoading}
          >
            <Icon as={Gallery} className="w-8 h-8 text-gray-400" />
            <Text className="text-gray-400 mt-1">Gallery</Text>
          </Pressable>
        )}
        {selectedFiles.map((file, index) => (
          <Box key={file.uri} className="relative mr-2">
            <Image
              source={{ uri: file.uri }}
              alt={file.name || `Selected media ${index + 1}`}
              className={`w-44 h-44 rounded-md ${classname}`}
              resizeMode="cover"
            />
            <Button
              size="md"
              className="absolute top-0 right-0 w-10 h-10 rounded-full shadow-md bg-red-800/20"
              onPress={() => removeFile(file.uri)}
            >
              <ButtonIcon
                as={TrashIcon}
                className="fill-red-500/60 text-red-800"
              />
            </Button>
          </Box>
        ))}
      </ScrollView>
      {remainingSlots > 0 && (
        <Text size="sm" className="bg-green-200 border border-green-300 text-center p-2 text-green-900 font-semibold rounded mt-2">
          You can add {remainingSlots} more file
          {remainingSlots > 1 ? "s" : ""}.
        </Text>
      )}
    </VStack>
  );
};

export default MediaPicker;
