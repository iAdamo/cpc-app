import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import VideoPlayer from "@/components/media/VideoPlayer";
import { Image } from "expo-image";
import { useVideoPlayer } from "expo-video";
import { Icon, ArrowLeftIcon } from "../ui/icon";
import { MediaItem } from "@/types";

const getMediaType = (url: string): "image" | "video" | "doc" => {
  const imageExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
  const videoExt = [".mp4", ".mov", ".avi", ".webm", ".mkv", ".3gp"];
  const docExt = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
  ];
  const lowerUrl = url.split("?")[0].toLowerCase();
  if (imageExt.some((ext) => lowerUrl.endsWith(ext))) return "image";
  if (videoExt.some((ext) => lowerUrl.endsWith(ext))) return "video";
  if (docExt.some((ext) => lowerUrl.endsWith(ext))) return "doc";
  return "doc";
};

interface MediaViewProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  mediaList?: MediaItem[];
  initialIndex?: number;
}

const MediaView = ({
  isOpen,
  onClose,
  url,
  mediaList,
  initialIndex = 0,
}: MediaViewProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  // Use either the single URL or get from mediaList
  const currentUrl = url || (mediaList && mediaList[currentIndex]?.url) || "";

  const mediaType = getMediaType(currentUrl);
  const isImage = mediaType === "image";
  const isVideo = mediaType === "video";
  const isDoc = mediaType === "doc";

  const player = useVideoPlayer(currentUrl, (player) => {
    player.loop = false;
    player.play();
  });

  const close = () => {
    try {
      player.release();
    } catch (e) {
      // ignore
    }
    setCurrentIndex(0);
    onClose();
  };

  const goToNext = () => {
    if (mediaList && currentIndex < mediaList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (mediaList && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      onRequestClose={close}
      style={{ flex: 1, backgroundColor: "red" }}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={close}
      />
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={close}>
          <Icon as={ArrowLeftIcon} className="text-white w-8 h-8" size="xl" />
        </TouchableOpacity>

        <View style={styles.mediaWrapper}>
          {isImage && (
            <Image
              source={currentUrl}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 0,
                backgroundColor: "#000",
              }}
              contentFit="contain"
              alt={currentUrl}
            />
          )}
          {isVideo && (
            <VideoPlayer
              uri={currentUrl}
              autoPlay={true}
              showControls={false}
              player={player}
            />
          )}
        </View>

        {/* Navigation buttons for media list */}
        {mediaList && mediaList.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={goToPrev}
              >
                <Icon as={ArrowLeftIcon} className="text-white w-6 h-6" />
              </TouchableOpacity>
            )}
            {currentIndex < mediaList.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={goToNext}
              >
                <Icon
                  as={ArrowLeftIcon}
                  className="text-white w-6 h-6"
                  style={{ transform: [{ rotate: "180deg" }] }}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

export default MediaView;

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "black",
  },
  container: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-start",
    marginLeft: 12,
    marginBottom: 8,
    padding: 8,
    zIndex: 10,
  },
  mediaWrapper: {
    width: "100%",
    height: Math.max(300, height - 120),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    padding: 12,
    zIndex: 10,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
});
