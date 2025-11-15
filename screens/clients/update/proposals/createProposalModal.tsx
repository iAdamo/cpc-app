import { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Keyboard } from "react-native";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Icon, ChevronLeftIcon } from "@/components/ui/icon";
import {
  Modal,
  ModalBackdrop,
  ModalCloseButton,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import useGlobalStore from "@/store/globalStore";
import { MapPinIcon } from "lucide-react-native";
import { JobData } from "@/types";
import { getDistanceWithUnit } from "@/utils/GetDistance";
import MediaPicker from "@/components/media/MediaPicker";
import { createProposal } from "@/services/axios/service";
import DateFormatter from "@/utils/DateFormat";

type ProposalSchemaType = z.infer<typeof ProposalSchema>;

const ProposalSchema = z.object({
  message: z
    .string()
    .min(10, "Please enter a brief cover message (min 10 chars)"),
  proposedPrice: z.number().min(0, "Proposed price must be >= 0"),
  estimatedDuration: z.number().min(1, "Delivery time must be at least 1 day"),
  additionalNote: z.string().optional(),
  media: z.array(z.any()).optional(),
});

const CreateProposal = ({
  job,
  onClose,
}: {
  job: JobData;
  onClose: () => void;
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { isLoading, setError, setSuccess } = useGlobalStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProposalSchemaType>({
    resolver: zodResolver(ProposalSchema),
    defaultValues: {
      message: "",
      proposedPrice: job?.budget || 0,
      estimatedDuration: DateFormatter.remainingDays(job?.deadline) || 0,
      additionalNote: "",
      media: [],
    },
  });

  // const watchMedia = watch("media");

  // console.log({ errors });
  // console.log("watch files", watch());

  const onSubmit = async (data: ProposalSchemaType) => {
    setSubmitting(true);
    Keyboard.dismiss();
    try {
      // Build FormData for attachments
      const formData = new FormData();
      formData.append("jobId", job._id);
      formData.append("message", data.message);
      formData.append("proposedPrice", String(data.proposedPrice));
      formData.append("estimatedDuration", String(data.estimatedDuration));
      if (data.additionalNote)
        formData.append("additionalNote", data.additionalNote);
      if (Array.isArray(data.media) && data.media.length > 0) {
        data.media.forEach((file: any, idx: number) => {
          formData.append("attachments", {
            uri: file.uri,
            name: file.name || `file-${idx}`,
            type: "image/jpeg",
          } as any);
        });
      }

      // TODO: Replace with real API call when available, e.g., createProposal(formData)
      // console.log("Proposal submit FormData: ", Array.from(formData.entries()));

      await createProposal(job._id, formData);
      setSuccess("Proposal submitted successfully");

      reset();
      onClose();
    } catch (err) {
      console.error("Failed to submit proposal", err);
      setError?.("Failed to submit proposal");
    } finally {
      setSubmitting(false);
      useGlobalStore.setState({ selectedFiles: [] });
    }
  };

  // handle form submission on enter key press
  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  return (
    <Modal
      isOpen={!!job}
      onClose={() => {
        reset();
        onClose();
      }}
      closeOnOverlayClick={false}
    >
      <ModalBackdrop />
      <ModalContent className="flex-1 pt-16 w-full">
        <ModalHeader className="items-center justify-start gap-2">
          <ModalCloseButton className="flex flex-row items-center gap-2">
            <Icon size="xl" as={ChevronLeftIcon} />
            <Heading>Send Proposal</Heading>
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody
          showsVerticalScrollIndicator={false}
          className="mt-8"
          contentContainerClassName="gap-4 p-0"
        >
          <Heading size="xl" className="font-medium">
            {job.title}
          </Heading>
          <Card className="flex-row justify-between items-start">
            <VStack className="items-start">
              <Text className="font-medium">Budget</Text>
              <Heading className="text-typography-700 font-medium">
                {" "}
                {`$${job?.budget || 0}`}
              </Heading>
            </VStack>
            <HStack space="xs" className="items-center">
              <Icon as={MapPinIcon} className="fill-gray-500 stroke-white" />
              <Text className="text-typography-600 font-medium">
                {job.location} (
                {
                  getDistanceWithUnit(
                    job?.coordinates?.[1] ?? 0,
                    job?.coordinates?.[0] ?? 0
                  )?.text
                }{" "}
                away)
              </Text>
            </HStack>
          </Card>
          <Card className="">
            <VStack className="gap-3">
              <FormControl isInvalid={!!errors.message}>
                <FormControlLabel>
                  <FormControlLabelText>Cover Message</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="message"
                  render={({ field: { onChange, value } }) => (
                    <Textarea className="h-28">
                      <TextareaInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="Write a short cover message"
                        multiline
                        numberOfLines={4}
                        className=""
                      />
                    </Textarea>
                  )}
                />
                <FormControlError>
                  <FormControlErrorText>
                    {errors.message?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              <HStack className="gap-4">
                <FormControl
                  isInvalid={!!errors.proposedPrice}
                  className="flex-1"
                >
                  <FormControlLabel>
                    <FormControlLabelText>
                      Proposed Price ($)
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    control={control}
                    name="proposedPrice"
                    render={({ field: { onChange, value } }) => (
                      <Input>
                        <InputField
                          keyboardType="numeric"
                          value={value ? String(value) : ""}
                          onChangeText={(t) =>
                            onChange(Number(t.replace(/[^0-9.]/g, "")))
                          }
                          placeholder="0"
                        />
                      </Input>
                    )}
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {errors.proposedPrice?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>

                <FormControl
                  isInvalid={!!errors.estimatedDuration}
                  className="w-40"
                >
                  <FormControlLabel>
                    <FormControlLabelText>Delivery (days)</FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    control={control}
                    name="estimatedDuration"
                    render={({ field: { onChange, value } }) => (
                      <Input>
                        <InputField
                          keyboardType="numeric"
                          value={value ? String(value) : ""}
                          onChangeText={(t) =>
                            onChange(Number(t.replace(/[^0-9]/g, "")))
                          }
                          placeholder="1"
                        />
                      </Input>
                    )}
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {errors.estimatedDuration?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </HStack>

              <FormControl className="w-full">
                <FormControlLabel>
                  <FormControlLabelText>
                    Additional Note (optional)
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="additionalNote"
                  render={({ field: { onChange, value } }) => (
                    <Input>
                      <InputField
                        value={value}
                        onChangeText={onChange}
                        placeholder="Any extra info for the client"
                      />
                    </Input>
                  )}
                />
              </FormControl>

              <FormControl className="w-full">
                <FormControlLabel>
                  <FormControlLabelText>
                    Attachments (optional)
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="media"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <MediaPicker
                        maxFiles={1}
                        maxSize={200}
                        allowedTypes={["image"]}
                        initialFiles={value || []}
                        onFilesChange={(files: any[]) => onChange(files)}
                      />
                    </>
                  )}
                />
              </FormControl>
            </VStack>
          </Card>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            size="xl"
            className="bg-brand-primary data-[active=true]:bg-brand-primary/80 w-full mx-8 rounded-xl"
            onPress={handleSubmit(onSubmit)}
            isDisabled={submitting}
          >
            <ButtonText>Send Proposal</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateProposal;
