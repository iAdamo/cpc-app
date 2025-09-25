import { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { PencilLineIcon, TrashIcon } from "lucide-react-native";
import MediaPicker from "@/components/media/MediaPicker";
import useGlobalStore from "@/store/globalStore";
import { ProviderData, FileType } from "@/types";
import SocialMediaDetails from "./SocialLinks";

interface AboutProps {
  provider: ProviderData;
  isEditable: boolean;
}

const About: React.FC<AboutProps> = ({ provider, isEditable }) => {
  const { updateUserProfile } = useGlobalStore();
  const [isImageEdit, setIsImageEdit] = useState(false);
  const [isDescEdit, setIsDescEdit] = useState(false);
  const [desc, setDesc] = useState(provider.providerDescription || "");
  const [photos, setPhotos] = useState<FileType[]>(
    Array.isArray(provider.providerImages)
      ? provider.providerImages.map((img, idx) =>
          typeof img === "string"
            ? { uri: img, type: "image/jpeg" as FileType["type"] }
            : img
        )
      : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("providerDescription", desc);
      photos.forEach((photo, index) => {
        formData.append(
          "providerImages",
          {
            uri: photo.uri,
            name: `${index}companyimage.jpg`,
            type: "image/jpeg",
          } as any,
          `${index}companyimage.jpg`
        );
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
              onPress={() => setIsDescEdit(true)}
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
            initialFiles={photos}
            onFilesChange={setPhotos}
            allowedTypes={["image", "video"]}
          />
        ) : photos.length > 0 ? (
          photos.map((item, idx) => (
            <Image
              key={idx}
              source={typeof item === "string" ? item : item.uri}
              alt={`Portfolio ${item.name || idx}`}
              className="w-full h-60 rounded-md bg-gray-200 mb-4"
            />
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
                        typeof img === "string"
                          ? {
                              uri: img,
                              name: `photo${idx}.jpg`,
                              type: "image/jpeg" as FileType["type"],
                            }
                          : img
                      )
                    : []
                );
              }}
              disabled={isSubmitting}
              className="bg-gray-200/50 border-0"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </HStack>
        )}
      </VStack>
    </Card>
  );
};

export default About;
