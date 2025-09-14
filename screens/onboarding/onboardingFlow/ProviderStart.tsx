import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import useGlobalStore from "@/store/globalStore";
import { Image } from "@/components/ui/image";
import { Button, ButtonText } from "@/components/ui/button";

const WelcomeScreen = () => {
  const { setCurrentStep, currentStep } = useGlobalStore();
  return (
    <VStack className="flex-1 p-4 justify-between bg-white">
      <VStack space="lg">
        <Heading size="2xl" className="text-brand-secondary">
          Stand Out and Get Noticed: Complete Your Company Profile Today!
        </Heading>
        <Text size="lg" className="text-gray-600">
          Clients want to see your work and learn about your expertise. Add a
          professional bio and upload portfolio samples to gain trust and stand
          out
        </Text>
      </VStack>

      <Image
        source={require("@/assets/images/standoutcompany.png")}
        alt="Welcome Image"
        className="w-full h-96 object-cover self-center"
      />
      <Button
        size="xl"
        className="bg-brand-primary mt-6"
        onPress={() => setCurrentStep(currentStep + 1)}
      >
        <ButtonText>Let's Get Started</ButtonText>
      </Button>
    </VStack>
  );
};

export default WelcomeScreen;
