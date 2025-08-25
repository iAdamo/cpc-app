import React from "react";
import useGlobalStore from "@/store/globalStore";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import EmailVerificationPage from "./onboardingFlow/EmailVerify";
import FirstOnboardingPage from "./onboardingFlow/00FirstPage";
import PhoneVerificationPage from "./onboardingFlow/PhoneVerify";
import SelectRole from "./onboardingFlow/SelectRole";
import ProfileInfo from "./onboardingFlow/ProfileInfo";
import SignUpScreen from "@/screens/auth/signup";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeftIcon } from "@/components/ui/icon";

export function OnboardingFlow() {
  const { currentStep, setCurrentStep } = useGlobalStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FirstOnboardingPage />;
      case 6:
        return <SignUpScreen />;
      case 3:
        return <EmailVerificationPage />;
      case 4:
        return <PhoneVerificationPage />;
      case 5:
        return <SelectRole />;
      case 2:
        return <ProfileInfo />;
      default:
        return <Text>Step 1: Welcome to Onboarding</Text>;
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep > 1 ? currentStep - 1 : 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <VStack className="bg-white h-full">
        {/* <OnboardingProgess /> */}
        {currentStep != 1 && currentStep != 5 && currentStep < 10 && (
          <Button
            size="xl"
            variant="link"
            className="self-start ml-6 mt-6"
            onPress={handleBack}
          >
            <ButtonIcon
              as={ChevronLeftIcon}
              className="text-brand-secondary w-7 h-7"
            />
          </Button>
        )}
        <VStack className=""> {renderStep()}</VStack>
      </VStack>
    </SafeAreaView>
  );
}
