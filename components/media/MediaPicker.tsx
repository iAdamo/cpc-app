import { useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Image } from "@/components/ui/image";
import { Camera, Image as Gallery, Video } from "lucide-react-native";
import { Icon, CloseIcon, TrashIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import useGlobalStore from "@/store/globalStore";
import { MediaPickerProps } from "@/types";

const MediaPicker = ({
  maxFiles = 5,
  maxSize = 50,
  onFilesChange,
  initialFiles = [],
  label = "",
  classname = "",
  allowedTypes = ["image", "video"], // New prop to specify allowed types
}: MediaPickerProps) => {
  const { selectedFiles, isLoading, pickMedia, removeFile, error } =
    useGlobalStore();

  useEffect(() => {
    if (initialFiles.length > 0 && selectedFiles.length === 0) {
      useGlobalStore.setState({ selectedFiles: initialFiles });
      onFilesChange && onFilesChange(initialFiles);
    }
  }, [initialFiles]);

  useEffect(() => {
    onFilesChange && onFilesChange?.(selectedFiles);
  }, [selectedFiles]);

  // console.log("Selected files:", selectedFiles);

  // const handlePickMedia = async (
  //   source: "gallery" | "camera",
  //   mediaType: ("images" | "videos")[]
  // ) => {
  //   // console.log("Picking media of type:", mediaType, "from", source);
  //   await pickMedia(
  //     source,
  //     {
  //       allowsMultipleSelection: source === "gallery",
  //       quality: source === "camera" ? 0.8 : 1,
  //       mediaTypes: mediaType,
  //     },
  //     maxFiles,
  //     maxSize
  //   );
  // };

  const remainingSlots = maxFiles - selectedFiles.length;

  // Determine if we should show both image and video options
  const showImageOption = allowedTypes.includes("image");
  const showVideoOption = allowedTypes.includes("video");
  const showBothOptions = showImageOption && showVideoOption;

  const getMediaTypeLabel = () => {
    if (showBothOptions) return "Choose Image or Video";
    if (showImageOption) return "Choose Image";
    if (showVideoOption) return "Choose Video";
    return "Choose Media";
  };

  const getFileIcon = (fileType: string) => {
    return fileType === "video" ? Video : Gallery;
  };

  return (
    <VStack className="flex-1 gap-4">
      {label && (
        <Text className="font-semibold text-center text-lg">{label}</Text>
      )}

      {/* Selected Files - Vertical Scroll */}
      {selectedFiles.length > 0 && (
        <VStack className="flex-1 gap-2">
          {/* <Text className="font-medium text-gray-700">Selected Files:</Text> */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className=""
            contentContainerStyle={{
              flex: 1,
              gap: 12,
            }}
          >
            {selectedFiles.map((file, index) => (
              <Box key={file.uri} className="relative mr-2">
                <Image
                  source={{ uri: file.uri }}
                  alt={file.name || `Selected media ${index + 1}`}
                  className={`w-full h-80 object-cover rounded-md ${classname}`}
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
        </VStack>
      )}

      {/* Selection Options - Only show if slots available */}
      {remainingSlots > 0 && (
        <VStack className="gap-3">
          <Text className="font-medium text-gray-700 text-center">
            {getMediaTypeLabel()}
          </Text>

          <HStack className="justify-center gap-4">
            {/* Gallery Options */}
            <Pressable
              className="flex-1 h-52 rounded-lg border-2 border-dashed border-brand-primary/50 items-center justify-center"
              onPress={() =>
                // handlePickMedia(
                //   "gallery",
                //   showBothOptions
                //     ? ["images", "videos"]
                //     : showImageOption
                //     ? ["images"]
                //     : ["videos"]
                // )
                pickMedia(
                  "gallery",
                  {
                    allowsMultipleSelection: true,
                    quality: 1,
                    mediaTypes: showBothOptions
                      ? ["images", "videos"]
                      : showImageOption
                      ? ["images"]
                      : ["videos"],
                  },
                  maxFiles,
                  maxSize
                )
              }
              disabled={isLoading}
            >
              {showBothOptions ? (
                <HStack space="xl" className="items-center justify-center">
                  <VStack className="items-center">
                    <Box className="p-2 bg-brand-primary/20 rounded-full">
                      <Icon
                        as={Gallery}
                        size="xl"
                        className="rounded-full text-brand-primary"
                      />
                    </Box>
                    <Text className="text-brand-primary bg-brand-primary/20 px-4 py-1 rounded-full mt-1 text-sm font-medium">
                      {`Pictures up to ${maxSize}mb`}
                    </Text>
                  </VStack>
                  <VStack className="items-center">
                    <Box className="p-2 bg-brand-primary/20 rounded-full">
                      <Icon
                        as={Video}
                        size="xl"
                        className="rounded-full text-brand-primary"
                      />
                    </Box>
                    <Text className="text-brand-primary bg-brand-primary/20 px-4 py-1 rounded-full mt-1 text-sm font-medium">
                      {`Videos up to ${maxSize}mb`}
                    </Text>
                  </VStack>
                </HStack>
              ) : showImageOption ? (
                <VStack className="items-center">
                  <Box className="p-2 bg-brand-primary/20 rounded-full">
                    <Icon
                      as={Gallery}
                      size="xl"
                      className="rounded-full text-brand-primary"
                    />
                  </Box>
                  <Text className="text-brand-primary bg-brand-primary/20 px-4 py-1 rounded-full mt-1 text-sm font-medium">
                    {`Pictures up to ${maxSize}mb`}
                  </Text>
                </VStack>
              ) : (
                <VStack className="items-center">
                  <Box className="p-2 bg-brand-primary/20 rounded-full">
                    <Icon
                      as={Video}
                      size="xl"
                      className="rounded-full text-brand-primary"
                    />
                  </Box>
                  <Text className="text-brand-primary bg-brand-primary/20 px-4 py-1 rounded-full mt-1 text-sm font-medium">
                    {`Videos up to ${maxSize}mb`}
                  </Text>
                </VStack>
              )}
            </Pressable>
          </HStack>

          {/* Camera Option - Only for images */}
          {/* {showImageOption && (
            <Pressable
              className="w-full py-3 rounded-lg border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50"
              onPress={() => handlePickMedia("camera", ["images"])}
              disabled={isLoading}
            >
              <HStack className="items-center space-x-2">
                <Icon as={Camera} className="w-6 h-6 text-gray-600" />
                <Text className="text-gray-600 font-medium">Take Photo</Text>
              </HStack>
            </Pressable>
          )} */}
        </VStack>
      )}

      {/* Remaining Slots Info */}
      {/* {remainingSlots > 0 && (
        <Text
          size="sm"
          className="bg-green-100 border border-green-300 text-center p-3 text-green-900 font-medium rounded-lg"
        >
          You can add {remainingSlots} more file
          {remainingSlots > 1 ? "s" : ""}.
        </Text>
      )} */}

      {/* Max Files Reached Message */}
      {/* {remainingSlots === 0 && selectedFiles.length > 0  && (
        <Text
          size="sm"
          className="bg-blue-100 border border-blue-300 text-center p-3 text-blue-900 font-medium rounded-lg"
        >
          Maximum of {maxFiles} files selected.
        </Text>
      )} */}
    </VStack>
  );
};

export default MediaPicker;
