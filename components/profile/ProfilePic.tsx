import { Card } from "../ui/card";
import { Image } from "../ui/image";
import { Button, ButtonText, ButtonIcon } from "../ui/button";
import { Box } from "../ui/box";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { Heading } from "../ui/heading";
import { useState, useEffect, useRef } from "react";
import { Icon, CloseIcon } from "../ui/icon";
import { Alert } from "react-native";
import { CameraIcon } from "lucide-react-native";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { Pressable } from "../ui/pressable";
import { Camera, Image as Gallery } from "lucide-react-native";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import MediaService from "@/services/mediaService";
import useGlobalStore from "@/store/globalStore";
import { FileType } from "@/types";

interface ProfilePicProps {
  imageUri?: string | FileType | null;
  isEditable?: boolean;
  isLoading?: boolean;
  isLogo?: boolean;
  onImageSelected: (file: FileType) => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showChangeButton?: boolean;
  setError?: (error: string | null) => void;
}

const ProfilePic = ({
  imageUri = null,
  isEditable = true,
  isLoading = false,
  isLogo = false,
  onImageSelected,
  size = "lg",
  showChangeButton = true,
  setError = () => null,
}: ProfilePicProps) => {
  const [selectedImage, setSelectedImage] = useState<FileType | string | null>(
    imageUri as string
  );
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { isAvailable, setAvailability } = useGlobalStore();

  // Size mappings
  const sizeMap = {
    xs: { container: 56, image: 50, icon: 12, button: 8 },
    sm: { container: 80, image: 70, icon: 20, button: 16 },
    md: { container: 110, image: 100, icon: 24, button: 18 },
    lg: { container: 120, image: 130, icon: 24, button: 14 },
    xl: { container: 180, image: 170, icon: 32, button: 22 },
  };

  const currentSize = sizeMap[size];

  useEffect(() => {
    setSelectedImage(imageUri as string);
  }, [imageUri]);

  const pickImage = async (source: "gallery" | "camera") => {
    setShowOptionsModal(false);
    setIsUploading(true);

    try {
      const file = await MediaService.pickMedia(source, {
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [1, 1],
        quality: source === "camera" ? 0.8 : 1,
      });

      if (file.length > 0) {
        const uri = file[0].uri;
        setSelectedImage(uri);
        onImageSelected(file[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to select image";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSelectedImage(null);
            onImageSelected({ uri: "", name: "", type: "image" } as FileType);
          },
        },
      ]
    );
  };

  const openOptionsModal = () => {
    setShowOptionsModal(true);
  };

  const handleClose = () => {
    setShowOptionsModal(false);
  };

  return (
    <VStack className="items-center">
      {/* Profile Image Container */}
      <Box className="relative">
        <Card
          className="rounded-full p-0 overflow-hidden items-center justify-center bg-gray-300"
          style={{
            width: currentSize.container,
            height: currentSize.container,
          }}
        >
          {selectedImage ? (
            <Pressable
              className="w-full h-full"
              onPress={isEditable && isLogo ? openOptionsModal : undefined}
            >
              <Image
                source={{ uri: selectedImage as string }}
                alt="Profile Picture"
                className="w-full h-full"
                style={{
                  width: currentSize.image,
                  height: currentSize.image,
                  borderRadius: currentSize.container / 2,
                }}
              />
            </Pressable>
          ) : (
            <Heading className="text-typography-400">LOGO</Heading>
          )}
        </Card>

        {/* Camera/Edit Button */}
        {isEditable && !isLogo && (
          <Button
            variant="solid"
            size="xs"
            className="absolute -bottom-3 -right-1 rounded-full bg-brand-secondary border-2 border-white shadow-md"
            style={{
              width: currentSize.icon + 16,
              height: currentSize.icon + 16,
            }}
            onPress={openOptionsModal}
            isDisabled={isUploading}
          >
            <ButtonIcon
              as={CameraIcon}
              size={size}
              className="fill-white text-brand-secondary w-6 h-6"
            />
          </Button>
        )}
      </Box>

      {/* Change Picture Button */}
      {showChangeButton && isEditable && (
        <Button
          variant="link"
          size="sm"
          onPress={openOptionsModal}
          className="mt-4"
          isDisabled={isUploading}
        >
          <ButtonText className="text-brand-primary text-sm">
            {selectedImage ? "Change Picture" : "Add Picture"}
          </ButtonText>
        </Button>
      )}

      <Actionsheet isOpen={showOptionsModal} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="gap-2 px-0">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Heading className="text-brand-primary font-medium self-start py-4 pl-6 border-b border-gray-200 w-full">
            Profile Image
          </Heading>
          <ActionsheetItem
            onPress={() => {
              handleClose(), pickImage("camera");
            }}
            isDisabled={isUploading}
            className="pl-6"
          >
            <Box className="bg-brand-primary/40 rounded-full p-4">
              <Icon as={Camera} className="text-brand-primary w-6 h-6" />
            </Box>
            <ActionsheetItemText size="xl" className="">
              Camera
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem
            onPress={() => {
              handleClose(), pickImage("gallery");
            }}
            isDisabled={isUploading}
            className="pl-6"
          >
            <Box className="bg-brand-primary/40 rounded-full p-4">
              <Icon as={Gallery} className="text-brand-primary w-6 h-6" />
            </Box>
            <ActionsheetItemText size="xl" className="">
              Choose from Photos
            </ActionsheetItemText>
          </ActionsheetItem>
          {selectedImage && !isLogo && (
            <ActionsheetItem
              onPress={() => {
                removeImage();
              }}
              isDisabled={isUploading}
              className="pl-6"
            >
              <Box className="bg-red-800/30 rounded-full p-4">
                <Icon as={CloseIcon} className="text-red-800 w-6 h-6" />
              </Box>
              <ActionsheetItemText
                size="xl"
                className="font-medium text-red-500"
              >
                Remove Current Photo
              </ActionsheetItemText>
            </ActionsheetItem>
          )}
          {isLogo && (
            <VStack className="w-full">
              <Heading className="text-brand-primary font-medium self-start py-4 pl-6 border-b border-gray-200 w-full">
                Set Status
              </Heading>
              <ActionsheetItem className="justify-between items-center w-full pl-6">
                <Text size="lg" className="">
                  Status
                </Text>
                <HStack space="sm" className="items-center">
                  <Text
                    size="lg"
                    className={`${
                      isAvailable ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    Available
                  </Text>
                  <Switch
                    value={isAvailable}
                    onValueChange={setAvailability}
                    trackColor={{ false: "#d4d4d4", true: "#16a34a" }}
                    thumbColor="#fafafa"
                    ios_backgroundColor="#d4d4d4"
                  />
                </HStack>
              </ActionsheetItem>
              <Text className="pl-6 mb-6">
                Clients will be able to see you are availble
              </Text>
            </VStack>
          )}
        </ActionsheetContent>
      </Actionsheet>

      {/* Uploading Indicator */}
      {isUploading && (
        <Box className="absolute inset-0 rounded-full items-center justify-center">
          <Spinner size="large" />
        </Box>
      )}
    </VStack>
  );
};

export default ProfilePic;
