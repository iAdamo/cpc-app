import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import useGlobalStore from "@/store/globalStore";
import { VStack } from "./ui/vstack";

const OnboardingProgess = () => {
  const { currentStep, totalSteps } = useGlobalStore();
  return (
    <VStack className="w-12 mx-auto">
      <Progress
        value={(currentStep / totalSteps) * 100}
        className="w-full bg-blue-200"
      >
        <ProgressFilledTrack className="bg-blue-500" />
      </Progress>
    </VStack>
  );
};

export default OnboardingProgess;
