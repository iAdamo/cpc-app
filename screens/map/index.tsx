import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { ChevronLeftIcon } from "@/components/ui/icon";
import { router } from "expo-router";
import {
  Navigation2Icon,
  Share,
  Users,
  Gift,
  Copy,
  Check,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { ShareService } from "@/services/shareService";
import { GooglePlaceService } from "@/services/googlePlaceService";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { Platform } from "react-native";

const MapView = () => {
  if (Platform.OS === "ios") {
    return <AppleMaps.View style={{ flex: 1 }} />;
  } else if (Platform.OS === "android") {
    return <GoogleMaps.View style={{ flex: 1 }} />;
  } else {
    return (
      <VStack className="flex-1 bg-white">
        <HStack className="p-4">
          <Text>Maps are not available on this platform.</Text>
        </HStack>
      </VStack>
    );
  }
};

export default MapView;
