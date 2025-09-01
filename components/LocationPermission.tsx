import React, { useState, useEffect } from "react";
import { Alert as Alerts } from "react-native";
import * as Location from "expo-location";
import useGlobalStore from "@/store/globalStore";
import { LocationObject } from "expo-location";
import { VStack } from "./ui/vstack";
import { Box } from "./ui/box";
import { Icon } from "./ui/icon";
import { MapPinIcon } from "lucide-react-native";
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
import { Alert, Platform, BackHandler, Linking } from "react-native";

interface LocationPermissionProps {
  children: React.ReactNode;
}

export const LocationPermission: React.FC<LocationPermissionProps> = ({
  children,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { locationError, clearLocationError } = useGlobalStore();

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async (): Promise<void> => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      requestPermission();
    }
  };
  const requestPermission = async (): Promise<void> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Location permission status:", status);
    if (status !== "granted") {
      setError("Permission to access location was denied");
    } else {
      clearLocationError();
      setError(null);
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
    <>
      <AlertDialog
        isOpen={!!error || !!locationError?.includes("location")}
        onClose={() => {
          !error || !locationError?.includes("location")
            ? clearLocationError()
            : null;
          setError(null);
        }}
        closeOnOverlayClick={false}
        isKeyboardDismissable={false}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="w-[90%] gap-4 items-center">
          <Box className="rounded-full h-12 w-12 bg-background-success items-center justify-center">
            <Icon as={MapPinIcon} className="stroke-success-500 w-8 h-8" />
          </Box>
          <AlertDialogHeader>
            <Heading size="lg">Location Permission Required</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>
              This app requires location access to function properly. Please
              enable location services in your device settings.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={handleClose}
              className=""
            >
              <ButtonText>Close</ButtonText>
            </Button>
            <Button
              action="positive"
              onPress={() => Linking.openSettings()}
              className=""
            >
              <ButtonText>Grant Permission</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {children}
    </>
  );
};
