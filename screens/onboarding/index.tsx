import { useState } from "react";
import useGlobalStore from "@/store/globalStore";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  EmailVerificationPage,
  FirstOnboardingPage,
  SignUpScreen,
  PhoneVerificationPage,
  SelectRole,
  ProfileInfo,
  ChooseService,
  FinalPage,
  WelcomeScreen,
  CompanyBasicInfo,
  Identity,
} from "./onboardingFlow";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icon";
import { useLocalSearchParams, router, usePathname } from "expo-router";

export function OnboardingFlow() {
  const [backPressed, setBackPressed] = useState(false);
  const { currentStep, setCurrentStep, completeOnboarding, paramsFrom } =
    useGlobalStore();
  const params = useLocalSearchParams();
  const from = params.from as string;
  const pathname = usePathname();
  const showForwardButton = backPressed && currentStep !== 2;

  // If the user navigated here with a "from" parameter, set it in the store
  if (from && paramsFrom !== from)
    useGlobalStore.setState({ paramsFrom: from });

  // move to current last step if not completed

  // Map step numbers to components for easier maintenance
  const stepComponents: { [key: number]: React.ComponentType } = {
    1: FirstOnboardingPage,
    2: SignUpScreen,
    3: EmailVerificationPage,
    4: PhoneVerificationPage,
    5: SelectRole,
    6: ProfileInfo,
    7: WelcomeScreen,
    8: ChooseService,
    9: Identity,
    10: CompanyBasicInfo,
  };
  const StepComponent: React.ComponentType =
    stepComponents[currentStep] || FinalPage;

  // Use a set for steps that should NOT show the back button
  const noBackButtonSteps = new Set([0, 1, 2, 5]);
  const showBackButton =
    !noBackButtonSteps.has(currentStep) && currentStep < 12;
  // console.log(paramsFrom, currentStep);
  const handleBack = () => {
    setBackPressed(true);
    if (paramsFrom === "/providers") {
      completeOnboarding();
      if (currentStep > 7) {
        setCurrentStep(currentStep > 1 ? currentStep - 1 : 1);
        return;
      }
      router.replace("/providers");
      return;
    }
    setCurrentStep(currentStep > 1 ? currentStep - 1 : 1);
  };
  const handleForward = () => {
    setBackPressed(false);
    setCurrentStep(currentStep + 1);
  };
  return (
    <VStack
      className={`flex-1 bg-white ${
        currentStep === 5 && !showForwardButton ? "pt-16" : ""
      }`}
    >
      {(showBackButton || showForwardButton) && (
        <HStack className="w-full items-center mt-16 px-6">
          {showBackButton && (
            <Button
              size="xl"
              variant="link"
              className="self-start"
              onPress={handleBack}
            >
              <ButtonIcon
                as={ChevronLeftIcon}
                className="text-brand-secondary w-7 h-7"
              />
            </Button>
          )}
          {showForwardButton && (
            <Button
              size="xl"
              variant="link"
              className="ml-auto"
              onPress={handleForward}
            >
              <ButtonIcon
                as={ChevronRightIcon}
                className="text-brand-secondary w-7 h-7"
              />
            </Button>
          )}
        </HStack>
      )}
      {/* Render the current step component */}
      <StepComponent />
    </VStack>
  );
}
