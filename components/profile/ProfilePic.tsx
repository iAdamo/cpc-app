import { Card } from "../ui/card";
import { Image } from "../ui/image";
import { Button, ButtonText, ButtonIcon, ButtonSpinner } from "../ui/button";
import * as ImagePicker from "expo-image-picker";
// import * as Camera from "expo-camera";
import { Box } from "../ui/box";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { Heading } from "../ui/heading";
import { useState, useEffect, useRef } from "react";
import {
  Icon,
  CameraIcon,
  EditIcon,
  CheckIcon,
  CloseIcon,
  SmileyIcon,
  LoaderIcon,
} from "../ui/icon";
import {
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
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
import { Camera } from "lucide-react-native";
import { Image as Gallery } from "lucide-react-native";
import { Spinner } from "../ui/spinner";

interface ProfilePicProps {
  imageUri?: string | null;
  isEditable?: boolean;
  isLoading?: boolean;
  onImageSelected: (uri: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
  showChangeButton?: boolean;
  setError?: (error: string | null) => void;
}

const ProfilePic = ({
  imageUri = null,
  isEditable = true,
  isLoading = false,
  onImageSelected,
  size = "lg",
  showChangeButton = true,
  setError = () => null,
}: ProfilePicProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(imageUri);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();

  // Size mappings
  const sizeMap = {
    sm: { container: 80, image: 70, icon: 20, button: 16 },
    md: { container: 100, image: 90, icon: 24, button: 18 },
    lg: { container: 120, image: 130, icon: 24, button: 14 },
    xl: { container: 180, image: 170, icon: 32, button: 22 },
  };

  const currentSize = sizeMap[size];

  useEffect(() => {
    setSelectedImage(imageUri);
  }, [imageUri]);

  useEffect(() => {
    (async () => {
      if (!status?.granted) {
        const response = await requestPermission();
        if (!response.granted) {
          setError("Camera permission is required to take photos!");
          return;
        }
      }
    })();
  }, []);

  const pickImage = async (source: "gallery" | "camera") => {
    setShowOptionsModal(false);
    setIsUploading(true);

    try {
      let result;
      if (source === "gallery") {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else if (source === "camera") {
        if (!status?.granted) {
          const response = await requestPermission();
          if (!response.granted) {
            setError("Camera permission is required to take photos!");
            return;
          }
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (result && !result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        onImageSelected(uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setError("Failed to select image. Please try again.");
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
            onImageSelected("");
          },
        },
      ]
    );
  };

  const openOptionsModal = () => {
    setShowOptionsModal(true);
  };

  if (isLoading) {
    return (
      <VStack className="items-center justify-center p-4">
        <Box
          className={`rounded-full bg-gray-200 items-center justify-center`}
          style={{
            width: currentSize.container,
            height: currentSize.container,
          }}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
        </Box>
      </VStack>
    );
  }

  const handleClose = () => {
    setShowOptionsModal(false);
  };

  return (
    <VStack className="items-center">
      {/* Profile Image Container */}
      <Box className="relative">
        <Card
          className="rounded-2xl overflow-hidden items-center justify-center bg-brand-primary/50"
          style={{
            width: currentSize.container,
            height: currentSize.container,
          }}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              alt="Profile Picture"
              className="w-full h-full"
              style={{
                width: currentSize.image,
                height: currentSize.image,
                borderRadius: currentSize.container / 2,
              }}
            />
          ) : (
            <Icon
              as={SmileyIcon}
              className="w-14 h-14 text-red-500 fill-green-500 stroke-yellow-600"
            />
            // <Text className="text-gray-500 text-4xl font-bold">
            //   {size === "sm" ? "U" : "USER"}
            // </Text>
          )}
        </Card>

        {/* Camera/Edit Button */}
        {isEditable && (
          <Button
            variant="solid"
            size="sm"
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
        <ActionsheetContent className="gap-6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem onPress={handleClose} className="mt-4">
            <Pressable
              disabled={isUploading}
              onPress={() => pickImage("camera")}
              className="w-full flex flex-row gap-4 items-center"
            >
              <Box className="bg-brand-primary/60 rounded-full p-3">
                <Icon as={Camera} className="text-brand-primary w-6 h-6" />
              </Box>
              <Text size="xl" className="">
                Camera
              </Text>
            </Pressable>
          </ActionsheetItem>
          <ActionsheetItem onPress={handleClose} className="">
            <Pressable
              disabled={isUploading}
              onPress={() => pickImage("gallery")}
              className="w-full flex flex-row gap-4 items-center"
            >
              <Box className="bg-brand-primary/60 rounded-full p-3">
                <Icon as={Gallery} className="text-brand-primary w-6 h-6" />
              </Box>
              <Text size="xl" className="">
                Choose from Photos
              </Text>
            </Pressable>
          </ActionsheetItem>
          {selectedImage && (
            <ActionsheetItem>
              <Button
                variant="outline"
                size="lg"
                onPress={removeImage}
                isDisabled={isUploading}
                className="w-fit"
              >
                <ButtonIcon as={CloseIcon} />
                <ButtonText>Remove Current Photo</ButtonText>
              </Button>
            </ActionsheetItem>
          )}
        </ActionsheetContent>
      </Actionsheet>

      {/* Uploading Indicator */}
      {isUploading && (
        <Box className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
          <Spinner size="large" />
        </Box>
      )}
    </VStack>
  );
};

export default ProfilePic;
