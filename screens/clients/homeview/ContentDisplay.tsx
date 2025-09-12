import { useEffect, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ScrollView, View, Dimensions, Pressable } from "react-native";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ChevronRightIcon } from "@/components/ui/icon";
import { ChevronDownIcon, ListIcon, Grid2X2Icon } from "lucide-react-native";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import useGlobalStore from "@/store/globalStore";
import ProviderCard from "@/components/ProviderCard";
import { ProviderData } from "@/types";

const ContentDisplay = () => {
  const { width } = Dimensions.get("window");
  const {
    displayStyle,
    searchResults,
    sortBy,
    executeSearch,
    currentLocation,
  } = useGlobalStore();
  useEffect(() => {
    const handleProvidersSearch = async () => {
      if (
        !(await executeSearch({
          page: 1,
          limit: 30,
          engine: false,
          sortBy: sortBy,
          lat: currentLocation?.coords.latitude,
          long: currentLocation?.coords.longitude,
        }))
      )
        return;
    };

    handleProvidersSearch();
  }, [sortBy, currentLocation]);

  const view =
    displayStyle === "Grid"
      ? "flex-row flex-wrap justify-between"
      : "flex flex-col";
  return (
    <VStack className={`${view}`}>
      {(searchResults.providers && searchResults.providers.length > 0
        ? searchResults.providers
        : []
      ).map((provider: ProviderData) => (
        <ProviderCard key={provider._id} provider={provider} />
      ))}
    </VStack>
  );
};
export default ContentDisplay;
