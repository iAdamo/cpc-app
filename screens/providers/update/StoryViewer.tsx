import { use, useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent, useEventListener } from "expo";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function StoryViewer() {
  const params = useLocalSearchParams();
  const mediaItems = params.media ? JSON.parse(String(params.media)) : [];
  const startIndex = params.startIndex
    ? Math.max(0, Number(params.startIndex))
    : 0;

    // console.log("StoryViewer mediaItems:", mediaItems);

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [paused, setPaused] = useState(false);
  const progressAnimations = useRef(
    mediaItems.map(() => new Animated.Value(0))
  ).current;
  const [wasPlaying, setWasPlaying] = useState(false);

  const currentProgress = progressAnimations[currentIndex];

  const currentItem = mediaItems[currentIndex];
  const isVideo = currentItem?.type === "video";

  console.log("StoryViewer currentItem:", currentItem);

  const player = useVideoPlayer(currentItem.uri, (player) => {
    player.loop = false;
    player.play();
  });

  const { isPlaying } = useEvent(player!, "playingChange", {
    isPlaying: player!.playing,
  });

  const { status } = useEvent(player!, "statusChange", {
    status: player!.status,
  });

  // useEventListener(player, "sourceChange", ({ source, oldSource }) => {
  //   console.log({ source, oldSource });
  // });

  // Reset and start progress when index changes
  useEffect(() => {
    if (!currentItem) {
      router.back();
      return;
    }

    // Reset all progress animations
    progressAnimations.forEach((anim: Animated.Value, index: number) => {
      if (index > currentIndex) {
        anim.setValue(0);
      } else if (index < currentIndex) {
        anim.setValue(1);
      }
    });

    if (currentIndex < progressAnimations.length) {
      currentProgress.setValue(0);
      if (isVideo) {
        console.log("Current Index Changed:", {
          currentIndex,
          isVideo,
          isPlaying,
          status,
        });
        if (status === "readyToPlay") {
          console.log("Starting video playback");
          startProgress();
        } else if (status === "error") {
          player.pause();
          console.warn("Video error:");
        }
      } else {
        console.log("Starting progress for image");
        startProgress();
      }
    }
  }, [currentIndex, status]);

  // Handle pause/resume
  useEffect(() => {
    if (paused) {
      currentProgress.stopAnimation();
      if (isVideo) {
        if (isPlaying && player) {
          player.pause();
        }
      }
    } else {
      if (isVideo) {
        console.log("Current Index Changed in pause:", isPlaying, status);
        if (wasPlaying) {
          console.log("Resuming video playback");
          player.pause();
          player.play();
          startProgress();
          console.log("Resumed progress for video");
        }
      } else {
        console.log("Resuming progress for image");
        startProgress();
      }
    }
  }, [paused]);

  const startProgress = () => {
    if (!currentItem) return;
    const duration = isVideo
      ? Math.round(player?.duration * 1000) || 5000
      : 5000;
    currentProgress.stopAnimation();
    Animated.timing(currentProgress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        goNext();
      }
    });
  };

  const goNext = async () => {
    if (currentIndex < mediaItems.length - 1) {
      if (isVideo) {
        await player.replaceAsync(currentItem);
      }
      setCurrentIndex((prev) => prev + 1);
    } else {
      router.back();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      if (isVideo) {
        player.replaceAsync(mediaItems[currentIndex - 1]);
      }
    } else {
      router.back();
    }
  };

  const handlePressIn = () => {
    setPaused(true);
    setWasPlaying(isPlaying);
  };

  const handlePressOut = () => {
    setPaused(false);
  };

  const handleScreenPress = (event: any) => {
    const x = event.nativeEvent.locationX;
    const screenWidth = width;

    if (x < screenWidth / 3) {
      // Left third - go previous
      goPrev();
    } else if (x > (2 * screenWidth) / 3) {
      // Right third - go next
      goNext();
    }
    // Middle third - do nothing (just pause/resume handled by press in/out)
  };

  // Video status handler
  const onVideoStatusUpdate = (status: any) => {
    if (status.didJustFinish && !paused) {
      goNext();
    }
  };

  if (!currentItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No media found</Text>
      </View>
    );
  }

  return (
    <VStack className="flex-1 bg-black">
      <Pressable
        className="flex-1"
        onPress={handleScreenPress}
        onLongPress={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={150}
      >
        {/* Progress Bars */}
        <View style={styles.progressBarContainer}>
          {mediaItems.map((_: any, index: number) => (
            <View key={index} style={styles.barBackground}>
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    width: progressAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Media Content */}
        {currentItem.type === "image" ? (
          <Image
            source={{ uri: currentItem.uri }}
            style={styles.fullMedia}
            resizeMode="contain"
          />
        ) : status === "readyToPlay" ? (
          <VideoView
            style={styles.fullMedia}
            player={player}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            nativeControls={false}
          />
        ) : (
          <View style={styles.container}>
            <Spinner size="large" color="white" />
          </View>
        )}

        {/* Close Button */}
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </Pressable>
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullMedia: {
    width,
    height,
  },
  progressBarContainer: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  barBackground: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "white",
  },
  closeBtn: {
    position: "absolute",
    top: 45,
    right: 20,
    padding: 10,
    zIndex: 11,
  },
  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "300",
  },
  userInfo: {
    position: "absolute",
    top: 45,
    left: 15,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 11,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  username: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },
  timestamp: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  pauseIndicator: {
    position: "absolute",
    top: height / 2 - 30,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 11,
  },
  pauseText: {
    color: "white",
    fontSize: 24,
  },
  errorText: {
    color: "white",
    fontSize: 16,
  },
});
