import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Input, InputField } from "@/components/ui/input";
import { TrashIcon } from "@/components/ui/icon";
import useGlobalStore from "@/store/globalStore";
import { Image } from "@/components/ui/image";
import {
  companyFormSchema,
  companyFormSchemaType,
} from "@/components/schema/CompanySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { ScrollView } from "@/components/ui/scroll-view";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const CompanyBasicInfo = () => {
  const [selectedImages, setSelectedImages] = useState<FileType[]>([]);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const {
    user,
    updateProfile,
    currentStep,
    setCurrentStep,
    setError: setGError,
  } = useGlobalStore();
  if (!user) return;

  type FileType = {
    uri: string;
    name?: string;
    type: string;
    size?: number;
  };
  let files: FileType[] = [];

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<companyFormSchemaType>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      providerName: user.activeRoleId?.providerName || "",
      providerDescription: user.activeRoleId?.providerDescription || "",
      providerEmail: user.activeRoleId?.providerEmail || "",
      providerPhoneNumber: user.activeRoleId?.providerPhoneNumber || "",
      providerImages: files,
    },
  });

  useEffect(() => {
    (async () => {
      if (!status?.granted) {
        const response = await requestPermission();
        if (!response.granted) {
          setGError("Camera permission is required to take photos!");
          return;
        }
      }
    })();
  }, []);

  const pickImages = async (source: "gallery" | "camera") => {
    let result;
    if (source === "gallery") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 5 - selectedImages.length, // Limit to remaining slots
      });
    } else if (source === "camera") {
      if (!status?.granted) {
        const response = await requestPermission();
        if (!response.granted) {
          setGError("Camera permission is required to take photos!");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 1,
      });
    }
    if (result && !result.canceled && result.assets.length > 0) {
      files = await Promise.all(
        result.assets.map(async (asset) => {
          const info = await FileSystem.getInfoAsync(asset.uri);
          return {
            uri: asset.uri,
            name: asset.fileName ?? asset.uri.split("/").pop() ?? undefined,
            type: asset.type ?? "image",
            size: info.exists && "size" in info ? info.size : undefined,
          };
        })
      );
      const uris = result.assets.map((asset) => asset.uri);
      const validUris: string[] = [];
      const newSelectedImages = [...selectedImages, ...files].slice(0, 5);
      setSelectedImages(newSelectedImages);
      setValue(
        "providerImages",
        newSelectedImages.map((file) => ({
          uri: file.uri,
          name: file.name ?? "",
          type: file.type,
          size: file.size,
        }))
      );
      clearErrors("providerImages");

    }
  };
  const removeImage = (uri: string) => {
    const updatedImages = selectedImages.filter((img) => img !== uri);
    setSelectedImages(updatedImages);
    setValue(
      "providerImages",
      updatedImages.map((uri) => ({ uri }))
    );
  };

  return <VStack></VStack>;
};

export default CompanyBasicInfo;
// setSelectedImages((prev) => [...prev, ...uris]);
