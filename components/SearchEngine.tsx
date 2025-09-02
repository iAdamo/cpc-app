import { useState, useEffect } from "react";
import {
  Icon,
  CheckIcon,
  ChevronDownIcon,
  SearchIcon,
} from "@/components/ui/icon";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { BellDotIcon, NavigationIcon } from "lucide-react-native";
import {
  Button,
  ButtonText,
  ButtonIcon,
  ButtonSpinner,
} from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { FormControl } from "@/components/ui/form-control";
import {
  HouseIcon,
  CircleDotDashedIcon,
  MessagesSquareIcon,
  CircleUserRoundIcon,
  MapPinIcon,
} from "lucide-react-native";
import useGlobalStore from "@/store/globalStore";
import { GooglePlaceService } from "@/services/GooglePlaceService";
import {
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuSeparator,
} from "@/components/ui/menu";
import { Place } from "@/types";

const SearchBar = () => {
  const [locationInput, setLocationInput] = useState<boolean>(false);
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [predictions, setPredictions] = useState<Place[]>([]);

  const { selectedPlace, setSelectedPlace, currentLocation, executeSearch } =
    useGlobalStore();

  useEffect(() => {
    const fetchPredictions = async () => {
      if (locationQuery.length > 2) {
        const results = await GooglePlaceService.autocomplete(locationQuery);
        setPredictions(results);
        // console.log(results);
      } else if (searchQuery.length > 2) {
        await handleSearchExecute();
      } else {
        setPredictions([]);
      }
    };

    fetchPredictions();
  }, [locationQuery, searchQuery]);

  const handleLocationInput = () => {
    setLocationInput(!locationInput);
  };

  const handleSearchExecute = async () => {
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
      // sortBy: "relevance",
    });
  };

  return (
    <FormControl className="gap-4">
      {locationInput && (
        <Menu
          placement="bottom"
          offset={5}
          disabledKeys={["Settings"]}
          trigger={({ ...triggerProps }) => {
            return (
              <Input
                {...triggerProps}
                className="mx-4 rounded-2xl border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60"
              >
                <InputSlot>
                  <InputIcon as={MapPinIcon} className="text-gray-300 ml-4" />
                </InputSlot>
                <InputField
                  placeholder={`${
                    selectedPlace
                      ? selectedPlace.formatted_address
                      : currentLocation
                      ? currentLocation.formattedAddress
                      : "Get Location"
                  }`}
                  value={
                    selectedPlace
                      ? selectedPlace.formatted_address
                      : locationQuery
                  }
                  className="placeholder:text-lg placeholder:text-gray-300"
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
                className=""
                onPress={async () => {
                  const details = await GooglePlaceService.getPlaceDetails(
                    prediction.place_id
                  );
                  setSelectedPlace(details);
                  setLocationInput(false);
                  setPredictions([]);
                  setLocationQuery("");
                }}
              >
                <MenuItemLabel>{prediction.description}</MenuItemLabel>
              </MenuItem>
            ))}
        </Menu>
      )}
      <Input className="mx-4 rounded-2xl border-gray-300 h-14 data-[focus=true]:border-2 data-[focus=true]:border-brand-primary/60">
        <InputSlot>
          <InputIcon as={SearchIcon} className="text-gray-300 ml-4" />
        </InputSlot>
        <InputField
          placeholder="Search... e.g., tree felling, plumbing"
          className="placeholder:text-lg placeholder:text-gray-300"
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          onFocus={handleLocationInput}
          onBlur={handleLocationInput}
        />
      </Input>
    </FormControl>
  );
};

export default SearchBar;
