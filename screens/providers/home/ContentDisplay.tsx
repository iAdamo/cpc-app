import { useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { Dimensions } from "react-native";
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
      await executeSearch({
        page: 1,
        limit: 30,
        engine: false,
        sortBy: sortBy,
        lat: currentLocation?.coords.latitude,
        long: currentLocation?.coords.longitude,
      });
    };

    handleProvidersSearch();
  }, [sortBy, currentLocation]);

  const view =
    displayStyle === "Grid"
      ? "flex-row flex-wrap justify-between"
      : "flex flex-col";
  return (
    <VStack className={`${view} px-2`}>
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
