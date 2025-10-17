import { useState, useEffect, useCallback, useRef } from "react";
import { SearchIcon } from "@/components/ui/icon";
import {
  Button,
  ButtonText,
  ButtonIcon,
  ButtonSpinner,
} from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form-control";
import { MapPinIcon, SlidersHorizontalIcon } from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";
import { GooglePlaceService } from "@/services/googlePlaceService";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Place, ProviderData } from "@/types";
import { debounce } from "lodash";
import { usePathname } from "expo-router";

const SearchBar = ({
  providers,
  isSearchFocus,
}: {
  providers?: ProviderData[];
  isSearchFocus?: (focus: boolean) => void;
}) => {
  const [locationInput, setLocationInput] = useState<boolean>(false);
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [predictions, setPredictions] = useState<Place[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const pathname = usePathname();
  // const isHomeView = pathname === "/clients" || pathname === "/providers";

  const {
    setFilteredProviders,
    selectedPlace,
    setSelectedPlace,
    currentLocation,
    executeSearch,
    isLoading,
    setError,
    currentView,
  } = useGlobalStore();

  const isHomeView = currentView === "Home";
  const isChatView = currentView === "Chat";

  const debouncedFetchPredictions = useRef(
    debounce(async (query: string) => {
      if (query.length > 2) {
        try {
          const results = await GooglePlaceService.autocomplete(query);
          setPredictions(results);
        } catch (err: any) {
          setError(`Autocomplete error ${err.message}`);
        }
      } else {
        setPredictions([]);
      }
    }, 300)
  ).current;

  // Filter providers locally if providers prop is passed
  useEffect(() => {
    if (providers && filterQuery.length > 0) {
      const q = filterQuery.toLowerCase();
      setFilteredProviders(
        providers.filter(
          (p) => p.providerName && p.providerName.toLowerCase().includes(q)
          // (p.subcategories && p.subcategories.toLowerCase().includes(q)) ||
          // (typeof p.ratings === "number" &&
          //   p.ratings.toString().includes(q)) ||
          // (p.location &&
          //   p.location.primary.address.address.toLowerCase().includes(q)) ||
          // (p.providerDescription &&
          //   p.providerDescription.toLowerCase().includes(q))
        )
      );
    } else {
      setFilteredProviders([]);
    }
  }, [providers, filterQuery]);

  useEffect(() => {
    if (locationQuery) {
      debouncedFetchPredictions(locationQuery);
    } else {
      setPredictions([]);
    }
  }, [locationQuery, debouncedFetchPredictions]);

  const handleSearchExecute = useCallback(async () => {
    if (searchQuery.length > 0 && !providers) {
      await executeSearch({
        page: 1,
        limit: 10,
        engine: true,
        searchInput: searchQuery,
        lat: selectedPlace?.geometry.location.lat,
        long: selectedPlace?.geometry.location.lng,
        address: !selectedPlace?.geometry.location
          ? selectedPlace?.formatted_address ?? undefined
          : currentLocation?.formattedAddress ?? undefined,
      });
    }
  }, [executeSearch, searchQuery, selectedPlace, currentLocation, providers]);

  const handleLocationSelect = useCallback(
    async (prediction: Place) => {
      try {
        const details = await GooglePlaceService.getPlaceDetails(
          prediction.place_id
        );
        setSelectedPlace(details);
        setLocationQuery(details.formatted_address);
        setPredictions([]);

        // Trigger search if there's already a search query
        if (searchQuery.length > 0 && !providers) {
          await handleSearchExecute();
        }
      } catch (err: any) {
        setError(`Place details error: ${err.message}`);
      }
    },
    [setSelectedPlace, searchQuery, handleSearchExecute, providers]
  );

  const currentLocationText = selectedPlace
    ? selectedPlace.formatted_address
    : currentLocation
    ? currentLocation.formattedAddress
    : "Get Location";

  const handleFocus = useCallback(() => {
    isHomeView && setLocationInput(true);
    isSearchFocus && isSearchFocus(true);
  }, []);

  return (
    <FormControl className="gap-4">
      {locationInput && isHomeView && (
        <Menu
          placement="bottom"
          className="max-h-96 w-[23.5rem]"
          offset={5}
          crossOffset={-16}
          closeOnSelect={false}
          trigger={({ ...triggerProps }) => {
            return (
              <Input className="mx-4 rounded-2xl border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
                <InputSlot>
                  <InputIcon as={MapPinIcon} className="text-gray-400 ml-4" />
                </InputSlot>
                <InputField
                  {...triggerProps}
                  placeholder={currentLocationText}
                  value={locationQuery}
                  className="placeholder:text-lg placeholder:text-gray-400 placeholder:line-clamp-1"
                  onChangeText={(text) => setLocationQuery(text)}
                />
              </Input>
            );
          }}
        >
          {predictions.length > 0 &&
            predictions.map((prediction) => (
              <MenuItem
                key={prediction.place_id}
                textValue={prediction.description}
                onPress={() => handleLocationSelect(prediction)}
              >
                <MenuItemLabel>{prediction.description}</MenuItemLabel>
              </MenuItem>
            ))}
        </Menu>
      )}
      {isHomeView && (
        <Input className="mx-4 rounded-2xl border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
          <InputSlot>
            <InputIcon as={SearchIcon} className="text-gray-400 ml-4" />
          </InputSlot>
          <InputField
            placeholder="Search... e.g., tree felling, plumbing"
            className="placeholder:text-lg placeholder:text-gray-400"
            onChangeText={(text) => setSearchQuery(text)}
            value={searchQuery}
            onFocus={handleFocus}
            onBlur={() => {
              isSearchFocus && isSearchFocus(false),
                setLocationInput(false),
                handleSearchExecute;
            }}
          />
          {isLoading && (
            <InputSlot className="pr-3">
              <ButtonSpinner />
            </InputSlot>
          )}
        </Input>
      )}
      {!isHomeView && !isChatView && (
        <Input className="m-4 rounded-2xl border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
          <InputSlot className="pl-4">
            <InputIcon
              size="xl"
              as={SlidersHorizontalIcon}
              className="text-gray-400"
            />
          </InputSlot>
          <InputField
            placeholder="Filter..."
            className="placeholder:text-lg placeholder:text-gray-400"
            onChangeText={(text) => setFilterQuery(text)}
          />
        </Input>
      )}
      {/* {isChatView && (
        <Input className="m-4 rounded-2xl border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
          <InputSlot className="pl-4">
            <InputIcon size="xl" as={SearchIcon} className="text-gray-400" />
          </InputSlot>
          <InputField
            placeholder="Search Chats"
            className="placeholder:text-lg placeholder:text-gray-400"
            // onChangeText={(text) => setFilterQuery(text)}
          />
        </Input>
      )} */}
    </FormControl>
  );
};

export default SearchBar;
