import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar, TopNavbar } from "@/components/layout/Navbar";

export default function AppLayout() {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={"transparent"}
      />
      <Stack screenOptions={{ headerShown: false }} />
      <BottomNavbar />
    </>
  );
}
