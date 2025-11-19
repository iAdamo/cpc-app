import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { ChevronLeftIcon } from "@/components/ui/icon";
import { router } from "expo-router";
import {
  Navigation2Icon,
  Share,
  Users,
  Gift,
  Copy,
  Check,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import { Alert, ScrollView } from "react-native";
import { ShareService } from "@/services/shareService";
import { GooglePlaceService } from "@/services/googlePlaceService";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { Platform } from "react-native";
import ProvidersMap from "@/components/maps/ProviderMap";
import useGlobalStore from "@/store/globalStore";
import { View, StyleSheet } from "react-native";
import { ProviderData } from "@/types";
import { Spinner } from "@/components/ui/spinner";

export interface MapsProp {
  markers: [];
}

const MapView = (props: { props: MapsProp }) => {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData>();
  const { searchResults, isLoading } = useGlobalStore();
  // console.log("Providers in MapView:", providers[0]?.location);
  useEffect(() => {
    if (searchResults && searchResults.providers) {
      setProviders(searchResults.providers);
    }
  }, [searchResults]);

  const handleProviderSelect = (provider: ProviderData) => {
    setSelectedProvider(provider);
    // console.log("Selected provider:", provider);
  };

  return (
    providers &&
    providers.length > 0 ? (
      <View style={styles.container}>
        <ProvidersMap
          providers={providers}
          onProviderSelect={handleProviderSelect}
          showUserLocation={true}
          enableLiveTracking={false}
        />
      </View>
    ) : (<Spinner size="large" className="flex-1" />)
  );
};

export default MapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
