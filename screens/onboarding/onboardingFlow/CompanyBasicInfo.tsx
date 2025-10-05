import { useState, useEffect, useRef } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-native-phone-number-input";
import { ScrollView } from "@/components/ui/scroll-view";
import MediaPicker from "@/components/media/MediaPicker";
import { GooglePlaceService } from "@/services/googlePlaceService";
import { useCallback } from "react";
import { FileType, Place } from "@/types";
import { debounce } from "lodash";
import ProfilePic from "@/components/profile/ProfilePic";

const CompanyBasicInfo = () => {
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
  } = useGlobalStore();
  if (!user) return;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<companyFormSchemaType>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      providerName: user.activeRoleId?.providerName || "",
      providerDescription: user.activeRoleId?.providerDescription || "",
      providerEmail: user.activeRoleId?.providerEmail || "",
      providerPhoneNumber: user.activeRoleId?.providerPhoneNumber || "",
      providerLogo: user.activeRoleId?.providerLogo
        ? {
            uri:
              typeof user.activeRoleId?.providerLogo === "string"
                ? user.activeRoleId?.providerLogo
                : "",
            name: "companylogo.jpg",
            type: "image/jpeg",
          }
        : undefined,
      providerImages: Array.isArray(user.activeRoleId?.providerImages)
        ? user.activeRoleId.providerImages.map(
            (img, index) =>
              typeof img === "string"
                ? {
                    uri: img,
                    name: `${index}companyimage.jpg`,
                    type: "image/jpeg",
                  }
                : img // already a FileType object
          )
        : [],

      providerLocation: user.activeRoleId?.location?.primary,
    },
  });
  // console.log("isValid", user);

  // console.log("form errors", errors);
  // console.log("form values", getValues());

  const handleFilesChange = (files: FileType[]) => {
    const mappedFiles = files.map((file, index) => ({
      ...file,
      name: file.name ?? "", // Ensure name is always a string
      type: "image/jpeg", // Default to image/jpeg if type is missing
    }));
    setValue("providerImages", mappedFiles);
    if (files.length > 0) {
      clearErrors("providerImages");
    }
  };

  const handleLogoChange = (file: FileType) => {
    setValue("providerLogo", {
      uri: file.uri,
      name: file.name ?? "companylogo.jpg",
      type: "image/jpeg",
    } as any);
    clearErrors("providerLogo");
  };

  useEffect(() => {
    if (locationQuery.length === 0) {
      setPredictions([]);
    }
  }, [locationQuery]);

  const debouncedFetchPredictions = useRef(
    debounce(async (query: string) => {
      if (query.length > 2) {
        try {
          const results = await GooglePlaceService.autocomplete(query);
          setPredictions(results);
        } catch (err: any) {
          setGError(`Autocomplete error ${err.message}`);
        }
      } else {
        setPredictions([]);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (locationQuery) {
      debouncedFetchPredictions(locationQuery);
    } else {
      setPredictions([]);
    }
  }, [locationQuery, debouncedFetchPredictions]);

  const handleLocationSelect = async (prediction: Place) => {
    try {
      const details = await GooglePlaceService.getPlaceDetails(
        prediction.place_id
      );
      const parsed = GooglePlaceService.parseAddressComponents(
        details.address_components || []
      );
      setValue("providerLocation", {
        coordinates: {
          lat: details.geometry.location.lat,
          long: details.geometry.location.lng,
        },
        address: {
          state: parsed.state,
          address: details.formatted_address || parsed.address,
          zip: parsed.zip,
          city: parsed.city,
          country: parsed.country,
        },
      });
      setLocationQuery("");
      setPredictions([]);
    } catch (err: any) {
      console.error(err);
      setGError("Failed to fetch place details.");
    }
  };

  const handleNext = handleSubmit(async (data) => {
    try {
      updateProfile({
        activeRoleId: {
          ...user.activeRoleId,
          providerName: data.providerName,
          providerDescription: data.providerDescription,
          providerEmail: data.providerEmail,
          providerPhoneNumber: data.providerPhoneNumber,
          providerLogo: data.providerLogo as any,
          providerImages: data.providerImages as any,
          location: {
            primary: data.providerLocation,
          },
        },
      });
      await updateUserProfile("Provider");
      completeOnboarding();
      setCurrentStep(0);
    } catch (error) {
      // console.error("Failed to update profile:", error);
      setGError(error as any);
    }
  });

  return (
    <VStack className="flex-1 p-2 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Heading className="text-brand-secondary text-2xl font-bold mb-4">
          Company Basic Information
        </Heading>
        <VStack className="flex-1 gap-6 mb-8">
          {predictions.length === 0 && (
            <HStack className="gap-2">
              <VStack className="w-1/3 justify-center items-center">
                <FormControl
                  className="flex-1"
                  isInvalid={!!errors.providerLogo}
                >
                  <FormControlLabel className="justify-center">
                    <FormControlLabelText className="font-semibold text-base text-typography-700">
                      Company's Logo
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    control={control}
                    name="providerLogo"
                    render={({ field: { value } }) => (
                      <ProfilePic
                        size="md"
                        isEditable={true}
                        showChangeButton={false}
                        imageUri={
                          typeof user?.activeRoleId?.providerImages?.[0] ===
                          "string"
                            ? user?.activeRoleId?.providerImages[0]
                            : undefined
                        }
                        onImageSelected={(file) => handleLogoChange(file)}
                      />
                    )}
                  />

                  {errors.providerLogo && (
                    <FormControlError>
                      <FormControlErrorText className="text-sm">
                        {errors.providerLogo.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>
              </VStack>
              <VStack className="w-2/3 flex-1 gap-4">
                {/**Company Name */}
                <FormControl className="" isInvalid={!!errors.providerName}>
                  <FormControlLabel>
                    <FormControlLabelText className="font-semibold text-base text-typography-700">
                      Company's Name
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    name="providerName"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input className="h-12">
                        <InputField
                          placeholder="Company Name"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="words"
                        />
                      </Input>
                    )}
                  />
                  {errors.providerName && (
                    <FormControlError>
                      <FormControlErrorText className="text-sm">
                        {errors.providerName.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>
                {/** Description */}
                <FormControl isInvalid={!!errors.providerDescription}>
                  <FormControlLabel>
                    <FormControlLabelText className="font-semibold text-base text-typography-700">
                      Company's Description
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    name="providerDescription"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Textarea className="h-24">
                        <TextareaInput
                          placeholder="Company's Description"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </Textarea>
                    )}
                  />
                  {errors.providerDescription && (
                    <FormControlError>
                      <FormControlErrorText className="text-sm">
                        {errors.providerDescription.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>
              </VStack>
            </HStack>
          )}
          <VStack space="lg" className="px-2">
            {/** Email */}
            <FormControl isInvalid={!!errors.providerEmail}>
              <FormControlLabel>
                <FormControlLabelText className="font-semibold text-base text-typography-700">
                  Company's Email
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="providerEmail"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className="h-12">
                    <InputField
                      placeholder="Company's Email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Input>
                )}
              />
              {errors.providerEmail && (
                <FormControlError>
                  <FormControlErrorText className="text-sm">
                    {errors.providerEmail.message}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
            {/** Company Phone Number */}
            <FormControl isInvalid={!!errors.providerPhoneNumber} className="">
              <FormControlLabel>
                <FormControlLabelText className="font-semibold text-base text-typography-700">
                  Company's Phone Number
                </FormControlLabelText>
              </FormControlLabel>

              <Controller
                name="providerPhoneNumber"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  //@ts-ignore
                  <PhoneInput
                    defaultCode="US" // starting country
                    layout="first" // country flag on the left
                    value={value}
                    onChangeFormattedText={onChange} // get +1xxx format
                    containerStyle={{
                      width: "100%",
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      height: 42,
                    }}
                    textContainerStyle={{
                      paddingVertical: 0,
                      backgroundColor: "transparent",
                    }}
                    flagButtonStyle={{ paddingVertical: 0, width: 20 }}
                    placeholder="Enter phone number"
                    autoFocus={false}
                  />
                )}
              />

              {errors.providerPhoneNumber && (
                <FormControlError>
                  <FormControlErrorText className="text-sm">
                    {errors.providerPhoneNumber.message}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
            <FormControl
              className="flex-1"
              isInvalid={!!errors.providerLocation?.address?.address}
            >
              <FormControlLabel>
                <FormControlLabelText className="font-semibold text-base text-typography-700">
                  Company's Primary Address
                </FormControlLabelText>
              </FormControlLabel>
              <Menu
                placement="top"
                className="max-h-96 w-[23.5rem]"
                offset={5}
                crossOffset={-16}
                closeOnSelect={true}
                trigger={({ ...triggerProps }) => {
                  return (
                    <Controller
                      name="providerLocation"
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input className="border-gray-300 h-12 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
                          <InputSlot>
                            <InputIcon
                              as={MapPinIcon}
                              className="text-red-500 ml-4"
                            />
                          </InputSlot>
                          <InputField
                            {...triggerProps}
                            placeholder={
                              value?.address.address || "Get Location"
                            }
                            value={locationQuery}
                            className="placeholder:text-base placeholder:text-gray-400 placeholder:line-clamp-1"
                            onChangeText={(text) => setLocationQuery(text)}
                            onBlur={onBlur}
                          />
                        </Input>
                      )}
                    />
                  );
                }}
              >
                {predictions.length > 0 &&
                  predictions.map((prediction) => (
                    <MenuItem
                      key={prediction.place_id}
                      textValue={prediction.description}
                      onPress={() => handleLocationSelect(prediction)}
                    >
                      <MenuItemLabel>{prediction.description}</MenuItemLabel>
                    </MenuItem>
                  ))}
              </Menu>
              {errors.providerLocation?.address?.address && (
                <FormControlError>
                  <FormControlErrorText className="text-sm">
                    {errors.providerLocation.address.address.message}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
            <FormControl className="flex-1" isInvalid={!!errors.providerImages}>
              <FormControlLabel>
                <FormControlLabelText className="font-semibold text-base text-typography-700">
                  Company's Images
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="providerImages"
                render={({ field: { value } }) => (
                  <MediaPicker
                    maxFiles={4}
                    maxSize={10}
                    initialFiles={value as any}
                    onFilesChange={handleFilesChange}
                  />
                )}
              />
              {errors.providerImages && (
                <FormControlError>
                  <FormControlErrorText className="text-sm">
                    {errors.providerImages.message}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
          </VStack>
        </VStack>
      </ScrollView>
      <Button
        size="xl"
        className="mb-4 mt-2 bg-brand-secondary border-0 mx-2"
        isDisabled={!isValid || isLoading}
        onPress={() => handleNext()}
      >
        <ButtonText className="text-white">Continue</ButtonText>
      </Button>
    </VStack>
  );
};

export default CompanyBasicInfo;
