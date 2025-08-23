import React from "react";
import useGlobalStore from "@/store/globalStore";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Progress } from "@/components/ui/progress";
import EmailVerificationPage from "./onboardingFlow/EmailVerify";
import FirstOnboardingPage from "./onboardingFlow/00FirstPage";

export default function OnboardingFlow() {
  const { currentStep } = useGlobalStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FirstOnboardingPage />;
      case 2:
        return <Text>Step 2: Set Up Your Profile</Text>;
      case 3:
        return <Text>Step 3: Complete Onboarding</Text>;
      default:
        return <Text>Step 1: Welcome to Onboarding</Text>;
    }
  };

  return (
    <VStack className="flex-1 bg-white p-4">
      <OnboardingProgess />
      <VStack className="p-5"> {renderStep()}</VStack>
    </VStack>
  );
}

const OnboardingProgess = () => {
  const { currentStep, totalSteps } = useGlobalStore();
  return (
    <VStack className="p-5 pb-2.5">
      <Heading>
        Step {currentStep} of {totalSteps}
      </Heading>
      <VStack>
        <Progress
          value={(currentStep / totalSteps) * 100}
          className="w-full bg-brand-secondary/20"
        />
      </VStack>
    </VStack>
  );
};
