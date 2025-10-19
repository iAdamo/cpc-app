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
  mediaItems: { type: string; uri: string }[];
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [thumbnails, setThumbnails] = useState<Record<number, string | null>>(
    {}
  );

  const generateThumbnail = async (
    url: string
  ): Promise<string | undefined> => {
    try {
      setIsLoading(true);
      setError(null);
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
        url,
        { time: 1000 }
      );
      return thumbnailUri;
    } catch (e) {
      console.warn("Failed to generate thumbnail:", e);
      setError("Failed to load video thumbnail");
    } finally {
      setIsLoading(false);
    }
  };

  // const media = [
  //   { type: "image", uri: "https://picsum.photos/401/600" },
  //   { type: "image", uri: "https://picsum.photos/400/600" },
  //   { type: "image", uri: "https://picsum.photos/401/600" },
  //   { type: "video", uri: "https://www.w3schools.com/html/mov_bbb.mp4" },
  //   {
  //     type: "video",
  //     uri: "https://companiescenterllc.com/uploads/iadamo.inc@gmail.com/chats/1760334328663/1000649711.mp4",
  //   },
  //   // gimme another diff video

  //   { type: "video", uri: "https://www.w3schools.com/html/mov_bbb.mp4" },
  //   // etc.
  // ];

  useEffect(() => {
    const source = mediaItems || [];

    let mounted = true;

    (async () => {
      setIsLoading(true);
      try {
        if (thumbnails && Object.keys(thumbnails).length > 0) return;
        const settled = await Promise.allSettled(
          source.map(async (item, idx) => {
            if (item?.type === "video") {
              try {
                const uri = await generateThumbnail(item.uri);
                return { idx, uri };
              } catch (e) {
                return { idx, uri: undefined };
              }
            }
            return { idx, uri: undefined };
          })
        );

        if (!mounted) return;

        const map: Record<number, string> = {};
        for (const r of settled) {
          if (r.status === "fulfilled" && r.value?.uri) {
            map[r.value.idx] = r.value.uri;
          }
        }
        setThumbnails(map);
      } catch (e) {
        console.warn("Thumbnail generation failed:", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaItems]);

  let imageWidth;
  if (mediaItems.length === 1) imageWidth = width;
  else if (mediaItems.length === 2) imageWidth = width / 2 - 10;
  else imageWidth = width / 3 - 8;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mediaItems.map((item, idx) => {
          return (
            <TouchableOpacity
              key={idx}
              onPress={() =>
                router.push({
                  pathname: "/update",
                  params: {
                    media: JSON.stringify(mediaItems),
                    startIndex: String(idx),
                  },
                })
              }
            >
              <View style={[styles.imageContainer, { width: imageWidth }]}>
                <Image
                  // use pre-generated thumbnail URI for videos (string), avoiding Promise in source
                  source={{
                    uri:
                      item.type === "video" ? thumbnails[idx] ?? "" : item.uri,
                  }}
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
