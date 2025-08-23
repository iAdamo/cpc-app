import React, { useState, useEffect, useRef } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { getAppData } from "@/utils/getStorageData";
import { PersistedAppState } from "@/types";
import { useRouter } from "expo-router";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import useGlobalStore from "@/store/globalStore";
import { z } from "zod";
import { Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema } from "@/screens/auth/AuthFormSchema";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";

const EmailVerificationPage = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const { verifyEmail, sendCode, isLoading, setError, setSuccess } =
    useGlobalStore();
  const router = useRouter();
  const toast = useToast();

  const EmailVerifySchema = FormSchema.pick({ code: true });
  type EmailVerifySchemaType = z.infer<typeof EmailVerifySchema>;
  const inputRefs = useRef<Array<any>>([]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmailVerifySchemaType>({
    resolver: zodResolver(EmailVerifySchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    const fetchEmail = async () => {
      const appData: PersistedAppState | null = await getAppData();
      if (appData && appData.user) {
        setEmail(appData.user.email);
      }
    };
    fetchEmail();
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
      // Submit on Enter/Done/Return key at last input
      handleSubmit(handleVerifyEmail)();
    }
  };

  const handleVerifyEmail = async (data: { code: string }) => {
    console.log("Verifying code:", data.code);
    try {
      Keyboard.dismiss();
      await verifyEmail(data.code);
      setSuccess("Email verified successfully");
      // Navigate to next screen or perform success action
      router.push("/");
    } catch (error: any) {
      setError(error?.response?.data?.message || "Email verification failed");
    }
  };

  const handleSendCode = async () => {
    if (cooldown > 0) return;

    try {
      if (!email) {
        setError("Email not found");
        return;
      }

      await sendCode(email);
      setSuccess("Code sent, check your inbox");

      Keyboard.dismiss();
      setCooldown(30); // start 30-second cooldown
      setOtp(["", "", "", "", "", ""]); // Reset OTP fields
      setValue("code", ""); // Reset form value
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Failed to send verification code"
      );
    }
  };

  return (
    <VStack className="bg-white p-4 h-full mt-20">
      <Card className="gap-8">
        <VStack className="items-center gap-6">
          <Heading size="xl" className="text-brand-primary">
            Email Verification
          </Heading>
          <VStack className="items-center gap-2">
            <Text className="text-center text-gray-600">
              A verification code has been sent to
            </Text>
            <Heading
              size="sm"
              className="bg-green-100 p-2 rounded-lg text-green-800"
            >
              {email || "Loading..."}
            </Heading>
            <Text className="text-center mt-4 text-gray-500">
              Please check your inbox and enter the code below to verify your
              email address.
            </Text>
          </VStack>
        </VStack>
        <VStack className="mt-10 gap-20">
          <FormControl isInvalid={!!errors.code}>
            <Controller
              control={control}
              name="code"
              render={({ field: { onBlur } }) => (
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
                          // If last input and all filled, submit
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
              onPress={handleSendCode}
              isDisabled={cooldown > 0 || isLoading}
              className="w-full border-0 border-gray-300 data-[hover=true]:bg-gray-100"
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
