// MediaScroll.tsx
import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import * as VideoThumbnails from "expo-video-thumbnails";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function MediaScroll({
  mediaItems,
}: {
  mediaItems: { type: string; uri: string; thumbnail?: string }[];
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [thumbnails, setThumbnails] = useState<Record<number, string | null>>(
    {}
  );

  const media = [
    ...mediaItems,
    {
      type: "image",
      uri: "https://picsum.photos/401/600",
      thumbnail: "https://picsum.photos/401/600",
    },
    {
      type: "image",
      uri: "https://picsum.photos/400/600",
      thumbnail: "https://picsum.photos/400/600",
    },
    {
      type: "image",
      uri: "https://picsum.photos/401/600",
      thumbnail: "https://picsum.photos/401/600",
    },
    {
      type: "video",
      uri: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail: "https://picsum.photos/402/600",
    },
    {
      type: "video",
      uri: "https://companiescenterllc.com/uploads/iadamo.inc@gmail.com/chats/1760334328663/1000649711.mp4",
      thumbnail: "https://picsum.photos/403/600",
    },
    {
      type: "video",
      uri: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail: "https://picsum.photos/404/600",
    },
    // etc.
  ];

  console.log("MediaScroll mediaItems:", mediaItems);

  let imageWidth;
  if (media.length === 1) imageWidth = width;
  else if (media.length === 2) imageWidth = width / 2 - 10;
  else imageWidth = width / 3 - 8;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {media.map((item, idx) => {
          return (
            <TouchableOpacity
              key={idx}
              onPress={() =>
                router.push({
                  pathname: "/update",
                  params: {
                    media: JSON.stringify(media),
                    startIndex: String(idx),
                  },
                })
              }
            >
              <View style={[styles.imageContainer, { width: imageWidth }]}>
                <Image
                  source={{ uri: item.thumbnail || item.uri }}
                  alt={"media"}
                  style={styles.image}
                  contentFit="cover"
                  transition={1000}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  imageContainer: {
    marginRight: 6,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});
