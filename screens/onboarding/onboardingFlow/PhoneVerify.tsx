import React, { useState, useEffect, useRef } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { getAppData, setAppData } from "@/utils/getStorageData";
import { PersistedAppState } from "@/types";
import { useRouter } from "expo-router";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import useGlobalStore from "@/store/globalStore";
import { z } from "zod";
import { Keyboard, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema } from "@/screens/auth/AuthFormSchema";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { Icon, EditIcon, CheckIcon, CloseIcon } from "@/components/ui/icon";
import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} from "libphonenumber-js";
import { Pressable } from "@/components/ui/pressable";

const PhoneVerificationPage = () => {
  const [phone, setPhone] = useState<string | null>(null);
  const [originalPhone, setOriginalPhone] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isEditing, setIsEditing] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const [maxEdits] = useState(1); // Allow only one edit
  const [tempPhone, setTempPhone] = useState("");
  const {
    verifyPhone,
    sendCode,
    isLoading,
    setError,
    setSuccess,
    setCurrentStep,
  } = useGlobalStore();
  const router = useRouter();
  const toast = useToast();

  const PhoneVerifySchema = FormSchema.pick(
    isEditing ? { phoneNumber: true } : { code: true }
  );
  type PhoneVerifySchemaType = z.infer<typeof PhoneVerifySchema>;

  const inputRefs = useRef<Array<any>>([]);
  const phoneInputRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PhoneVerifySchemaType>({
    resolver: zodResolver(PhoneVerifySchema),
    defaultValues: {
      code: "",
      phoneNumber: "",
    },
  });

  // const phoneNumberValue = watch("phoneNumber");

  useEffect(() => {
    const fetchPhoneData = async () => {
      const appData: PersistedAppState | null = await getAppData();
      if (appData && appData.user) {
        setPhone(appData.user.phoneNumber);
        setOriginalPhone(appData.user.phoneNumber);
        setValue("phoneNumber", appData.user.phoneNumber);

        // Load edit count from storage
        const editCount = appData.user.phoneEditCount || 0;
        setEditCount(editCount);
      }
    };
    fetchPhoneData();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (
      (key === "Enter" || key === "Done" || key === "Return") &&
      index === otp.length - 1
    ) {
      handleSubmit(handleVerifyPhone)();
    }
  };

  const validatePhoneNumber = (value: string): boolean | string => {
    if (!value) return "Phone number is required";

    try {
      const phoneNumber = parsePhoneNumberFromString(value, "US"); // or use country from user profile
      return phoneNumber && isValidPhoneNumber(phoneNumber.number)
        ? true
        : "Please enter a valid phone number";
    } catch {
      return "Invalid phone number format";
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit
      setTempPhone("");
      setIsEditing(false);
    } else if (editCount < maxEdits) {
      // Start editing
      setTempPhone(phone || "");
      setIsEditing(true);
      setTimeout(() => phoneInputRef.current?.focus(), 100);
    } else {
      setError(
        " You can only edit your phone number once. Contact support for further changes."
      );
    }
  };

  const handleSaveEdit = async () => {
    const validation = validatePhoneNumber(tempPhone);
    if (validation !== true) {
      setError(validation.toString());
      return;
    }

    try {
      // Update phone number in storage
      const appData: PersistedAppState | null = await getAppData();
      if (appData && appData.user) {
        const updatedUser = {
          ...appData.user,
          phoneNumber: tempPhone,
          phoneEditCount: (appData.user.phoneEditCount || 0) + 1,
          phoneVerified: false, // Reset verification status
        };

        await setAppData({
          ...appData,
          user: updatedUser,
        });

        setPhone(tempPhone);
        setEditCount(updatedUser.phoneEditCount);
        setIsEditing(false);
        setOtp(["", "", "", "", "", ""]);
        setValue("code", "");
        setSuccess("Phone number updated. Verification required.");
        // Send new verification code
        await handleSendCode(tempPhone);
      }
    } catch (error) {
      setError("Failed to update phone number.");
    }
  };

  const handleVerifyPhone = async (data: {
    code: string;
    phoneNumber?: string;
  }) => {
    try {
      Keyboard.dismiss();
      await verifyPhone(data.code);

      // Update verification status in storage
      const appData: PersistedAppState | null = await getAppData();
      if (appData && appData.user) {
        await setAppData({
          ...appData,
          user: {
            ...appData.user,
            isPhoneVerified: true,
          },
        });
      }

      setSuccess("Phone number verified successfully");
      setCurrentStep(5);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Phone verification failed");
    }
  };

  const handleSendCode = async (phoneNumber?: string) => {
    if (cooldown > 0) return;

    try {
      const targetPhone = phoneNumber || phone;
      if (!targetPhone) {
        setError("Phone number not found");
        return;
      }

      await sendCode(targetPhone);
      setSuccess("Verification code sent");

      Keyboard.dismiss();
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      setValue("code", "");
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Failed to send verification code"
      );
    }
  };

  const editsRemaining = maxEdits - editCount;

  return (
    <VStack className="bg-white p-4 h-full">
      <Card className="gap-8">
        <VStack className="items-center gap-6">
          <Heading size="xl" className="text-brand-primary">
            Phone Verification
          </Heading>

          <VStack className="items-center gap-4 w-full">
            <Text className="text-center text-gray-600">
              A verification code has been sent to
            </Text>

            {/* Phone Number Display/Edit Section */}
            <VStack className="items-center gap-2 w-full">
              <HStack className="items-center justify-center gap-2">
                {isEditing ? (
                  <FormControl
                    className="flex-1"
                    isInvalid={!!errors.phoneNumber}
                  >
                    <Input className="border-0 bg-brand-primary/10">
                      <InputField
                        ref={phoneInputRef}
                        placeholder="Enter phone number"
                        value={tempPhone}
                        onChangeText={setTempPhone}
                        keyboardType="phone-pad"
                        maxLength={15}
                      />
                    </Input>
                  </FormControl>
                ) : (
                  <Heading
                    size="sm"
                    className="bg-green-100 p-2 rounded-lg text-green-800"
                  >
                    {phone || "+2349139290549"}
                  </Heading>
                )}

                {isEditing ? (
                  <HStack className="gap-1">
                    <TouchableOpacity
                      onPress={handleSaveEdit}
                      className="p-2 bg-green-500/20 rounded-lg"
                    >
                      <Icon as={CheckIcon} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsEditing(false)}
                      className="p-2 bg-red-500/20 rounded-lg"
                    >
                      <Icon as={CloseIcon} color="red" />
                    </TouchableOpacity>
                  </HStack>
                ) : (
                  <Pressable
                    onPress={handleEditToggle}
                    disabled={editCount >= maxEdits}
                    className={`p-2 rounded-lg ${
                      editCount >= maxEdits
                        ? "bg-gray-300/20"
                        : "bg-blue-500/20"
                    }`}
                  >
                    <Icon
                      as={EditIcon}
                      color={editCount >= maxEdits ? "gray" : "blue"}
                    />
                  </Pressable>
                )}
              </HStack>

              {!isEditing && editsRemaining > 0 && (
                <Text className="text-sm text-blue-600">
                  You can edit your phone number {editsRemaining} more time
                  {editsRemaining !== 1 ? "s" : ""}
                </Text>
              )}

              {!isEditing && editsRemaining === 0 && (
                <Text className="text-sm text-red-600">
                  No more edits allowed. Contact support for changes.
                </Text>
              )}
            </VStack>

            <Text className="text-center mt-4 text-gray-500">
              Please check your messages and enter the code below to verify your
              phone number.
            </Text>
          </VStack>
        </VStack>

        <VStack className="mt-6 gap-10">
          <FormControl isInvalid={!!errors.code}>
            <Controller
              control={control}
              name="code"
              render={({ field: { onBlur } }) => (
                <VStack className="gap-4">
                  <FormControlLabel>
                    <FormControlLabelText>
                      Verification Code
                    </FormControlLabelText>
                  </FormControlLabel>
                  <HStack className="justify-center gap-3">
                    {otp.map((digit: string, index: number) => (
                      <Input key={index} className="w-12 h-12 border-0">
                        <InputField
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          placeholder="•"
                          keyboardType="number-pad"
                          maxLength={1}
                          className="text-center text-xl border-2 border-gray-300 rounded-lg focus:border-blue-500"
                          value={digit}
                          onChangeText={(text) => {
                            const newOtp = [...otp];
                            newOtp[index] = text;
                            setOtp(newOtp);
                            setValue("code", newOtp.join(""));
                            if (text && index < otp.length - 1 && text) {
                              inputRefs.current[index + 1]?.focus();
                            }
                            if (
                              index === otp.length - 1 &&
                              text &&
                              newOtp.every((d) => d)
                            ) {
                              handleSubmit(handleVerifyPhone)();
                            }
                          }}
                          onKeyPress={({ nativeEvent: { key } }) =>
                            handleKeyPress(index, key)
                          }
                          onBlur={onBlur}
                        />
                      </Input>
                    ))}
                  </HStack>
                </VStack>
              )}
            />
            {errors.code && (
              <FormControlError>
                <FormControlErrorText>
                  {errors.code.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          <VStack className="gap-8">
            <Button
              size="xl"
              variant="solid"
              onPress={handleSubmit(handleVerifyPhone)}
              isDisabled={isLoading || otp.some((digit) => digit === "")}
              className="w-full bg-brand-primary data-[hover=true]:bg-blue-600"
            >
              <ButtonText>
                {isLoading ? "Verifying..." : "Verify Phone"}
              </ButtonText>
            </Button>

            <Button
              variant="outline"
              onPress={() => handleSendCode()}
              isDisabled={cooldown > 0 || isLoading || isEditing}
              className="w-full border-0 data-[hover=true]:bg-gray-100"
            >
              <ButtonText className="text-gray-700">
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend Verification Code"}
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Card>
    </VStack>
  );
};

export default PhoneVerificationPage;
