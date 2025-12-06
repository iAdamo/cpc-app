import { useEffect } from "react";
import {
  Popover,
  PopoverBackdrop,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
} from "@/components/ui/popover";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon } from "@/components/ui/button";
import { PaperclipIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Icon } from "@/components/ui/icon";
import {
  ImagesIcon,
  CameraIcon,
  FileTextIcon,
  MapPinIcon,
  HeadphonesIcon,
  VideoIcon,
} from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";

const AttactmentOptions = ({
  onSendMedia,
}: {
  onSendMedia?: (files: any[]) => void;
}) => {
  const {
    selectedFiles,
    pickMedia,
    pickDocument,
    removeLocalFile,
    setProgress,
    // sendMediaMessage, // No longer used here
  } = useGlobalStore();

  // Call parent callback when files are selected and popover closes
  useEffect(() => {
    if (selectedFiles.length > 0 && onSendMedia) {
      onSendMedia(selectedFiles);
      // Optionally clear selected files after sending
      selectedFiles.forEach((file) => removeLocalFile(file.uri));
      setProgress(0);
    }
  }, [selectedFiles, onSendMedia, removeLocalFile]);

  const options = [
    {
      label: "Gallery",
      action: () =>
        pickMedia(
          "gallery",
          {
            allowsMultipleSelection: true,
            mediaTypes: ["images", "videos"],
          },
          5,
          50
        ),
      icon: ImagesIcon,
      color: "blue",
    },
    {
      label: "Photo",
      action: () =>
        pickMedia(
          "camera",
          {
            allowsMultipleSelection: false,
            mediaTypes: ["images"],
          },
          1,
          10
        ),
      icon: CameraIcon,
      color: "green",
    },
    {
      label: "Video",
      action: () =>
        pickMedia(
          "camera",
          {
            videoMaxDuration: 60,
            allowsMultipleSelection: false,
            mediaTypes: ["videos"],
          },
          1,
          50
        ),
      icon: VideoIcon,
      color: "yellow",
    },
    {
      label: "Document",
      action: () => pickDocument(),
      icon: FileTextIcon,
      color: "orange",
    },
    {
      label: "Location",
      action: () => alert("Location"),
      icon: MapPinIcon,
      color: "red",
    },
    {
      label: "Audio",
      action: () => alert("Audio"),
      icon: HeadphonesIcon,
      color: "purple",
    },
  ];

  return (
    <Popover
      size="full"
      offset={-30}
      isKeyboardDismissable={false}
      trigger={(triggerProps) => {
        return (
          <Button
            {...triggerProps}
            variant="outline"
            className="border-0 p-0 w-10 h-10 data-[active=true]:bg-transparent"
          >
            <ButtonIcon
              as={PaperclipIcon}
              className="text-brand-primary w-7 h-7"
            />
          </Button>
        );
      }}
    >
      <PopoverBackdrop />
      <PopoverContent className="bg-transparent border-0 p-0">
        <PopoverBody
          className="bg-gray-100 p-4 mx-4 rounded-2xl"
          contentContainerClassName=""
        >
          <HStack className="flex-wrap justify-between" space="md">
            {options.map((option, index) => (
              <Pressable
                key={index}
                className=" items-center justify-center w-16 h-16 bg-gray-50 rounded-lg"
                onPress={option.action}
              >
                <Icon
                  size="xl"
                  as={option.icon}
                  className={`text-${option.color}-500`}
                />
                <Text className="text-sm text-gray-700">{option.label}</Text>
              </Pressable>
            ))}
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default AttactmentOptions;
