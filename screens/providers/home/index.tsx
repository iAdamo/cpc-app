import { useState, useEffect } from "react";
import Categories from "./Categories";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { MapPinHouseIcon } from "lucide-react-native";
import ContentDisplay from "./ContentDisplay";
import SortBar from "./SortBar";
import useGlobalStore from "@/store/globalStore";
import { TopNavbar } from "@/components/layout/Navbar";
import SearchBar from "@/components/SearchEngine";
import { ProviderData } from "@/types";
import MapView from "@/screens/map";

const HomeView = () => {
  const {
    searchResults,
    sortBy,
    executeSearch,
    currentLocation,
    displayStyle,
    categories,
    setCurrentView,
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
        model: "providers",
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
      <Fab
        size="xl"
        className="bg-red-500 shadow-xl data-[active=true]:bg-red-400"
        onPress={() => {
          setCurrentView("Map");
        }}
      >
        <FabIcon as={MapPinHouseIcon} />
        {/* <FabLabel className="font-semibold">Nearby</FabLabel> */}
      </Fab>
    </VStack>
  );
};

export default HomeView;
