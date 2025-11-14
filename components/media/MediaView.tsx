import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import VideoPlayer from "@/components/media/VideoPlayer";
import { Image } from "../ui/image";
import { useVideoPlayer } from "expo-video";
import { Icon, ArrowLeftIcon } from "../ui/icon";

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

const MediaView = ({
  isOpen,
  onClose,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}) => {
  const mediaType = getMediaType(url);
  const isImage = mediaType === "image";
  const isVideo = mediaType === "video";
  const isDoc = mediaType === "doc";

  const player = useVideoPlayer(url, (player) => {
    player.loop = false;
    player.play();
  });
  const close = () => {
    try {
      player.release();
    } catch (e) {
      // ignore
    }
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      onRequestClose={close}
      style={{ flex: 1, backgroundColor: "black" }}
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
              source={url}
              className="w-full h-full object-cover bg-black"
              resizeMode="contain"
            />
          )}
          {isVideo && (
            <VideoPlayer
              uri={url}
              autoPlay={true}
              showControls={false}
              player={player}
            />
          )}
        </View>
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
  },
  mediaWrapper: {
    width: "100%",
    height: Math.max(300, height - 120),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
