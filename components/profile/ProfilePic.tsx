import { Card } from "../ui/card";
import { Image } from "../ui/image";
import { Button, ButtonText, ButtonIcon } from "../ui/button";
import { Box } from "../ui/box";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";
import { Heading } from "../ui/heading";
import { useState, useEffect, useMemo, useCallback } from "react";
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
import { FileType, ResEventEnvelope } from "@/types";
import { normalizePresence } from "@/utils/presence";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { CircleIcon } from "@/components/ui/icon";
import {
  socketService,
  SocketEvents,
  PresenceEvents,
} from "@/services/socketService";
import { PresenceResponse } from "@/types";

interface ProfilePicProps {
  imageUri?: string | FileType | null;
  isEditable?: boolean;
  isLoading?: boolean;
  isLogo?: boolean;
  button?: boolean;
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
  button = false,
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
  const { availability, setAvailability, switchRole } = useGlobalStore();

  // Size mappings
  const sizeMap = {
    xs: { container: 56, image: 50, icon: 12, button: 8 },
    sm: { container: 80, image: 70, icon: 20, button: 16 },
    md: { container: 110, image: 100, icon: 24, button: 18 },
    lg: { container: 120, image: 130, icon: 24, button: 14 },
    xl: { container: 180, image: 170, icon: 32, button: 22 },
  };

  const currentSize = sizeMap[size];

  // memoized status options for availability radios
  const statusOptions = useMemo(
    () => [
      {
        value: "online",
        label: "Available",
        color: "fill-green-600 border-green-600",
        b: "border-green-600",
      },
      {
        value: "busy",
        label: "Busy",
        color: "fill-yellow-600 border-yellow-600",
        b: "border-yellow-600",
      },
      {
        value: "away",
        label: "Away",
        color: "fill-orange-500 border-orange-500",
        b: "border-orange-600",
      },
    ],
    []
  );

  const handleAvailabilityChange = useCallback((status: string) => {
    socketService.emitEvent(PresenceEvents.UPDATE_STATUS, {
      customStatus: status,
      lastSeen: Date.now(),
    });
  }, []);

  useEffect(() => {
    const onStatusUpdated = (envelope: ResEventEnvelope) => {
      setAvailability(envelope.payload);
    };

    socketService.onEvent(PresenceEvents.STATUS_UPDATED, onStatusUpdated);

    return () => {
      socketService.offEvent(PresenceEvents.STATUS_UPDATED, onStatusUpdated);
    };
  }, [setAvailability]);

  useEffect(() => {
    // Preserve the incoming shape (string or FileType or null)
    setSelectedImage(imageUri as any);
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
        // Keep the full FileType so callers have access to name/type/uri
        setSelectedImage(file[0]);
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
          <Pressable
            className="w-full h-full items-center justify-center"
            onPress={isEditable ? openOptionsModal : undefined}
            accessibilityRole="button"
            accessibilityLabel="Open profile image options"
          >
            {selectedImage ? (
              <Image
                source={{
                  uri:
                    typeof selectedImage === "string"
                      ? selectedImage
                      : (selectedImage as FileType)?.uri || "",
                }}
                alt="Profile Picture"
                className="w-full h-full"
                style={{
                  width: currentSize.image,
                  height: currentSize.image,
                  borderRadius: currentSize.container / 2,
                }}
              />
            ) : (
              <Icon as={Gallery} className="w-12 h-12 text-gray-400" />
            )}
          </Pressable>
        </Card>

        {/* Camera/Edit Button */}
        {isEditable &&
          !isLogo &&
          (button ? (
            <Button
              variant="solid"
              size="sm"
              className="bg-brand-secondary rounded-lg mt-4"
              onPress={openOptionsModal}
              isDisabled={isUploading}
            >
              <ButtonText>Upload Logo</ButtonText>
            </Button>
          ) : (
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
                className="fill-white  w-6 h-6"
              />
            </Button>
          ))}
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
      {/* Options Modal */}
      {showOptionsModal && (
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
                handleClose();
                pickImage("camera");
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
                handleClose();
                pickImage("gallery");
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
            {isLogo && switchRole === "Provider" && (
              <VStack className="w-full">
                <Heading className="text-brand-primary font-medium self-start py-4 pl-6 border-b border-gray-200 w-full">
                  Set Status
                </Heading>
                <ActionsheetItem className="justify-between items-center w-full pl-6">
                  <Text size="xl" className="">
                    Status
                  </Text>
                  <HStack space="sm" className="items-center">
                    <RadioGroup
                      value={availability?.customStatus || availability?.status}
                      onChange={handleAvailabilityChange}
                      accessibilityLabel="Availability"
                    >
                      <HStack space="sm">
                        {statusOptions.map((opt) => (
                          <Radio size="lg" key={opt.value} value={opt.value}>
                            <RadioIndicator
                              className={`data-[checked=true]:${opt.b} `}
                            >
                              <RadioIcon
                                as={CircleIcon}
                                className={opt.color}
                              />
                            </RadioIndicator>
                            <RadioLabel>{opt.label}</RadioLabel>
                          </Radio>
                        ))}
                      </HStack>
                    </RadioGroup>
                  </HStack>
                  {/* <Switch
                      value={isAvailable}
                      onValueChange={setAvailability()}
                      trackColor={{ false: "#d4d4d4", true: "#16a34a" }}
                      thumbColor="#fafafa"
                      ios_backgroundColor="#d4d4d4"
                    /> */}
                </ActionsheetItem>
                <Text className="pl-6 mb-6">
                  Clients will be able to see you are available
                </Text>
              </VStack>
            )}
          </ActionsheetContent>
        </Actionsheet>
      )}

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
