import VideoPlayer from "@/components/media/VideoPlayer";
import { Image } from "../ui/image";
import { Text } from "../ui/text";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Icon, CloseIcon, ArrowLeftIcon } from "../ui/icon";
import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Button } from "../ui/button";

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        player.release();
        onClose();
      }}
      closeOnOverlayClick={true}
      className="bg-black flex-1"
    >
      <ModalBackdrop />
      <ModalContent className="flex-1 w-full p-0  pt-16 bg-black">
        <ModalHeader className="">
          <ModalCloseButton>
            <Icon
              size="xl"
              as={ArrowLeftIcon}
              className="ml-4 w-8 h-8 text-white"
            />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody
          className="m-0 bg-black flex-1"
          contentContainerClassName="flex-1 justify-center items-center bg-black "
        >
          {isImage && (
            <Image
              source={url}
              className="flex-1 w-full h-full object-contain bg-black"
              resizeMode="contain"
            />
          )}
          {isVideo && (
            <VideoPlayer
              uri={url}
              loadThumbnail={false}
              autoPlay={true}
              showControls={false}
              player={player}
            />
          )}
        </ModalBody>
        <ModalFooter className="bg-black"></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MediaView;
