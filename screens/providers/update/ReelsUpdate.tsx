import { VStack } from "@/components/ui/vstack";
import { FlatList } from "react-native";
import { useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";
import { Dimensions, View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import * as VideoThumbnails from "expo-video-thumbnails";
import { router } from "expo-router";

const ProviderReelsUpdate = () => {
  const { width } = Dimensions.get("window");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
};
