import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function AppLayout() {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="#FFFFFF"
      />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
