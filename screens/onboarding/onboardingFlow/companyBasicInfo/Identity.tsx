import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Input, InputField } from "@/components/ui/input";
import useGlobalStore from "@/store/globalStore";
import { companyFormSchema } from "@/components/schema/CompanySchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { ScrollView } from "@/components/ui/scroll-view";
import { FileType, Place, MediaItem } from "@/types";
import ProfilePic from "@/components/profile/ProfilePic";

const Identity = () => {
  const {
    user,
    currentStep,
    setCurrentStep,
    isLoading,
    onboardingData,
    setOnboardingData,
  } = useGlobalStore();
  if (!user) return;

  const IdentitySchema = companyFormSchema.pick({
    providerName: true,
    providerDescription: true,
    providerLogo: true,
  });
  type IdentitySchemaType = z.infer<typeof IdentitySchema>;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<IdentitySchemaType>({
    resolver: zodResolver(IdentitySchema),
    defaultValues: {
      providerName: onboardingData["providerName"],
      providerDescription: onboardingData["providerDescription"],
      providerLogo: onboardingData["providerLogo"] || {},
    },
  });
  // console.log("isValid", user);

  // console.log("form errors", errors);
  // console.log("form values", getValues("providerLogo"));

  const handleLogoChange = (file: FileType) => {
    setValue("providerLogo", {
      uri: file.uri,
      name: file.name ?? "companylogo.jpg",
      type: file.type || "image/jpeg",
    } as any);
    clearErrors("providerLogo");
  };

  const handleNext = handleSubmit((data) => {
    setOnboardingData({
      providerName: data.providerName,
      providerDescription: data.providerDescription,
      providerLogo: data.providerLogo,
    });
    setCurrentStep(currentStep + 1);
  });

  const handleBack = () => {
    setOnboardingData({
      providerName: getValues().providerName,
      providerDescription: getValues().providerDescription,
      providerLogo: getValues().providerLogo || {},
    });
    setCurrentStep(currentStep - 1);
  };

  return (
    <VStack className="flex-1 pt-16 bg-white">
      <Text
        size="sm"
        className="text-typography-400 font-medium mb-6 self-center"
      >
        Step 1 of 3 . Identity
      </Text>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Heading
          size="2xl"
          className="text-brand-secondary mb-4 self-center text-center"
        >
          Let's get to know your company
        </Heading>
        <Text
          size="xl"
          className="text-brand-secondary mb-4 self-center px-12 text-center"
        >
          Provide some basic info so clients can trust you.
        </Text>
        <VStack className="flex-1 gap-6 mb-8 p-4">
          <FormControl className="flex-1" isInvalid={!!errors.providerLogo}>
            <Controller
              control={control}
              name="providerLogo"
              render={({ field: { value } }) => (
                <ProfilePic
                  size="md"
                  isEditable={true}
                  showChangeButton={false}
                  button={true}
                  imageUri={
                    onboardingData["providerLogo"]?.uri ||
                    (user?.activeRoleId?.providerLogo as MediaItem)
                      ?.thumbnail ||
                    undefined
                  }
                  // imageUri={
                  //   typeof user?.activeRoleId?.providerImages?.[0] === "string"
                  //     ? user?.activeRoleId?.providerImages[0]
                  //     : undefined
                  // }
                  onImageSelected={(file) => handleLogoChange(file)}
                />
              )}
            />

            {errors.providerLogo && (
              <FormControlError>
                <FormControlErrorText className="text-sm bg-red-200 px-2 py-1 rounded-md">
                  {errors.providerLogo.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
          <VStack className="flex-1 gap-6">
            {/**Company Name */}
            <FormControl className="" isInvalid={!!errors.providerName}>
              <FormControlLabel>
                <FormControlLabelText className="">
                  Company's Name
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="providerName"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className="h-12">
                    <InputField
                      placeholder="e.g John's Plumbing Services"
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
                  <FormControlErrorText className="text-sm bg-red-200 px-2 py-1 rounded-md">
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
                  <Textarea className="h-28">
                    <TextareaInput
                      placeholder="Describe your company, services, and values..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Textarea>
                )}
              />
              {errors.providerDescription && (
                <FormControlError>
                  <FormControlErrorText className="text-sm bg-red-200 px-2 py-1 rounded-md">
                    {errors.providerDescription.message}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
          </VStack>
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

export default Identity;
