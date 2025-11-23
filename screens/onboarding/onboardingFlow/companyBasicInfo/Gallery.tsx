import { useState, useEffect, useRef, use } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { TrashIcon } from "@/components/ui/icon";
import { MapPinIcon } from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";
import { Image } from "@/components/ui/image";
import {
  companyFormSchema,
  companyFormSchemaType,
} from "@/components/schema/CompanySchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-native-phone-number-input";
import { ScrollView } from "@/components/ui/scroll-view";
import MediaPicker from "@/components/media/MediaPicker";
import { GooglePlaceService } from "@/services/googlePlaceService";
import { useCallback } from "react";
import { FileType, Place, MediaItem } from "@/types";
import { debounce } from "lodash";
import ProfilePic from "@/components/profile/ProfilePic";

const Gallery = () => {
  const [locationInput, setLocationInput] = useState<boolean>(false);
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [predictions, setPredictions] = useState<Place[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const {
    user,
    updateProfile,
    currentStep,
    setCurrentStep,
    selectedPlace,
    setSelectedPlace,
    isLoading,
    setError: setGError,
    updateUserProfile,
    completeOnboarding,
    onboardingData,
    setOnboardingData,
  } = useGlobalStore();
  if (!user) return;

  const GallerySchema = companyFormSchema.pick({
    providerImages: true,
  });
  type GallerySchemaType = z.infer<typeof GallerySchema>;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<GallerySchemaType>({
    resolver: zodResolver(GallerySchema),
    defaultValues: {
      providerImages: onboardingData.providerImages
        ? (onboardingData.providerImages as FileType[])
        : [],
      // Array.isArray(user?.activeRoleId?.providerImages)
      //   ? user?.activeRoleId?.providerImages.map((img, idx) =>
      //       typeof (img as MediaItem).thumbnail === "string"
      //         ? {
      //             uri: (img as MediaItem).url,
      //             type: "image/jpeg" as FileType["type"],
      //           }
      //         : (img as FileType)
      //     )
      //   : [],
    },
  });
  // console.log("isValid", user);

  console.log("form errors", errors);
  // console.log("form values", getValues());

  const handleFilesChange = (files: FileType[]) => {
    const mappedFiles = files.map((file, index) => ({
      ...file,
      name: file.name ?? "", // Ensure name is always a string
      // type: "image/jpeg", // Default to image/jpeg if type is missing
    }));
    setValue("providerImages", mappedFiles);
    if (files.length > 0) {
      clearErrors("providerImages");
    }
  };

  const handleNext = handleSubmit(async (data) => {
    setOnboardingData({ providerImages: data.providerImages });
    console.log("Submitting company basic info:", data);
    try {
      updateProfile({
        activeRoleId: {
          ...user.activeRoleId,
          providerName: onboardingData.providerName,
          providerDescription: onboardingData.providerDescription,
          providerEmail: onboardingData.providerEmail,
          providerPhoneNumber: onboardingData.providerPhoneNumber,
          providerLogo: onboardingData.providerLogo,
          providerImages: data.providerImages as any,
          location: JSON.parse(onboardingData.providerLocation || {}),
        },
      });
      await updateUserProfile("Provider");
      completeOnboarding();
      useGlobalStore.setState({ onboardingData: {} });
      setCurrentStep(0);
    } catch (error) {
      // console.error("Failed to update profile:", error);
      setGError(error as any);
    }
  });

  return (
    <VStack className="flex-1 p-2 bg-white">
      <Text
        size="sm"
        className="text-typography-400 font-medium mb-6 self-center"
      >
        Step 3 of 3 . Gallery
      </Text>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Heading
          size="2xl"
          className="text-brand-secondary mb-4 self-center text-center px-16"
        >
          Show customers what you do
        </Heading>
        <Text
          size="xl"
          className="text-brand-secondary self-center px-12 text-center"
        >
          Provide some basic info so clients can trust you.
        </Text>
        <VStack className="flex-1 gap-6 mb-8">
          <FormControl className="flex-1" isInvalid={!!errors.providerImages}>
            <Controller
              control={control}
              name="providerImages"
              render={({ field: { value } }) => (
                <MediaPicker
                  maxFiles={4}
                  maxSize={40}
                  initialFiles={value as any}
                  onFilesChange={handleFilesChange}
                  label=" "
                />
              )}
            />
            {errors.providerImages && (
              <FormControlError className="self-center mt-8">
                <FormControlErrorText className="bg-red-200 px-2 py-1 rounded-md">
                  {errors.providerImages.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </VStack>
      </ScrollView>
      <Button
        size="xl"
        className="mb-4 mt-2 bg-brand-secondary border-0 mx-2"
        isDisabled={isLoading}
        onPress={() => handleNext()}
      >
        <ButtonText className="text-white">Finish Setup</ButtonText>
      </Button>
    </VStack>
  );
};

export default Gallery;
