import { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import useGlobalStore from "@/store/globalStore";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { SearchIcon } from "@/components/ui/icon";
import {
  BellDotIcon,
  NavigationIcon,
  PhoneCallIcon,
} from "lucide-react-native";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import FeaturedCompanies from "./FeaturedCompanies";
import { LinearGradient } from "expo-linear-gradient";
import SearchBar from "@/components/SearchEngine";

const Update = () => {
  const { switchRole, savedProviders, filteredProviders } = useGlobalStore();
  const [searchOn, setSearchOn] = useState(false);

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
      <VStack className="flex-1 gap-8 pt-10">
        <VStack className="gap-4">
          <HStack className="p-4 justify-between">
            <Heading size="2xl" className="font-medium text-brand-primary">
              Updates
            </Heading>
            <Button
              variant="outline"
              className="bg-brand-primary/40 rounded-3xl px-4"
              onPress={() => setSearchOn(!searchOn)}
            >
              <ButtonIcon as={SearchIcon} className="text-brand-primary" />
              <ButtonText className="text-brand-primary">Search</ButtonText>
            </Button>
          </HStack>
        </VStack>
        {searchOn ? (
          <SearchBar providers={savedProviders} />
        ) : (
          <VStack>
            <Heading size="xl" className="px-4 text-brand-primary">
              Featured Companies
            </Heading>
            <FeaturedCompanies />
          </VStack>
        )}
      </VStack>
    </VStack>
  );
};

export default Update;
