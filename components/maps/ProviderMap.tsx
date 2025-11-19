import { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, {
  Marker,
  Callout,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import * as Location from "expo-location";
import { ProvidersMapProps, ProviderData, MapType, MediaItem } from "@/types";
import useGlobalStore from "@/store/globalStore";
import { Spinner } from "../ui/spinner";
import { ProviderMarker } from "./ProviderMarker";
import ProviderModal from "./ProviderModal";
import MapControls from "./MapControls";
// import { calculateDistance, getRegionForCoordinates } from '../utils/mapUtils';

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
// Smaller delta -> closer zoom
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const ProvidersMap: React.FC<ProvidersMapProps> = ({
  providers,
  onProviderSelect,
  showUserLocation = true,
  enableLiveTracking = false,
}) => {
  const mapRef = useRef<MapView | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<null | ProviderData>(
    null
  );
  const [isLiveTracking, setIsLiveTracking] =
    useState<boolean>(enableLiveTracking);
  const [mapType, setMapType] = useState<MapType>("standard");
  const {
    currentLocation,
    getCurrentLocation,
    startLiveTracking,
    stopLiveTracking,
    isTracking,
    liveLocation,
    isLoading,
  } = useGlobalStore();
  const [region, setRegion] = useState({
    latitude: currentLocation ? currentLocation.coords.latitude : 37.78825,
    longitude: currentLocation ? currentLocation.coords.longitude : -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  useEffect(() => {
    if (isLiveTracking) {
      startLiveTracking();
      if (liveLocation && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: liveLocation.coords.latitude,
          longitude: liveLocation.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
      }
    }
    return () => {
      if (isTracking) {
        stopLiveTracking();
      }
    };
  }, [isLiveTracking]);

  const handleProviderSelect = (provider: ProviderData) => {
    setSelectedProvider(provider);
    onProviderSelect(provider);
    centerMapOnProvider(provider);
  };

  const handleModalClose = () => {
    setSelectedProvider(null);
  };

  const toggleLiveTracking = () => {
    setIsLiveTracking((prev) => !prev);
  };

  const centerMapOnUser = async () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        1000
      );
    } else {
      const location = await getCurrentLocation();
      if (location && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          },
          1000
        );
      }
    }
  };

  const centerMapOnProvider = (
    provider: ProviderData,
    location?: Location.LocationObject
  ) => {
    if (mapRef.current) {
      const lat =
        location?.coords.latitude ??
        provider.location.primary?.coordinates?.[1] ??
        region.latitude;
      const lon =
        location?.coords.longitude ??
        provider.location.primary?.coordinates?.[0] ??
        region.longitude;

      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  };

  const handleRegionChangeComplete = (newRegion: typeof region) => {
    setRegion(newRegion);
  };

  if (isLoading) {
    return <Spinner size="large" className="" />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        mapType={mapType}
        // use initialRegion to avoid controlling the MapView which can cause
        // continuous onRegionChange -> setState -> re-render loops
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={showUserLocation}
        followsUserLocation={isLiveTracking}
        showsMyLocationButton={false}
      >
        {/** User location */}
        {showUserLocation && currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
            title="You are here"
            description="Current Location"
            pinColor="#007AFF"
          />
        )}

        {providers.map((provider) => {
          const latitude =
            provider.location.primary?.coordinates?.[1] ?? region.latitude;
          const longitude =
            provider.location.primary?.coordinates?.[0] ?? region.longitude;
          return (
            <Marker
              key={provider._id}
              coordinate={{ latitude, longitude }}
              title={provider.providerName}
              pinColor={
                selectedProvider?._id === provider._id ? "green" : "red"
              }
              onPress={() => handleProviderSelect(provider)}
            >
            </Marker>
          );
        })}
      </MapView>

      {/** Map Controls*/}
      <MapControls
        isLiveTracking={isLiveTracking}
        onToggleLiveTracking={toggleLiveTracking}
        onMapTypeChange={setMapType}
        mapType={mapType}
        onFocusUserLocation={centerMapOnUser}
        // onFocusProvider={centerMapOnProvider}
      />
      {/** Provider Modal */}
      {selectedProvider && (
        <ProviderModal
          provider={selectedProvider}
          userLocation={currentLocation}
          visible={!!selectedProvider}
          onClose={handleModalClose}
          onFocusLocation={() =>
            centerMapOnProvider(selectedProvider, currentLocation || undefined)
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
});

export default ProvidersMap;
