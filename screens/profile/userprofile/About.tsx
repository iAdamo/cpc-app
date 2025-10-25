import { use, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { PencilLineIcon, TrashIcon } from "lucide-react-native";
import MediaPicker from "@/components/media/MediaPicker";
import MediaView from "@/components/media/MediaView";
import useGlobalStore from "@/store/globalStore";
import { ProviderData, FileType, MediaItem } from "@/types";
import SocialMediaDetails from "./SocialLinks";

interface AboutProps {
  provider: ProviderData;
  isEditable: boolean;
}

const About: React.FC<AboutProps> = ({ provider, isEditable }) => {
  const { updateUserProfile, selectedFiles } = useGlobalStore();
  const [isImageEdit, setIsImageEdit] = useState(false);
  const [isDescEdit, setIsDescEdit] = useState(false);
  const [desc, setDesc] = useState(provider.providerDescription || "");
  const [photos, setPhotos] = useState<FileType[]>(
    Array.isArray(provider.providerImages)
      ? provider.providerImages.map((img, idx) =>
          typeof (img as MediaItem).thumbnail === "string"
            ? {
                uri: (img as MediaItem).thumbnail!,
                name:
                  (img as MediaItem).url.split("/").pop() || `photo${idx}.jpg`,
                type: "image/jpeg" as FileType["type"],
                url: (img as MediaItem).url,
                thumbnail: (img as MediaItem).thumbnail,
                index: idx,
              }
            : (img as FileType)
        )
      : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<string>("");

  const openPhotoViewer = (url: string) => {
    setViewingPhoto(url);
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("providerDescription", desc);
      photos.forEach((photo, index) => {
        const fileName =
          typeof (photo as FileType).name === "string"
            ? (photo as FileType).name
            : photo.uri.split("/").pop() || `photo${index}.jpg`;
        formData.append("providerImages", {
          uri: photo.uri,
          name: fileName,
          type: "image/jpeg",
        } as any);
      });
      // console.log(Array.from(formData.entries()));
      await updateUserProfile("Provider", formData);
      setIsDescEdit(false);
      setIsImageEdit(false);
    } catch (e) {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-0">
      <VStack space="xs" className="px-4">
        <HStack className="items-center">
          <Heading size="md" className="text-typography-700">
            Description
          </Heading>
          {isEditable && !isDescEdit && (
            <Button
              variant="link"
              onPress={() => {
                setIsDescEdit(true);
                useGlobalStore.setState({ selectedFiles: [] });
              }}
              className="ml-auto"
            >
              <ButtonIcon
                size="sm"
                className="text-brand-primary"
                as={PencilLineIcon}
              />
              <ButtonText className="text-brand-primary">Edit</ButtonText>
            </Button>
          )}
        </HStack>
        {isDescEdit ? (
          <Textarea className="h-28">
            <TextareaInput
              value={desc}
              onChangeText={setDesc}
              placeholder="Describe your company/services..."
              multiline
            />
          </Textarea>
        ) : (
          <Text className="text-justify break-words line-clamp-[9]">
            {desc || "No description provided yet."}
          </Text>
        )}
        {isEditable && isDescEdit && (
          <HStack className="gap-2 mt-2 justify-end px-4">
            <Button
              size="xs"
              variant="outline"
              onPress={handleSave}
              isDisabled={isSubmitting || !desc.trim()}
              className="bg-brand-secondary/30 border-0"
            >
              <ButtonText>{isSubmitting ? "Saving..." : "Save"}</ButtonText>
            </Button>
            <Button
              size="xs"
              variant="outline"
              onPress={() => {
                setIsDescEdit(false);
                setDesc(provider.providerDescription || "");
              }}
              disabled={isSubmitting}
              className="bg-gray-200/50 border-0"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </HStack>
        )}
      </VStack>
      <SocialMediaDetails provider={provider} isEditable={isEditable} />
      <VStack space="xs" className="px-4 mb-4">
        <HStack>
          <Heading size="md" className="text-typography-700">
            Photos
          </Heading>
          {isEditable && !isImageEdit && (
            <Button
              variant="link"
              onPress={() => setIsImageEdit(true)}
              className="ml-auto"
            >
              <ButtonIcon
                size="sm"
                className="text-brand-primary"
                as={PencilLineIcon}
              />
              <ButtonText className="text-brand-primary">Edit</ButtonText>
            </Button>
          )}
        </HStack>
        {isImageEdit ? (
          <MediaPicker
            maxFiles={6}
            maxSize={10}
            initialFiles={photos as FileType[]}
            onFilesChange={setPhotos}
            allowedTypes={["image", "video"]}
          />
        ) : photos.length > 0 ? (
          (photos as any).map((item: MediaItem, idx: number) => (
            <Pressable
              key={idx}
              onPress={() => {
                openPhotoViewer(item.url);
              }}
            >
              <VStack className="relative">
                <Image
                  source={{ uri: item.thumbnail }}
                  alt={`Portfolio ${idx}`}
                  className="w-full h-60 rounded-md bg-gray-200 mb-4"
                />
              </VStack>
            </Pressable>
          ))
        ) : (
          <Text className="text-gray-500 italic">No photos uploaded yet.</Text>
        )}
        {isEditable && isImageEdit && (
          <HStack className="gap-2 mt-2 justify-end px-4">
            <Button
              size="xs"
              variant="outline"
              onPress={handleSave}
              isDisabled={isSubmitting}
              className="bg-brand-secondary/30 border-0"
            >
              <ButtonText>{isSubmitting ? "Saving..." : "Save"}</ButtonText>
            </Button>
            <Button
              size="xs"
              variant="outline"
              onPress={() => {
                setIsImageEdit(false);
                setPhotos(
                  Array.isArray(provider.providerImages)
                    ? provider.providerImages.map((img, idx) =>
                        typeof (img as MediaItem).thumbnail === "string"
                          ? {
                              uri: (img as MediaItem).thumbnail!,
                              name:
                                (img as MediaItem).url.split("/").pop() ||
                                `photo${idx}.jpg`,
                              type: (img as MediaItem).type as FileType["type"],
                              url: (img as MediaItem).url,
                              thumbnail: (img as MediaItem).thumbnail,
                              index: idx,
                            }
                          : (img as FileType)
                      )
                    : []
                );
                useGlobalStore.setState({ selectedFiles: [] });
              }}
              isDisabled={isSubmitting}
              className="bg-gray-200/50 border-0"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </HStack>
        )}
      </VStack>
      {viewingPhoto && (
        <MediaView
          isOpen={viewingPhoto !== null}
          onClose={() => setViewingPhoto("")}
          url={viewingPhoto}
        />
      )}
    </Card>
  );
};

export default About;
