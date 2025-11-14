import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Image } from "expo-image";

const InfoCard = ({
  title,
  description,
  buttonText,
  imageUrl,
  onButtonPress,
}: {
  title?: string;
  description?: string;
  buttonText?: string;
  imageUrl?: string;
  onButtonPress?: () => void;
}) => {
  return title || description || buttonText || imageUrl ? (
    <Card className="shadow-md  mx-4 my-2">
      <VStack>
        <Heading>Hello</Heading>
      </VStack>
    </Card>
  ) : null;
};

export default InfoCard;
