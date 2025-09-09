import React, { useState, useCallback } from "react";
import { Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema, FormSchemaType } from "@/screens/auth/AuthFormSchema";
import { z } from "zod";
import { Toast, useToast, ToastTitle } from "@/components/ui/toast";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import Link, { useRouter } from "expo-router";
// import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import useGlobalStore from "@/store/globalStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ControllerRenderType = {
  field: {
    onChange: (value: string) => void;
    onBlur: () => void;
    value: string;
  };
};

interface ValidatedState {
  emailValid: boolean;
  phoneNumberValid: boolean;
  passwordValid: boolean;
}

const SignUpScreen = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    signUp,
    isLoading,
    setError,
    setCurrentStep,
    currentStep,
  } = useGlobalStore();

  const router = useRouter();

  const switchToSignIn = () => {
    useGlobalStore.setState({
      isAuthenticated: false,
      isOnboardingComplete: true,
    });
    router.replace("/auth/signin");
  };

  // Define a type that matches the schema after omitting "code"

  type SignUpFormType = Omit<z.infer<typeof FormSchema>, "code"> & {
    referrerId?: string;
  };

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<SignUpFormType>({
    resolver: zodResolver(FormSchema.omit({ code: true })),
  });

  // handle form validation
  const [validated, setValidated] = useState<ValidatedState>({
    emailValid: true,
    phoneNumberValid: true,
    passwordValid: true,
  });

  // handle form submission
  const onSubmit = async (data: SignUpFormType) => {
    Keyboard.dismiss();
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const referrerId = await AsyncStorage.getItem("referrerId");
    if (referrerId) {
      data = { ...data, referrerId };
    }

    if (!(await signUp(data))) {
      setValidated({
        emailValid: false,
        phoneNumberValid: false,
        passwordValid: false,
      });
      return;
    }
    reset();
    setCurrentStep(currentStep + 1);
  };

  // handle password visibility
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  const handleConfirmPasswordState = () => {
    setShowConfirmPassword((showState) => {
      return !showState;
    });
  };

  // handle form submission on enter key press
  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  return (
    <VStack className="bg-white p-4">
      <VStack className="justify-end">
        <Card className="shadow-xl gap-8">
          <Heading size="xl" className="text-brand-primary">
            Let's get started!
          </Heading>
          <VStack className="gap-4">
            {/* Phone Number */}
            <FormControl
              className="w-full"
              isInvalid={!!errors?.phoneNumber || !validated.phoneNumberValid}
            >
              <FormControlLabel>
                <FormControlLabelText>Phone Number</FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="phoneNumber"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className="h-12">
                    <InputField
                      placeholder="Phone Number"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                      className=""
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors?.phoneNumber?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            {/** Email */}
            <FormControl
              className="w-full"
              isInvalid={!!errors?.email || !validated.emailValid}
            >
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="email"
                control={control}
                render={({
                  field: { onChange, onBlur, value },
                }: ControllerRenderType) => (
                  <Input className="h-12">
                    <InputField
                      placeholder="Email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                      className=""
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors?.email?.message || !validated.emailValid}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            {/** Password */}
            <FormControl
              className="w-full"
              isInvalid={!!errors.password || !validated.passwordValid}
            >
              <FormControlLabel>
                <FormControlLabelText>Password</FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="password"
                control={control}
                render={({
                  field: { onChange, onBlur, value },
                }: ControllerRenderType) => (
                  <Input className="h-12">
                    <InputField
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                      className=""
                    />
                    <InputSlot onPress={handleState} className="pr-3">
                      <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                    </InputSlot>
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors?.password?.message || !validated.passwordValid}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            {/* ------------------------------------------ Confirm Password -------------------------------------------*/}
            <FormControl
              className="w-full"
              isInvalid={!!errors.confirmPassword}
            >
              <FormControlLabel>
                <FormControlLabelText>Confirm Password</FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="confirmPassword"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className="h-12">
                    <InputField
                      className=""
                      placeholder="Confirm Password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleKeyPress}
                      returnKeyType="done"
                      type={showConfirmPassword ? "text" : "password"}
                    />

                    <InputSlot
                      onPress={handleConfirmPasswordState}
                      className="pr-3"
                    >
                      <InputIcon
                        as={showConfirmPassword ? EyeIcon : EyeOffIcon}
                      />
                    </InputSlot>
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors?.confirmPassword?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            {/* ----------------------------------- Sign Up Button ------------------------------------------ */}
            <VStack className="gap-2 w-full mt-4">
              <Button
                size="xl"
                isDisabled={isLoading}
                className="w-full bg-brand-primary"
                onPress={handleSubmit(onSubmit)}
              >
                <ButtonText>{isLoading ? <Spinner /> : "Sign Up"}</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Card>
      </VStack>
      <VStack className="mt-24 items-center gap-2">
        <Text size="md" className="text-text-secondary text-center">
          Already have an account?
        </Text>
        <Button
          onPress={switchToSignIn}
          className="bg-brand-secondary hover:bg-btn-secondary active:bg-brand-secondary"
        >
          <ButtonText className="">Sign In Here</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};

export default SignUpScreen;
