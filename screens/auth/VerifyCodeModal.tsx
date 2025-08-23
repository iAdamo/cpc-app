import React, { useState, useEffect } from "react";
import { FormSchema, FormSchemaType } from "@/screens/auth/AuthFormSchema";
import FormModal from "@/screens/auth/AuthFormModal";
import useGlobalStore from "@/store/globalStore";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { Keyboard } from "react-native";
import { useRouter, usePathname } from "expo-router";

interface VerifyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
  isVerified?: boolean;
}

const VerifyCodeModal: React.FC<VerifyCodeModalProps> = ({
  isOpen,
  onClose,
  email,
  onVerified,
  isVerified,
}) => {
  const { verifyEmail, sendCode } = useGlobalStore();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    if (cooldown > 0) return;

    try {
      await sendCode(email);
      toast.show({
        placement: "top",
        duration: 10000,
        render: ({ id }) => (
          <Toast nativeID={id} variant="outline" action="success">
            <ToastTitle>Code sent, check your inbox</ToastTitle>
          </Toast>
        ),
      });
      Keyboard.dismiss();
      setCooldown(30); // start 30-second cooldown
    } catch (error: any) {
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={id} variant="outline" action="error">
            <ToastTitle>
              {error?.response?.data?.message || "Error sending code"}
            </ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const handleVerifyEmail = async (data: FormSchemaType) => {
    try {
      await verifyEmail(data.code);
        toast.show({
          placement: "top",
          duration: 3000,
          render: ({ id }) => (
            <Toast nativeID={id} variant="outline" action="success">
              <ToastTitle>Email verified</ToastTitle>
            </Toast>
          ),
        });

        Keyboard.dismiss();
        onVerified();
        onClose();

        if (pathname === "/") {
          router.replace("/companies");
        }

    } catch (error: any) {
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={id} variant="outline" action="error">
            <ToastTitle>
              {error?.response?.data?.message || "Verification failed"}
            </ToastTitle>
          </Toast>
        ),
      });
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Email"
      description="A verification code has been sent to you. Enter it below."
      extraText={
        cooldown > 0
          ? `You can resend code in ${cooldown}s`
          : !isVerified
          ? `You need to verify your email to continue using the app.\nClick the button below to request a new verification code.`
          : "Didn't receive the code?"
      }
      onSubmit_2={cooldown <= 0 ? handleSendCode : undefined}
      fields={[
        {
          name: "code",
          label: "Verification Code",
          placeholder: "Enter verification code",
          type: "text",
        },
      ]}
      onSubmit={handleVerifyEmail}
      schema={FormSchema.omit({
        email: true,
        password: true,
        confirmPassword: true,
      })}
    />
  );
};

export default VerifyCodeModal;
