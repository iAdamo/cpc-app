import { useState, useEffect } from "react";
import useGlobalStore from "@/store/globalStore";
import * as IntentLauncher from "expo-intent-launcher";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogBackdrop,
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import {
  Alert,
  Platform,
  BackHandler,
  Linking,
  AppState,
  AppStateStatus,
} from "react-native";
import { Image } from "./ui/image";

export const LocationPermission = () => {
  const [error, setError] = useState<string | null>(null);
  const { locationError, clearLocationError, getCurrentLocation } =
    useGlobalStore();
  const [appState, setAppState] = useState(AppState.currentState);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Check location permissions when app becomes active
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === "active") {
      // App has come to the foreground, re-check location permissions
      getCurrentLocation();
    }
    setAppState(nextAppState);
  };

  const openLocationSettings = async () => {
    try {
      if (Platform.OS === "android") {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
        );
      } else {
        // iOS: can only open app settings
        await Linking.openSettings();
      }
      clearLocationError();
    } catch (err) {
      Linking.openSettings();
      clearLocationError();
    }
  };

  const handleClose = () => {
    clearLocationError();
    setError(null);
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    } else {
      Alert.alert(
        "Exit App",
        "Please close the app manually.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
  };

  return (
    <AlertDialog
      isOpen={!!locationError}
      onClose={() => {
        !!locationError ? clearLocationError() : null;
        setError(null);
      }}
      closeOnOverlayClick={false}
      isKeyboardDismissable={false}
    >
      <AlertDialogBackdrop />
      <AlertDialogContent className="w-[90%] gap-4 items-center">
        <Image
          source={require("../assets/images/locationperm.png")}
          className="w-36 h-36"
          alt="Location Permission"
        />
        <AlertDialogHeader>
          <Heading className="text-center">
            Allow Companies Center to use your current location.
          </Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text className="text-center">
            This app requires location access to function properly. Please
            enable location services in your device settings.
          </Text>

          {/* Add a note about re-checking */}
          {locationError && (
            <Text className="text-center mt-4 text-sm text-gray-500">
              For more information on how we use your data, please check our
              privacy policy.
            </Text>
          )}
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button
            size="md"
            variant="outline"
            action="secondary"
            onPress={handleClose}
            className="flex-1"
          >
            <ButtonText>Exit App</ButtonText>
          </Button>

          <Button
            action="positive"
            onPress={() => openLocationSettings()}
            className="flex-1"
          >
            <ButtonText>Open Settings</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
