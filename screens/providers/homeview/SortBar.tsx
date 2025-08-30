import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ScrollView, View, Dimensions, Pressable } from "react-native";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ChevronRightIcon } from "@/components/ui/icon";
import { ChevronDownIcon, ListIcon, Grid2X2Icon } from "lucide-react-native";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import useGlobalStore from "@/store/globalStore";

const SortBar = () => {
  const { width } = Dimensions.get("window");
  const { displayView, setDisplayView } = useGlobalStore();
  return (
    <VStack className="space-y-4 py-4 bg-white">
      <HStack className="justify-between items-center mt-2">
        <HStack space="xs" className="items-center">
          <Text size="lg">Sort by:</Text>
          <Button size="lg" variant="link" className="gap-0.5">
            <ButtonText className="text-brand-primary active:no-underline">
              Relevance
            </ButtonText>
            <ButtonIcon as={ChevronDownIcon} />
          </Button>
        </HStack>
        <HStack space="lg" className="items-center">
          <Pressable
            onPress={() => setDisplayView("Grid")}
            className={`${
              displayView === "Grid" ? "bg-brand-primary" : "bg-gray-200"
            } rounded-full p-2 h-fit w-fit`}
          >
            <Icon
              size="xl"
              as={Grid2X2Icon}
              className={`${
                displayView === "Grid" ? "text-white" : "text-brand-primary"
              } w-6 h-6`}
            />
          </Pressable>
          <Pressable
            onPress={() => setDisplayView("List")}
            className={`${
              displayView === "List" ? "bg-brand-primary" : "bg-gray-200"
            } rounded-full p-2 h-fit w-fit`}
          >
            <Icon
              size="xl"
              as={ListIcon}
              className={`${
                displayView === "List" ? "text-white" : "text-brand-primary"
              } w-6 h-6`}
            />
          </Pressable>
        </HStack>
      </HStack>
    </VStack>
  );
};
export default SortBar;
