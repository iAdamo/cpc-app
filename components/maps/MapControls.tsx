import { VStack } from "../ui/vstack";
import { Pressable } from "../ui/pressable";
import { Button, ButtonIcon } from "../ui/button";
import { MapControlProps, MapType } from "@/types";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MapControls: React.FC<MapControlProps> = ({
  mapType,
  // onFocusProvider,
  onMapTypeChange,
  isLiveTracking,
  onFocusUserLocation,
  onToggleLiveTracking,
}) => {
  const mapTypes = ["standard", "satellite", "terrain", "hybrid"];
  const getMapTypeIcon = (type: MapType) => {
    switch (type) {
      case "standard":
        return "map";
      case "satellite":
        return "earth";
      case "terrain":
        return "terrain";
      case "hybrid":
        return "layers";
      default:
        return "map";
    }
  };

  const cycleMapType = () => {
    const currentIndex = mapTypes.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % mapTypes.length;
    onMapTypeChange(mapTypes[nextIndex]);
  };

  return (
    <View style={styles.controlsContainer}>
      {/* Location Controls */}
      <View style={styles.controlGroup}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            isLiveTracking && styles.controlButtonActive,
          ]}
          onPress={onToggleLiveTracking}
        >
          <Ionicons
            name={isLiveTracking ? "navigate" : "navigate-outline"}
            size={24}
            color={isLiveTracking ? "#007AFF" : "#666666"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={onFocusUserLocation}
        >
          <Ionicons name="locate" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Map Type Control */}
      <View style={styles.controlGroup}>
        <TouchableOpacity style={styles.controlButton} onPress={cycleMapType}>
          <Ionicons name={getMapTypeIcon(mapType) as any} size={24} color="#666666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MapControls;

const styles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    top: 60,
    right: 16,
    gap: 16,
  },
  controlGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: "#E3F2FD",
  },
});
