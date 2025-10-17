import { useState, useEffect } from "react";
import Categories from "./Categories";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import ContentDisplay from "./ContentDisplay";
import SortBar from "./SortBar";
import useGlobalStore from "@/store/globalStore";
import { TopNavbar } from "@/components/layout/Navbar";
import SearchBar from "@/components/SearchEngine";
import { ProviderData } from "@/types";

const HomeView = () => {
  const {
    searchResults,
    sortBy,
    executeSearch,
    currentLocation,
    displayStyle,
    categories,
  } = useGlobalStore();
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [isSearchFocus, setIsSearchFocus] = useState(false);

  useEffect(() => {
    const handleProvidersSearch = async () => {
      // console.log("Fetching providers with:", {
      //   sortBy,
      //   lat: currentLocation?.coords.latitude,
      //   long: currentLocation?.coords.longitude,
      //   categories,
      // });
      await executeSearch({
        page: 1,
        limit: 30,
        engine: false,
        sortBy: sortBy,
        lat: currentLocation?.coords.latitude,
        long: currentLocation?.coords.longitude,
        categories: categories,
      });
    };
    // console.log(sortBy, currentLocation, categories);
    handleProvidersSearch();
  }, [sortBy, currentLocation, categories]);

  useEffect(() => {
    if (searchResults && searchResults.providers) {
      setProviders(searchResults.providers);
    }
  }, [searchResults]);

  return (
    <VStack className="flex-1">
      <SearchBar isSearchFocus={setIsSearchFocus} />
      {!isSearchFocus && <Categories />}
      <SortBar />
      <ContentDisplay providers={providers} displayStyle={displayStyle} />
    </VStack>
  );
};

export default HomeView;
