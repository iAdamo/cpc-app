import useGlobalStore from "@/store/globalStore";
import { VStack } from "@/components/ui/vstack";
import EmailVerificationPage from "./onboardingFlow/EmailVerify";
import FirstOnboardingPage from "./onboardingFlow/00FirstPage";
import PhoneVerificationPage from "./onboardingFlow/PhoneVerify";
import SelectRole from "./onboardingFlow/SelectRole";
import ProfileInfo from "../../components/profile/ProfileInfo";
import ChooseService from "./onboardingFlow/ChooseService";
import FinalPage from "./onboardingFlow/FinalPage";
import SignUpScreen from "@/screens/auth/signup";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ChevronLeftIcon } from "@/components/ui/icon";
import { useLocalSearchParams, router } from "expo-router";

export function OnboardingFlow() {
  const { currentStep, setCurrentStep, completeOnboarding, paramsFrom } =
    useGlobalStore();
  const params = useLocalSearchParams();
  const from = params.from as string;

  // move to current last step if not completed

  // Map step numbers to components for easier maintenance
  const stepComponents: { [key: number]: React.ComponentType } = {
    1: FirstOnboardingPage,
    2: SignUpScreen,
    3: EmailVerificationPage,
    4: PhoneVerificationPage,
    5: SelectRole,
    6: ProfileInfo,
    7: ChooseService,
  };
  const StepComponent: React.ComponentType =
    stepComponents[currentStep] || FinalPage;

  // Use a set for steps that should NOT show the back button
  const noBackButtonSteps = new Set([0, 1, 5]);
  const showBackButton =
    !noBackButtonSteps.has(currentStep) && currentStep < 10;

  const handleBack = () => {
    if (paramsFrom === "/providers") {
      completeOnboarding();
      router.replace("/providers");
      return;
    }
    setCurrentStep(currentStep > 1 ? currentStep - 1 : 1);
  };

  return (
    <VStack className="flex-1 bg-white">
      <VStack className="bg-white h-full mt-8">
        {/* <OnboardingProgess /> */}
        {showBackButton && (
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
        <VStack className="">
          <StepComponent />
        </VStack>
      </VStack>
    </VStack>
  );
}
