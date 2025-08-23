import React from "react";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function AppLayout() {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={"#FFFFFF"}
      />
      <Stack screenOptions={{ headerShown: false }} />;
    </>
  );
}
