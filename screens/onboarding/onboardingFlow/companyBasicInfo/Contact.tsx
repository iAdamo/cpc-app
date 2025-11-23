import { useState, useEffect, useRef } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { MapPinIcon } from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";
import { companyFormSchema } from "@/components/schema/CompanySchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-native-phone-number-input";
import { ScrollView } from "@/components/ui/scroll-view";
import { GooglePlaceService } from "@/services/googlePlaceService";
import { Place } from "@/types";
import { debounce } from "lodash";

const ContactInfo = () => {
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [predictions, setPredictions] = useState<Place[]>([]);
  const {
    user,
    currentStep,
    setCurrentStep,
    isLoading,
    setError: setGError,
    onboardingData,
    setOnboardingData,
    getCurrentLocation,
    currentLocation,
  } = useGlobalStore();
  if (!user) return;

  const ContactSchema = companyFormSchema.pick({
    providerEmail: true,
    providerPhoneNumber: true,
    providerLocation: true,
  });
  type ContactSchemaType = z.infer<typeof ContactSchema>;
  console.log({ onboardingData });
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<ContactSchemaType>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      providerEmail: onboardingData["providerEmail"],
      providerPhoneNumber: onboardingData["providerPhoneNumber"],
      providerLocation: onboardingData["providerLocation"]
        ? JSON.parse(onboardingData["providerLocation"])
        : {},
    },
  });
  // console.log("isValid", user);

  console.log("form errors", errors);
  // console.log("form values", getValues());

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
        primary: {
          coordinates: [
            details.geometry.location.lat,
            details.geometry.location.lng,
          ],
          address: {
            state: parsed.state,
            address: details.formatted_address || parsed.address,
            zip: parsed.zip,
            city: parsed.city,
            country: parsed.country,
          },
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
      setOnboardingData({
        providerEmail: data.providerEmail,
        providerPhoneNumber: data.providerPhoneNumber,
        providerLocation: JSON.stringify(data.providerLocation),
      });
    } catch (error) {
      console.error("Failed to set onboarding data:", error);
    }
    setCurrentStep(currentStep + 1);
  });

  const handleBack = () => {
    try {
      setOnboardingData({
        providerEmail: getValues().providerEmail,
        providerPhoneNumber: getValues().providerPhoneNumber,
        providerLocation: getValues().providerLocation
          ? JSON.stringify(getValues().providerLocation)
          : "",
      });
    } catch (error) {
      console.error("Failed to set onboarding data:", error);
    }
    setCurrentStep(currentStep - 1);
  };

  return (
    <VStack className="flex-1 p-2 bg-white">
      <Text
        size="sm"
        className="text-typography-400 font-medium mb-6 self-center"
      >
        Step 2 of 3 . Contact Information
      </Text>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Heading
          size="2xl"
          className="text-brand-secondary mb-4 self-center text-center px-8"
        >
          How can customers reach you?
        </Heading>

        <VStack className="flex-1 gap-8 p-4">
          {/** Email */}
          <FormControl isInvalid={!!errors.providerEmail}>
            <FormControlLabel>
              <FormControlLabelText className="">Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="providerEmail"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input className="h-12">
                  <InputField
                    type="text"
                    placeholder="email@example.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </Input>
              )}
            />
            {errors.providerEmail && (
              <FormControlError>
                <FormControlErrorText className="text-sm bg-red-200 px-2 py-1 rounded-md">
                  {errors.providerEmail.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
          {/** Company Phone Number */}
          <FormControl isInvalid={!!errors.providerPhoneNumber} className="">
            <FormControlLabel>
              <FormControlLabelText className="">Phone</FormControlLabelText>
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
                <FormControlErrorText className="text-sm bg-red-200 px-2 py-1 rounded-md">
                  {errors.providerPhoneNumber.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
          <FormControl
            className="flex-1"
            isInvalid={!!errors.providerLocation?.primary?.address?.address}
          >
            <VStack space="xs" className="mb-2">
              <Heading>Enable Location</Heading>
              <Text>
                Companies Center uses your location to improve search results
                and more.
              </Text>
            </VStack>

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
                      <Input className="border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
                        <InputSlot>
                          <InputIcon
                            as={MapPinIcon}
                            className="text-red-500 ml-4"
                          />
                        </InputSlot>
                        <InputField
                          {...triggerProps}
                          placeholder={
                            value?.primary?.address.address ||
                            "Enter your business address"
                          }
                          value={locationQuery}
                          className="placeholder:text-lg placeholder:text-gray-400 placeholder:line-clamp-1"
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

            {errors.providerLocation?.primary?.address?.address && (
              <FormControlError className="self-end mt-4">
                <FormControlErrorText className="text-sm bg-red-200 px-2 py-1 rounded-md">
                  {errors.providerLocation.primary?.address.address.message}
                </FormControlErrorText>
              </FormControlError>
            )}
            <Button
              className="mt-6 self-center bg-red-600"
              onPress={() => {
                getCurrentLocation();
                if (currentLocation) {
                  setValue("providerLocation", {
                    primary: {
                      coordinates: [
                        currentLocation.coords.latitude,
                        currentLocation.coords.longitude,
                      ],
                      address: {
                        address: currentLocation.formattedAddress || "",
                        city: currentLocation.city || "",
                        state: currentLocation.region || "",
                        zip: currentLocation.postalCode || "",
                        country: currentLocation.country || "",
                      },
                    },
                  });
                }
              }}
            >
              {isLoading ? (
                <ButtonSpinner />
              ) : (
                <ButtonText>Auto locate Me</ButtonText>
              )}
            </Button>
          </FormControl>
        </VStack>
      </ScrollView>
      <HStack className="my-4 justify-between p-4">
        <Button
          variant="outline"
          className=" border-0 mx-2"
          isDisabled={isLoading}
          onPress={() => handleBack()}
        >
          <ButtonText size="xl" className="">
            Back
          </ButtonText>
        </Button>
        <Button
          variant="outline"
          className="border-0 mx-2"
          isDisabled={isLoading}
          onPress={() => handleNext()}
        >
          <ButtonText size="xl" className="text-brand-secondary">
            Next
          </ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
};

export default ContactInfo;
