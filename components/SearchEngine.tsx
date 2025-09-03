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
import { MapPinIcon } from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";
import { GooglePlaceService } from "@/services/GooglePlaceService";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { Place } from "@/types";
import { debounce } from "lodash";

const SearchBar = () => {
  const [locationInput, setLocationInput] = useState<boolean>(false);
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [predictions, setPredictions] = useState<Place[]>([]);

  const {
    selectedPlace,
    setSelectedPlace,
    currentLocation,
    executeSearch,
    isLoading,
    setError,
  } = useGlobalStore();

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

  useEffect(() => {
    if (locationQuery) {
      debouncedFetchPredictions(locationQuery);
    } else {
      setPredictions([]);
    }
  }, [locationQuery, debouncedFetchPredictions]);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (locationQuery.length > 2) {
        const results = await GooglePlaceService.autocomplete(locationQuery);
        setPredictions(results);
      } else if (searchQuery.length > 2) {
        await handleSearchExecute();
      } else {
        setPredictions([]);
      }
    };

    fetchPredictions();
  }, [locationQuery, searchQuery]);

  const handleSearchExecute = useCallback(async () => {
    if (searchQuery.length > 0) {
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
  }, [executeSearch, searchQuery, selectedPlace, currentLocation]);

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
        if (searchQuery.length > 0) {
          await handleSearchExecute();
        }
      } catch (err: any) {
        setError(`Place details error: ${err.message}`);
      }
    },
    [setSelectedPlace, searchQuery, handleSearchExecute]
  );

  const currentLocationText = selectedPlace
    ? selectedPlace.formatted_address
    : currentLocation
    ? currentLocation.formattedAddress
    : "Get Location";

  const handleFocus = useCallback(() => setLocationInput(true), []);

  return (
    <FormControl className="gap-4">
      {locationInput && (
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
          {predictions.length > 0 ? (
            predictions.map((prediction) => (
              <MenuItem
                key={prediction.place_id}
                textValue={prediction.description}
                onPress={() => handleLocationSelect(prediction)}
              >
                <MenuItemLabel>{prediction.description}</MenuItemLabel>
              </MenuItem>
            ))
          ) : locationQuery.length > 2 ? (
            <MenuItem key="no-results" textValue="No results" className="p-4">
              <MenuItemLabel>No locations found</MenuItemLabel>
            </MenuItem>
          ) : null}
        </Menu>
      )}
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
          onBlur={handleSearchExecute}
        />
        {isLoading && (
          <InputSlot className="pr-3">
            <ButtonSpinner />
          </InputSlot>
        )}
      </Input>
    </FormControl>
  );
};

export default SearchBar;
