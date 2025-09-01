import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LocationPermission } from "@/components/LocationPermission";

export default function AppLayout() {
  return (
    <LocationPermission>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={"transparent"}
      />
      <Stack screenOptions={{ headerShown: false }} />
    </LocationPermission>
  );
}
