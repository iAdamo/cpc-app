import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function AppLayout() {
  return (
    <KeyboardProvider>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={"transparent"}
      />
      <Stack screenOptions={{ headerShown: false }} />
    </KeyboardProvider>
  );
}
