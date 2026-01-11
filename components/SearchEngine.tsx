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
import { MapPinIcon, SlidersHorizontalIcon, X } from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";
import { GooglePlaceService } from "@/services/googlePlaceService";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Chat, Place, PlaceDetails, ProviderData } from "@/types";
import { debounce } from "lodash";
import { usePathname } from "expo-router";
import { useLocalSearchParams } from "expo-router";

const SearchBar = ({
  providers,
  isSearchFocus,
  chats,
}: {
  providers?: ProviderData[];
  chats?: Chat[];
  isSearchFocus?: (focus: boolean) => void;
}) => {
  const [locationInput, setLocationInput] = useState<boolean>(false);
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [predictions, setPredictions] = useState<Place[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [isLocationSelected, setIsLocationSelected] = useState<boolean>(false);

  const pathname = usePathname();
  const params = useLocalSearchParams();

  const {
    setFilteredProviders,
    setFilteredChats,
    selectedPlace,
    setSelectedPlace,
    currentLocation,
    executeSearch,
    isLoading,
    setError,
    currentView,
    user,
  } = useGlobalStore();

  const isSavedCompaniesView =
    pathname === "/profile" && params.section === "saved-companies";
  const isUpdateView = currentView === "Updates";
  const isHomeView = currentView === "Home";
  const isChatView = currentView === "Chat";

  // Stable debounced refs
  const debouncedFetchRef = useRef(
    debounce(async (query: string, cb: (results: Place[]) => void) => {
      if (!query || query.length === 0) return cb([]);
      try {
        const results = await GooglePlaceService.autocomplete(query);
        cb(results);
      } catch (err: any) {
        setError(`Autocomplete error ${err.message}`);
        cb([]);
      }
    }, 300)
  );

  const debouncedSearchAddressRef = useRef(
    debounce(async (query: string) => {
      if (!query || query.length === 0 || providers) return;
      try {
        await executeSearch({
          model: "providers",
          page: 1,
          limit: 10,
          engine: true,
          searchInput: searchQuery,
          lat: 0,
          long: 0,
          country: currentLocation?.country || "",
          address: query,
        });
      } catch (err: any) {
        setError(`Address search error: ${err.message}`);
      }
    }, 500)
  );

  // Filter providers and chats independently
  useEffect(() => {
    const q = filterQuery.trim().toLowerCase();

    /* ---------- PROVIDERS FILTER ---------- */
    if (providers && providers.length > 0) {
      if (q.length > 0) {
        setFilteredProviders(
          providers.filter((p) => p.providerName?.toLowerCase().includes(q))
        );
      } else {
        setFilteredProviders([]);
      }
    }

    /* ---------- CHATS FILTER (FIXED) ---------- */
    if (chats && user?._id) {
      if (q.length > 0) {
        const filtered = chats.filter((chat) => {
          const isClient = chat.clientUserId._id === user._id;

          // determine who to match against
          const nameToMatch = isClient
            ? chat.providerUserId.activeRoleId?.providerName
            : `${chat.clientUserId.firstName ?? ""} ${
                chat.clientUserId.lastName ?? ""
              }`;

          const lastMessageText = chat.lastMessage?.text?.toLowerCase() ?? "";

          return (
            nameToMatch?.toLowerCase().includes(q) ||
            lastMessageText.includes(q)
          );
        });
        setFilteredChats(filtered);
      } else {
        setFilteredChats([]);
      }
    }
  }, [providers, chats, filterQuery, setFilteredProviders, setFilteredChats]);

  // Initialize address
  useEffect(() => {
    const defaultAddress = selectedPlace
      ? selectedPlace.formatted_address
      : currentLocation
      ? currentLocation.formattedAddress
      : "Enter location...";

    setLocationAddress(defaultAddress || "Enter location...");
  }, [selectedPlace, currentLocation]);

  // Location query autocomplete and backend address-search
  useEffect(() => {
    if (locationQuery && !isLocationSelected) {
      debouncedFetchRef.current(locationQuery, setPredictions);
      debouncedSearchAddressRef.current(locationQuery);
    } else {
      setPredictions([]);
    }
  }, [locationQuery, isLocationSelected]);

  // cancel debounces
  useEffect(() => {
    return () => {
      (debouncedFetchRef.current as any)?.cancel?.();
      (debouncedSearchAddressRef.current as any)?.cancel?.();
    };
  }, []);

  const resetLocationInput = useCallback(() => {
    const defaultAddress = selectedPlace?.place_id
      ? selectedPlace.formatted_address
      : currentLocation
      ? currentLocation.formattedAddress
      : "Enter location...";

    setLocationAddress(defaultAddress || "Enter location...");
    setLocationQuery("");
    setIsLocationSelected(false);
    setPredictions([]);

    if (selectedPlace && !locationQuery) {
      void executeSearch({
        model: "providers",
        page: 1,
        limit: 10,
        engine: true,
        searchInput: searchQuery,
        lat: selectedPlace.geometry.location.lat,
        long: selectedPlace.geometry.location.lng,
        country: currentLocation?.country || "",
        address: selectedPlace.formatted_address,
      });
    }
  }, [
    selectedPlace,
    currentLocation,
    searchQuery,
    executeSearch,
    locationQuery,
  ]);

  const handleSearchExecute = useCallback(async () => {
    if ((searchQuery.length > 0 || locationQuery.length > 0) && !providers) {
      const searchAddress = selectedPlace
        ? selectedPlace.formatted_address
        : locationQuery || currentLocation?.formattedAddress || "";

      const searchLat = selectedPlace
        ? selectedPlace.geometry.location.lat
        : currentLocation?.coords.latitude || 0;

      const searchLong = selectedPlace
        ? selectedPlace.geometry.location.lng
        : currentLocation?.coords.longitude || 0;

      await executeSearch({
        model: "providers",
        page: 1,
        limit: 10,
        engine: true,
        searchInput: searchQuery,
        lat: searchLat,
        long: searchLong,
        country: currentLocation?.country || "",
        address: searchAddress,
      });
    }
  }, [
    executeSearch,
    searchQuery,
    selectedPlace,
    currentLocation,
    providers,
    locationQuery,
  ]);

  const handleLocationSelect = useCallback(
    async (prediction: Place) => {
      try {
        const details = await GooglePlaceService.getPlaceDetails(
          prediction.place_id
        );
        setSelectedPlace(details);
        setLocationAddress(details.formatted_address);
        setLocationQuery("");
        setIsLocationSelected(true);
        setPredictions([]);

        void executeSearch({
          model: "providers",
          page: 1,
          limit: 10,
          engine: true,
          searchInput: searchQuery,
          lat: details.geometry.location.lat,
          long: details.geometry.location.lng,
          country: currentLocation?.country || "",
          address: details.formatted_address,
        });
      } catch (err: any) {
        setError(`Location selection error: ${err.message}`);
      }
    },
    [setSelectedPlace, executeSearch, searchQuery, setError]
  );

  const handleFocus = useCallback(() => {
    if (isHomeView) setLocationInput(true);
    if (isSearchFocus) isSearchFocus(true);

    setLocationQuery("");
    setIsLocationSelected(false);
  }, [isHomeView, isSearchFocus]);

  const handleBlur = useCallback(() => {
    if (isSearchFocus) isSearchFocus(false);

    setTimeout(() => {
      if (!isLocationSelected) {
        setLocationInput(false);
        resetLocationInput();
      }
    }, 200);
  }, [isSearchFocus, isLocationSelected, resetLocationInput]);

  const handleLocationInputChange = useCallback((text: string) => {
    setLocationQuery(text);
    setIsLocationSelected(false);
  }, []);

  const clearSearch = useCallback(() => setSearchQuery(""), []);

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
                  placeholder={locationAddress}
                  value={locationQuery}
                  className="placeholder:text-lg placeholder:text-gray-400 placeholder:line-clamp-1"
                  onChangeText={handleLocationInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
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
              if (isSearchFocus) isSearchFocus(false);
              handleSearchExecute();
            }}
            onSubmitEditing={handleSearchExecute}
          />
          {isLoading && (
            <InputSlot className="pr-3">
              <ButtonSpinner />
            </InputSlot>
          )}
        </Input>
      )}

      {(isSavedCompaniesView || isUpdateView) && (
        <Input className="m-4 rounded-2xl border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
          <InputSlot className="pl-4">
            <InputIcon
              size="xl"
              as={SlidersHorizontalIcon}
              className="text-gray-400"
            />
          </InputSlot>
          <InputField
            placeholder={
              isSavedCompaniesView ? "Filter..." : "Search for companies..."
            }
            className="placeholder:text-lg placeholder:text-gray-400"
            onChangeText={(text) => setFilterQuery(text)}
          />
        </Input>
      )}

      {isChatView && (
        <Input className="m-4 rounded-2xl border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
          <InputSlot className="pl-4">
            <InputIcon size="xl" as={SearchIcon} className="text-gray-400" />
          </InputSlot>
          <InputField
            placeholder="Search Chats..."
            className="placeholder:text-lg placeholder:text-gray-400"
            onChangeText={(text) => setFilterQuery(text)}
          />
        </Input>
      )}
    </FormControl>
  );
};

export default SearchBar;
