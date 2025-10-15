import React, { useEffect, useState, useCallback } from "react";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView, createVideoPlayer } from "expo-video";
import { Image } from "../ui/image";
import { Pressable } from "../ui/pressable";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, Button } from "react-native";

interface VideoPlayerProps {
  uri: string;
  autoPlay?: boolean;
  showControls?: boolean;
  thumbnailTime?: number;
  loadThumbnail?: boolean;
  fullScreen?: boolean;
  player?: ReturnType<typeof createVideoPlayer>;
}

export default function VideoPlayer({
  uri,
  autoPlay = false,
  showControls = true,
  thumbnailTime = 1000,
  loadThumbnail = true,
  fullScreen = true,
  player: externalPlayer,
}: VideoPlayerProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(autoPlay);
  const [showPlayButton, setShowPlayButton] = useState(!autoPlay);
  const [overlayTimeout, setOverlayTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Generate thumbnail
  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
          uri,
          {
            time: thumbnailTime,
          }
        );
        setThumbnail(thumbnailUri);
      } catch (e) {
        console.warn("Failed to generate thumbnail:", e);
        setError("Failed to load video thumbnail");
      } finally {
        setIsLoading(false);
      }
    };

    if (uri) {
      if (!loadThumbnail) {
        setIsLoading(false);
        return;
      }
      generateThumbnail();
    }
  }, [uri, thumbnailTime]);

  // Initialize video player
  if (!externalPlayer) {
    externalPlayer = useVideoPlayer(uri, (player) => {
      player.loop = false;
      if (autoPlay) {
        player.play();
      }
    });
  }
  const player = externalPlayer;

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Show overlay for 3 seconds after touch
  const showOverlay = useCallback(() => {
    setShowPlayButton(true);
    if (overlayTimeout) clearTimeout(overlayTimeout);
    const timeout = setTimeout(() => {
      setShowPlayButton(false);
    }, 2000);
    setOverlayTimeout(timeout);
  }, [overlayTimeout]);

  // Always show overlay on touch, hide after 3s
  const handleVideoPress = () => {
    showOverlay();
    if (!showControls) {
      togglePlayPause();
    }
  };

  // Hide overlay after 3s when playing
  useEffect(() => {
    if (isPlaying && !showControls) {
      showOverlay();
    }
    // Cleanup on unmount
    return () => {
      if (overlayTimeout) clearTimeout(overlayTimeout);
    };
  }, [isPlaying, showControls]);

  const togglePlayPause = useCallback(() => {
    if (!showVideo) {
      setShowVideo(true);
      player.play();
    } else {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  }, [isPlaying, showVideo, player]);

  const handleReload = () => {
    setError(null);
    setIsLoading(true);
    setShowVideo(false);
    // Regenerate thumbnail and reset
    player.replay();
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  // Error state
  if (error && !thumbnail) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={48} color="#666" />
        <Button title="Retry" onPress={handleReload} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleVideoPress}
        className="flex-1 flex flex-col w-full justify-center bg-red-500 "
      >
        {showVideo ? (
          <View style={styles.videoWrapper}>
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen={fullScreen}
              allowsPictureInPicture
              nativeControls={showControls}
            />

            {/* Custom play/pause overlay */}
            {!showControls && showPlayButton && (
              <View style={styles.controlsOverlay}>
                <View style={styles.playButton}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={32}
                    color="white"
                  />
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: thumbnail! }}
              alt="Video Thumbnail"
              className="w-full h-80 rounded-lg object-cover"
            />

            {/* Play button overlay on thumbnail */}
            <View style={styles.thumbnailOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={32} color="white" />
              </View>
            </View>
          </View>
        )}
      </Pressable>

      {/* Error message that doesn't block the UI */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={16} color="white" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  videoWrapper: {
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  thumbnailContainer: {
    position: "relative",
    width: "100%",
    height: 275,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  playButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 50,
    padding: 12,
    paddingLeft: 14, // Offset for play icon
  },
  placeholder: {
    height: 275,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorContainer: {
    height: 275,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    gap: 16,
  },
  errorBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,0,0,0.8)",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  errorText: {
    color: "white",
    fontSize: 12,
  },
});
