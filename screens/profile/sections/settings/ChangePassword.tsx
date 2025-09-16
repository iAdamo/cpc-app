import { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { ScrollView, Keyboard } from "react-native";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema, FormSchemaType } from "@/screens/auth/AuthFormSchema";
import { z } from "zod";
import {
  Icon,
  ChevronLeftIcon,
  EyeIcon,
  EyeOffIcon,
} from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalCloseButton,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import useGlobalStore from "@/store/globalStore";
import { SpeakerIcon, MegaphoneIcon } from "lucide-react-native";

type ControllerRenderType = {
  field: {
    onChange: (value: string) => void;
    onBlur: () => void;
    value: string;
  };
};

interface ValidatedState {
  currentPasswordValid: boolean;
  phoneNumberValid: boolean;
  passwordValid: boolean;
}

const ChangePassword = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { setError, isLoading, changePassword } = useGlobalStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validated, setValidated] = useState<ValidatedState>({
    currentPasswordValid: true,
    phoneNumberValid: true,
    passwordValid: true,
  });

  const PasswordSchema = z.object({
    currentPassword: z
      .string()
      .min(8, "Current password must be at least 8 characters"),
    password: FormSchema.shape.password,
    confirmPassword: FormSchema.shape.confirmPassword,
  });

  type PasswordFormType = z.infer<typeof PasswordSchema>;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormType>({
    resolver: zodResolver(PasswordSchema),
  });

  const onSubmit = async (data: PasswordFormType) => {
    Keyboard.dismiss();
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    await changePassword(data?.currentPassword, data?.password);
    onClose();
    reset();
  };

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
    <Modal
      isOpen={!!isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      closeOnOverlayClick={false}
    >
      <ModalBackdrop />
      <ModalContent className="flex-1 pt-16 w-full bg-white">
        <ModalHeader className="items-center justify-start gap-2">
          <ModalCloseButton className="flex flex-row items-center gap-2">
            <Icon size="xl" as={ChevronLeftIcon} />
          </ModalCloseButton>
          <Heading>Change Password</Heading>
        </ModalHeader>
        <ModalBody className="gap-20 flex flex-col">
          <VStack className="mt-4 gap-4 items-center justify-center">
            <Card className="p-2 flex-row gap-4 items-center bg-brand-secondary/40">
              <Icon
                as={MegaphoneIcon}
                className="text-brand-secondary w-7 h-7"
              />
              <Text className="flex-1 text-brand-secondary">
                You can only change your password once in three months.
              </Text>
            </Card>
            <FormControl
              className="w-full"
              isInvalid={
                !!errors.currentPassword || !validated.currentPasswordValid
              }
            >
              <FormControlLabel>
                <FormControlLabelText>Current Password</FormControlLabelText>
              </FormControlLabel>

              <Controller
                name="currentPassword"
                control={control}
                defaultValue=""
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className="h-14">
                    <InputField
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Current Password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
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
                  {errors?.currentPassword?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl
              className="w-full"
              isInvalid={!!errors.password || !validated.passwordValid}
            >
              <FormControlLabel>
                <FormControlLabelText>New Password</FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="password"
                control={control}
                render={({
                  field: { onChange, onBlur, value },
                }: ControllerRenderType) => (
                  <Input className="h-14">
                    <InputField
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter New password"
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
            {/* ------------------------------------------ Confirm New Password -------------------------------------------*/}
            <FormControl
              className="w-full"
              isInvalid={!!errors.confirmPassword}
            >
              <FormControlLabel>
                <FormControlLabelText>
                  Confirm New Password
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                defaultValue=""
                name="confirmPassword"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className="h-14">
                    <InputField
                      className=""
                      placeholder="Confirm New Password"
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
          </VStack>
        </ModalBody>
        <ModalFooter>
          <VStack className="gap-2 w-full mt-4">
            <Button
              size="xl"
              isDisabled={isLoading}
              className="w-full bg-brand-primary"
              onPress={handleSubmit(onSubmit)}
            >
              <ButtonText>
                {isLoading ? <Spinner /> : "Change Password"}
              </ButtonText>
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChangePassword;
