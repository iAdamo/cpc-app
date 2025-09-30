import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Image } from "./ui/image";

const EmptyState = ({
  header,
  text,
  onButtonPress,
}: {
  header: string;
  text: string;
  onButtonPress?: () => void;
}) => {
  return (
    <VStack className="flex-1 justify-center items-center px-6">
      <Image
        source={require("../assets/images/no-saved-providers.png")}
        className="w-72 h-72 mb-6"
        resizeMode="contain"
        alt="No Saved Companies"
      />
      <Text className="text-lg text-gray-600 mb-2">{header}</Text>
      <Text className="text-center text-gray-500">{text}</Text>
    </VStack>
  );
};

export default EmptyState;
