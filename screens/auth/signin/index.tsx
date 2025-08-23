import { useState } from "react";
import { Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema, FormSchemaType } from "@/screens/auth/AuthFormSchema";
import { Toast, useToast, ToastTitle } from "@/components/ui/toast";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
// import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import ForgotPasswordModal from "@/screens/auth/ForgotPassword";
import { Spinner } from "@/components/ui/spinner";
import useGlobalStore from "@/store/globalStore";

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

const SignInScreen = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  //const { login } = useSession();
  const router = useRouter();
  const { login, isLoading } = useGlobalStore();
  const switchToSignUp = () => {
    router.replace("/auth/signup");
  };
  const toast = useToast();

  // handle form submission
  const SignInSchema = FormSchema.omit({ confirmPassword: true, code: true });
  type SignInSchemaType = z.infer<typeof SignInSchema>;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
  });

  // handle form validation
  const [validated, setValidated] = useState<ValidatedState>({
    emailValid: true,
    passwordValid: true,
  });

  // handle form submission
  const onSubmit = async (data: SignInSchemaType) => {
    Keyboard.dismiss();
    try {
      await login(data);
      reset();
    } catch (error) {
      setValidated({ emailValid: false, passwordValid: false });
      toast.show({
        placement: "top",
        duration: 5000,
        render: ({ id }: RenderProps) => {
          return (
            <Toast nativeID={id} variant="outline" action="error">
              <ToastTitle>
                {(error as any).response?.data?.message ||
                  "An unexpected error occurred"}
              </ToastTitle>
            </Toast>
          );
        },
      });
    }
  };

  // handle password visibility
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  // handle form submission on enter key press
  const handleKeyPress = () => {
    handleSubmit(onSubmit)();
  };
  return (
    <VStack className="h-full w-full justify-between p-4">
      <VStack className="h-3/5 justify-end">
        <Card className="shadow-xl gap-8">
          <Heading size="xl" className="text-brand-primary">
            Welcome Back!
          </Heading>

          <VStack className="gap-8">
            {/** Email */}
            <FormControl
              className="w-full"
              isInvalid={!!errors?.email || !validated.emailValid}
            >
              <Controller
                defaultValue=""
                name="email"
                control={control}
                rules={{
                  validate: async (value: string) => {
                    try {
                      await FormSchema.parseAsync({ email: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({
                  field: { onChange, onBlur, value },
                }: ControllerRenderType) => (
                  <Input className="h-12 w-full">
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
              <Controller
                defaultValue=""
                name="password"
                control={control}
                rules={{
                  validate: async (value) => {
                    try {
                      await FormSchema.parseAsync({ password: value });
                      return true;
                    } catch (error: any) {
                      return error.message;
                    }
                  },
                }}
                render={({
                  field: { onChange, onBlur, value },
                }: ControllerRenderType) => (
                  <Input className="h-12 w-full">
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
            <VStack className="gap-2 w-full">
              <Button
                variant="link"
                onPress={() => setShowForgotPasswordModal(true)}
                className="self-end"
              >
                <ButtonText className="text-text-secondary text-end underline hover:text-brand-primary">
                  Forget Password
                </ButtonText>
              </Button>
              <Button
                size="lg"
                isDisabled={isLoading}
                className="w-full bg-brand-primary hover:bg-btn-secondary active:bg-brand-primary"
                onPress={handleSubmit(onSubmit)}
              >
                <ButtonText>{isLoading ? <Spinner /> : "Sign in"}</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Card>
      </VStack>
      <VStack className="h-2/5 justify-center items-center">
        <VStack className="items-center gap-2">
          <Text size="md" className="text-text-secondary text-center">
            Don&apos;t have an account yet?
          </Text>
          <Button
            onPress={switchToSignUp}
            className="bg-brand-secondary hover:bg-btn-secondary active:bg-brand-secondary"
          >
            <ButtonText className="">Sign Up Here</ButtonText>
          </Button>
        </VStack>
      </VStack>

      {/** Forgot password modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
        />
      )}
    </VStack>
  );
};

export default SignInScreen;
