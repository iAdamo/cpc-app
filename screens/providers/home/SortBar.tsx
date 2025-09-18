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
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { SortBy } from "@/types";

const SortBar = () => {
  const { displayStyle, setDisplayStyle, sortBy, setSortBy } = useGlobalStore();
  const sorts: SortBy[] = ["Relevance", "Newest", "Oldest"];
  return (
    <VStack className="p-4 bg-white">
      <HStack className="justify-between items-center mt-2">
        <HStack space="xs" className="items-center">
          <Text size="lg">Sort by:</Text>
          <Menu
            placement="bottom"
            className="w-36"
            crossOffset={15}
            trigger={({ ...triggerProps }) => {
              return (
                <Button
                  {...triggerProps}
                  size="lg"
                  variant="link"
                  className="gap-0.5"
                >
                  <ButtonText className="text-brand-primary data-[active=true]:no-underline">
                    {sortBy}
                  </ButtonText>
                  <ButtonIcon as={ChevronDownIcon} />
                </Button>
              );
            }}
          >
            {sorts.map((sort, index) => (
              <MenuItem
                key={index}
                onPress={() => setSortBy(sort)}
                textValue={sort}
                className=""
              >
                <MenuItemLabel>{sort}</MenuItemLabel>
              </MenuItem>
            ))}
          </Menu>
        </HStack>
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
