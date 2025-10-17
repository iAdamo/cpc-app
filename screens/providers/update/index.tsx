import { VStack } from "@/components/ui/vstack";
import useGlobalStore from "@/store/globalStore";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import {
  BellDotIcon,
  NavigationIcon,
  PhoneCallIcon,
} from "lucide-react-native";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import FeaturedCompanies from "./featuredCompanies";

import { LinearGradient } from "expo-linear-gradient";
const Update = () => {
  const { switchRole } = useGlobalStore();
  const isProvider = switchRole === "Provider";
  return (
    <VStack className="flex-1">
      <HStack className="w-full relative">
        <LinearGradient
          colors={
            isProvider
              ? ["#fffbe020", "#facc1530"] // yellow gradient for Provider
              : ["#ffffff20", "#2563eb50"] // blue gradient for others
          }
          style={{
            position: "absolute",
            width: "100%",
            height: 130,
          }}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </HStack>
      <VStack className="pt-10 gap-4">
        <HStack className="p-4 justify-between">
          <Heading size="2xl" className="font-medium text-brand-primary">
            Updates
          </Heading>
          {/* <Button
            variant="outline"
            className="bg-brand-primary/40 rounded-3xl px-4"
          >
            <ButtonIcon as={PhoneCallIcon} className="text-brand-primary" />
            <ButtonText className="text-brand-primary">Call</ButtonText>
          </Button> */}
        </HStack>
      </VStack>
      <FeaturedCompanies />
    </VStack>
  );
};

export default Update;
