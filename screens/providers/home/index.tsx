import Categories from "./Categories";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import ContentDisplay from "./ContentDisplay";
import SortBar from "./SortBar";
import useGlobalStore from "@/store/globalStore";
import { TopNavbar } from "@/components/layout/Navbar";
import SearchBar from "@/components/SearchEngine";

import { useEffect } from "react";
import { useState } from "react";
import { ProviderData } from "@/types";

const HomeView = () => {
  const {
    searchResults,
    sortBy,
    executeSearch,
    currentLocation,
    displayStyle,
  } = useGlobalStore();
  const [providers, setProviders] = useState<ProviderData[]>([]);

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

  useEffect(() => {
    if (searchResults && searchResults.providers) {
      setProviders(searchResults.providers);
    }
  }, [searchResults]);

  return (
    <VStack className="flex-1">
      <SearchBar />
      <Categories />
      <SortBar />
      <ContentDisplay providers={providers} displayStyle={displayStyle} />
    </VStack>
  );
};

export default HomeView;
