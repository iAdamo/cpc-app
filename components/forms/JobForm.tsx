import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Icon, AddIcon } from "@/components/ui/icon";
import MediaPicker from "@/components/media/MediaPicker";
import {
  JobFormSchema,
  JobFormSchemaType,
} from "@/components/schema/JobSchema";
import {
  FormControl,
  FormControlError,
  FormControlLabel,
  FormControlErrorText,
} from "@/components/ui/form-control";
import useGlobalStore from "@/store/globalStore";

type Props = {
  defaultValues?: Partial<JobFormSchemaType>;
  onSubmit?: (data: JobFormSchemaType) => Promise<void> | void;
};

const JobForm: React.FC<Props> = ({ defaultValues, onSubmit }) => {
  const { selectedFiles, setSelectedFiles } = useGlobalStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<JobFormSchemaType>({
    resolver: zodResolver(JobFormSchema),
    mode: "onChange",
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      categoryId: defaultValues?.categoryId || "",
      subcategoryId: defaultValues?.subcategoryId || "",
      budget: defaultValues?.budget || 5,
      Timeframe: defaultValues?.Timeframe || 1,
      location: defaultValues?.location || "",
      urgency: defaultValues?.urgency || "",
      visibility: defaultValues?.visibility || "",
      contactPreference: defaultValues?.contactPreference || "",
      media: defaultValues?.media || [],
    },
  });

  // Sync selected files from global store into form media
  useEffect(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      setValue("media", selectedFiles as any, { shouldDirty: true });
    }
  }, [selectedFiles]);

  const submit = async (data: JobFormSchemaType) => {
    if (onSubmit) return onSubmit(data);

    // Default submit: construct FormData and log
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === "media" && Array.isArray(v)) {
        v.forEach((file: any, idx: number) => {
          // Expect file to have uri, name and type
          const fileObj: any = {
            uri: file.uri,
            name: file.name || `file-${idx}`,
            type: file.type || "image/jpeg",
          };
          fd.append("media", fileObj as any);
        });
      } else {
        fd.append(k, (v as any).toString());
      }
    });

    console.log("FormData prepared for submit", fd);
  };

  return (
    <VStack className="w-full gap-4 p-4">
      <FormControl isInvalid={!!errors.title}>
        <FormControlLabel>
          <FormControlErrorText className="text-sm">Title</FormControlErrorText>
        </FormControlLabel>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder="Job title"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorText>{errors.title?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={!!errors.description}>
        <FormControlLabel>
          <FormControlErrorText className="text-sm">
            Description
          </FormControlErrorText>
        </FormControlLabel>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea>
              <TextareaInput
                placeholder="Describe the job in detail"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            </Textarea>
          )}
        />
        <FormControlError>
          <FormControlErrorText>
            {errors.description?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      <HStack className="w-full gap-2">
        <FormControl isInvalid={!!errors.budget} className="flex-1">
          <FormControlLabel>
            <FormControlErrorText className="text-sm">
              Budget ($)
            </FormControlErrorText>
          </FormControlLabel>
          <Controller
            control={control}
            name="budget"
            render={({ field: { onChange, value } }) => (
              <Input>
                <InputField
                  keyboardType="numeric"
                  placeholder="Budget"
                  onChangeText={(t) => onChange(Number(t))}
                  value={String(value || "")}
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {errors.budget?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl isInvalid={!!errors.Timeframe} className="flex-1">
          <FormControlLabel>
            <FormControlErrorText className="text-sm">
              Timeframe (days)
            </FormControlErrorText>
          </FormControlLabel>
          <Controller
            control={control}
            name="Timeframe"
            render={({ field: { onChange, value } }) => (
              <Input>
                <InputField
                  keyboardType="numeric"
                  placeholder="Days"
                  onChangeText={(t) => onChange(Number(t))}
                  value={String(value || "")}
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorText>
              {errors.Timeframe?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </HStack>

      <FormControl isInvalid={!!errors.location}>
        <FormControlLabel>
          <FormControlErrorText className="text-sm">
            Location
          </FormControlErrorText>
        </FormControlLabel>
        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, value } }) => (
            <Input>
              <InputField
                placeholder="Location"
                onChangeText={onChange}
                value={value}
              />
            </Input>
          )}
        />
        <FormControlError>
          <FormControlErrorText>
            {errors.location?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      <FormControl isInvalid={!!errors.media}>
        <FormControlLabel>
          <FormControlErrorText className="text-sm">Media</FormControlErrorText>
        </FormControlLabel>
        <MediaPicker
          maxFiles={2}
          maxSize={30}
          allowedTypes={["image", "video"]}
          initialFiles={[]}
          onFilesChange={(files) =>
            setValue("media", files as any, { shouldDirty: true })
          }
        />
        <FormControlError>
          <FormControlErrorText>{errors.media?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <Button
        className="w-full bg-brand-primary mt-2"
        onPress={handleSubmit(submit)}
        isDisabled={!isValid}
      >
        <ButtonIcon as={AddIcon} />
        <ButtonText>Create Job</ButtonText>
      </Button>
    </VStack>
  );
};

export default JobForm;
