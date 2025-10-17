import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { ScrollView, View, Dimensions, Pressable } from "react-native";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Icon, InfoIcon } from "@/components/ui/icon";
import { ChevronRightIcon } from "@/components/ui/icon";
import { ChevronDownIcon, ListIcon, Grid2X2Icon } from "lucide-react-native";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import useGlobalStore from "@/store/globalStore";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { SortBy } from "@/types";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";

const SortBar = () => {
  const [openSheet, setOpenSheet] = useState(false);
  const { displayStyle, setDisplayStyle, sortBy, setSortBy } = useGlobalStore();
  const sorts: SortBy[] = [
    "Relevance",
    "Top Rated",
    "Most Reviewed",
    "Location",
    "Newest",
    "Oldest",
  ];
  return (
    <VStack className="p-4 bg-white">
      <HStack className="justify-between items-center">
        <HStack space="xs" className="items-center">
          <Text size="lg">Sort by:</Text>
          <Button
            size="lg"
            variant="link"
            onPress={() => setOpenSheet((prev) => !prev)}
            className="gap-0.5"
          >
            <ButtonText className="text-brand-primary data-[active=true]:no-underline">
              {sortBy}
            </ButtonText>
            <ButtonIcon as={ChevronDownIcon} />
          </Button>
        </HStack>
        <Actionsheet
          isOpen={openSheet}
          onClose={() => {
            setOpenSheet(false);
          }}
        >
          <ActionsheetBackdrop />
          <ActionsheetContent>
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <Heading
              size="xl"
              className="self-start text-brand-primary my-6 pl-4"
            >
              Sort by
            </Heading>

            {sorts.map((sort, index) => (
              <ActionsheetItem
                key={index}
                onPress={() => {
                  setSortBy(sort), setOpenSheet(false);
                }}
                className=""
              >
                <ActionsheetItemText
                  size="xl"
                  className={`${
                    sortBy === sort ? "text-brand-secondary font-medium" : ""
                  }`}
                >
                  {sort}
                </ActionsheetItemText>
              </ActionsheetItem>
            ))}
            <HStack className="gap-1 m-4 ">
              <Icon as={InfoIcon} size="sm" />
              <Text size="sm" className="flex-1 text-gray-600">
                The results are by default sorted by your current location
              </Text>
            </HStack>
          </ActionsheetContent>
        </Actionsheet>
        <HStack space="lg" className="items-center">
          <Pressable
            onPress={() => setDisplayStyle("Grid")}
            className={`${
              displayStyle === "Grid" ? "bg-brand-primary" : "bg-gray-200"
            } rounded-full p-2 h-fit w-fit`}
          >
            <Icon
              size="xl"
              as={Grid2X2Icon}
              className={`${
                displayStyle === "Grid" ? "text-white" : "text-brand-primary"
              } w-6 h-6`}
            />
          </Pressable>
          <Pressable
            onPress={() => setDisplayStyle("List")}
            className={`${
              displayStyle === "List" ? "bg-brand-primary" : "bg-gray-200"
            } rounded-full p-2 h-fit w-fit`}
          >
            <Icon
              size="xl"
              as={ListIcon}
              className={`${
                displayStyle === "List" ? "text-white" : "text-brand-primary"
              } w-6 h-6`}
            />
          </Pressable>
        </HStack>
      </HStack>
    </VStack>
  );
};
export default SortBar;
