import React, { useState, useEffect, useRef } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { AppStorage } from "@/utils/storageData";
import { PersistedAppState } from "@/types";
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
import { Icon, EditIcon, CheckIcon, CloseIcon } from "@/components/ui/icon";

const EmailVerificationPage = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isEditing, setIsEditing] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const [maxEdits] = useState(5); // Allow only one edit
  const [tempEmail, setTempEmail] = useState("");
  const {
    verifyEmail,
    sendCode,
    isLoading,
    setError,
    setSuccess,
    setCurrentStep,
    currentStep,
    isAuthenticated,
    updateUserProfile,
    updateProfile
  } = useGlobalStore();

  const EmailVerifySchema = FormSchema.pick(
    isEditing ? { email: true } : { code: true }
  );
  type EmailVerifySchemaType = z.infer<typeof EmailVerifySchema>;

  const inputRefs = useRef<Array<any>>([]);
  const emailInputRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    // watch,
    formState: { errors },
  } = useForm<EmailVerifySchemaType>({
    resolver: zodResolver(EmailVerifySchema),
    defaultValues: {
      code: "",
      email: "",
    },
  });

  const appStorage = new AppStorage();

  useEffect(() => {
    const fetchEmailData = async () => {
      const appData: PersistedAppState | null = await appStorage.getAppData();
      if (appData && appData.state.user) {
        setEmail(appData.state.user.email);
        // Load edit count from storage
        const editCount = appData.state.user.emailEditCount || 0;
        setEditCount(editCount);
      }
    };
    fetchEmailData();
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
      handleSubmit(handleVerifyEmail)();
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit
      setTempEmail("");
      setIsEditing(false);
      // setMessage(null);
    } else if (editCount < maxEdits) {
      // Start editing
      setTempEmail(email || "");
      setIsEditing(true);
      setTimeout(() => emailInputRef.current?.focus(), 100);
    } else {
      setError(
        "You can only edit your email once. Contact support for further changes."
      );
    }
  };

  const handleSaveEdit = async () => {
    if (tempEmail === email) {
      setIsEditing(false);
      return;
    }
    Keyboard.dismiss();
    if (editCount >= maxEdits) {
      setError("No more edits allowed. Contact support for changes.");
      return;
    }
    if (!FormSchema.shape.email.safeParse(tempEmail).success) {
      setError("Please enter a valid email address.");
      return;
    }

    // Fetch current user data to construct a full UserData object
    const form = new FormData();
    form.append("email", tempEmail);
    form.append("emailEditCount", (editCount + 1).toString());
    form.append("isEmailVerified", "false");
    if (!(await updateUserProfile(form))) {
      return;
    }

    setEmail(tempEmail); // <-- update local state
    setEditCount(editCount + 1);
    setIsEditing(false);
    setOtp(["", "", "", "", "", ""]);
    setValue("code", "");
    setSuccess("Email updated. Verification required.");

    // Send new verification code
    await handleSendCode();
  };

  const handleVerifyEmail = async () => {
    Keyboard.dismiss();
    //console.log("Verifying email with code:", code);
    if (!(await verifyEmail(email!, getValues("code")))) return;

    // Update verification status in storage
    updateProfile({ isEmailVerified: true });

    isAuthenticated && setCurrentStep(currentStep + 1);
  };

  const handleSendCode = async () => {
    if (cooldown > 0) return;

    if (!(await sendCode(email!))) return;

    Keyboard.dismiss();
    setCooldown(30);
    setOtp(["", "", "", "", "", ""]);
    setValue("code", "");
  };

  const editsRemaining = maxEdits - editCount;

  return (
    <VStack className="bg-white p-4 h-full">
      <Card className="gap-8">
        <VStack className="items-center gap-6">
          <Heading size="xl" className="text-brand-primary">
            Email Verification
          </Heading>

          <VStack className="items-center gap-4 w-full">
            <Text className="text-center text-gray-600">
              A verification code has been sent to
            </Text>

            {/* Email Display/Edit Section */}
            <VStack className="items-center gap-2 w-full">
              <HStack className="items-center justify-center gap-2">
                {isEditing ? (
                  <FormControl className="flex-1" isInvalid={!!errors.email}>
                    <Input className="h-10 border-0 bg-brand-primary/10">
                      <InputField
                        ref={emailInputRef}
                        placeholder="Enter email address"
                        value={tempEmail}
                        onChangeText={setTempEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </Input>
                  </FormControl>
                ) : (
                  <Heading
                    size="sm"
                    className="bg-green-100 p-2 rounded-lg text-green-800"
                  >
                    {email || "Loading..."}
                  </Heading>
                )}

                <HStack className="gap-1">
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
              </HStack>

              {!isEditing && editsRemaining > 0 && (
                <Text className="text-sm text-blue-600">
                  You can edit your email {editsRemaining} more time
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
              Please check your inbox and enter the code below to verify your
              email address.
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
                              handleSubmit(handleVerifyEmail)();
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
              onPress={handleSubmit(handleVerifyEmail)}
              isDisabled={isLoading || otp.some((digit) => digit === "")}
              className="w-full bg-brand-primary data-[hover=true]:bg-blue-600"
            >
              <ButtonText>
                {isLoading ? "Verifying..." : "Verify Email"}
              </ButtonText>
            </Button>

            <Button
              variant="outline"
              onPress={() => handleSendCode()}
              isDisabled={cooldown > 0 || isLoading || isEditing}
              className="w-full border-0"
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

export default EmailVerificationPage;
