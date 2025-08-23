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
import VerifyCodeModal from "@/screens/auth/VerifyCodeModal";
import { Spinner } from "@/components/ui/spinner";
import useGlobalStore from "@/store/globalStore";
import { SafeAreaView } from "react-native-safe-area-context";

type ControllerRenderType = {
  field: {
    onChange: (value: string) => void;
    onBlur: () => void;
    value: string;
  };
};

interface ValidatedState {
  emailValid: boolean;
  passwordValid: boolean;
}

interface RenderProps {
  id: string;
}

const SignUpScreen = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);

  const { signUp, isLoading, setError } = useGlobalStore();

  const router = useRouter();

  const switchToSignIn = () => {
    router.replace("/auth/signin");
  };
  const toast = useToast();

  const showToast = useCallback(
    (message: string, type: "error" | "success") => {
      toast.show({
        placement: "bottom",
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={id} variant="solid" action={type}>
            <ToastTitle>{message}</ToastTitle>
          </Toast>
        ),
      });
    },
    [toast]
  );
  // Define a type that matches the schema after omitting "code"
  type SignUpFormType = z.infer<
    ReturnType<typeof FormSchema.omit<{ code: true }>>
  >;

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
    passwordValid: true,
  });

  // handle form submission
  const onSubmit = async (data: SignUpFormType) => {
    Keyboard.dismiss();
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      showToast("Passwords do not match", "error");
      return;
    } else {
      try {
        await signUp(data);
        setShowVerifyEmailModal(true);
        showToast("Account created successfully", "success");
      } catch (error) {
        setValidated({ emailValid: false, passwordValid: false });
        showToast(
          (error as any).response?.data?.message ||
            "An unexpected error occurred",
          "error"
        );
      }
    }
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
      <VStack className="h-3/5 justify-end">
        <Card className="shadow-xl gap-8">
          <Heading size="xl" className="text-brand-primary">
            Let's get started!
          </Heading>

          <VStack className="gap-4">
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
            <VStack className="gap-2 w-full">
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
      <VStack className="h-2/5 justify-center items-center">
        <VStack className="items-center gap-2">
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

      {showVerifyEmailModal && (
        <VerifyCodeModal
          isOpen={showVerifyEmailModal}
          onClose={() => setShowVerifyEmailModal(false)}
          email={getValues("email")}
          onVerified={async () => {
            reset();
            setShowVerifyEmailModal(false);
            router.replace("/");
          }}
          isVerified={true}
        />
      )}
    </VStack>
  );
};

export default SignUpScreen;
