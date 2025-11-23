import { View, Text, StyleSheet, Image } from "react-native";
import { ProviderMarkerProps } from "@/types";
import { locationService } from "@/utils/GetDistance";

const STATUS_COLORS = {
  Online: "#4CAF50",
  Busy: "#FF9800",
  Offline: "#9E9E9E",
};

export const ProviderMarker: React.FC<ProviderMarkerProps> = ({
  provider,
  userLocation,
  isSelected,
}) => {
  const providerLat = provider.location.primary?.coordinates?.[0];
  const providerLong = provider.location.primary?.coordinates?.[1];

  const distance =
    userLocation && providerLat && providerLong
      ? locationService.getDistanceFromCurrentLocationWithUnit(
          providerLat,
          providerLong
        )
      : null;

      console.log("ProviderMarker - provider:", provider.providerName, "isSelected:", isSelected);

  const color = STATUS_COLORS[provider.availability] || "#607D8B";

  return (
    <View style={[styles.wrapper, isSelected && styles.selectedWrapper]}>
      {/* Card */}
      <View style={styles.card}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />

        <Text style={styles.name} numberOfLines={1}>
          {provider.providerName}
        </Text>

        <Text style={[styles.status, { color }]}>{provider.availability}</Text>

        {distance && <Text style={styles.distance}>{distance.text}</Text>}
      </View>

      {/* Triangle pointer */}
      <View style={[styles.pointer, { borderTopColor: "#fff" }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    width: 120,

  },
  selectedWrapper: {
    transform: [{ scale: 1.1 }],
  },
  card: {
    minWidth: 120,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  name: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  status: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
  },
  distance: {
    marginTop: 2,
    fontSize: 10,
    color: "#666",
  },
  statusDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },
});
