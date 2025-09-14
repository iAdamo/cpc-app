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
import MediaPicker from "@/components/media/MediaPicker";
import { FileType } from "@/types";

const CompanyBasicInfo = () => {
  const {
    user,
    updateProfile,
    currentStep,
    setCurrentStep,
    setError: setGError,
  } = useGlobalStore();
  if (!user) return;

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
      providerImages: [],
    },
  });

  const handleFilesChange = (files: FileType[]) => {
    const mappedFiles = files.map((file) => ({
      ...file,
      name: file.name ?? "", // Ensure name is always a string
    }));
    setValue("providerImages", mappedFiles);
    if (files.length > 0) {
      clearErrors("providerImages");
    }
  };

  return (
    <VStack className="flex-1 p-4">
      <Heading className="text-2xl font-bold mb-4">
        Company Basic Information
      </Heading>
      <FormControl className="flex-1" isInvalid={!!errors.providerImages}>
        <FormControlLabel>
          <FormControlLabelText>Company Images</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="providerImages"
          render={({ field: { value } }) => (
            <MediaPicker
              maxFiles={4}
              maxSize={10}
              initialFiles={value}
              onFilesChange={handleFilesChange}
            />
          )}
        />
        {errors.providerImages && <Text>{errors.providerImages.message}</Text>}
      </FormControl>
    </VStack>
  );
};

export default CompanyBasicInfo;
// setSelectedImages((prev) => [...prev, ...uris]);
