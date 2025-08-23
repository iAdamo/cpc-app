import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import useGlobalStore from "@/store/globalStore";
import { Button, ButtonText } from "@/components/ui/button";

const FirstOnboardingPage = () => {
  const { setCurrentStep } = useGlobalStore();

  const handleNext = () => {
    setCurrentStep(2);
  };

  return (
    <VStack className="flex-1 bg-white p-4">
      <VStack className="p-5">
        <Text>Welcome to the Onboarding Process!</Text>
        <Text>Please follow the steps to complete your setup.</Text>
      </VStack>
      <HStack>
        <Button onPress={handleNext}>
          <ButtonText>Next</ButtonText>
        </Button>
        <Button variant="outline" onPress={() => setCurrentStep(3)}>
          <ButtonText>Skip</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
};

export default FirstOnboardingPage;
