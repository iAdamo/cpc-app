import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { ScrollView, Keyboard } from "react-native";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Icon, ChevronLeftIcon, ChevronDownIcon } from "@/components/ui/icon";
import {
  ProjectFormSchema,
  ProjectFormSchemaType,
} from "@/components/schema/ProjectSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { SpeakerIcon, MegaphoneIcon } from "lucide-react-native";
import { getServicesByProvider, getServiceById } from "@/axios/service";
import EmptyState from "@/components/EmptyState";
import { ServiceData, FileType } from "@/types";
import MediaPicker from "@/components/media/MediaPicker";

const MyServices = ({ providerId }: { providerId?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading } = useGlobalStore();

  // Placeholder for services data
  const [services, setServices] = useState<ServiceData[]>([]);

  useEffect(() => {
    console.log("User ID changed or component mounted, fetching services...");
    const fetchServices = async () => {
      const id = providerId || user?.activeRoleId?._id;

      if (id) {
        try {
          const response = await getServicesByProvider(id);
          if (response.length === 0) {
            setIsModalOpen(true);
            return;
          }
          console.log("Fetched services:", response);
          setServices(response || []);
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      }
    };
    fetchServices();
  }, [providerId, user?.activeRoleId?._id]);

  const isEditable = !providerId;

  return (
    <VStack className="flex-1 bg-white">
      <EmptyState header="" text="" />
      {isEditable && (
        <VStack className="flex-1 bg-white">
          {/* <Button variant="outline" onPress={() => setIsModalOpen(true)}>
            <ButtonText>Add a Project</ButtonText>
          </Button> */}
          <CreateServiceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </VStack>
      )}
    </VStack>
  );
};
export default MyServices;

const CreateServiceModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [service, setService] = useState<ServiceData>();
  const { isLoading, user } = useGlobalStore();

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ProjectFormSchemaType>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      price: 0,
    },
  });

  const onSubmit = async (data: ProjectFormSchemaType) => {
    try {
      console.log("Form data to submit:", data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const inputFieldclass =
    "text-typography-500 font-semibold border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50";

  return (
    <Modal
      isOpen={!!isOpen}
      onClose={() => {
        onClose();
      }}
      closeOnOverlayClick={false}
    >
      <ModalBackdrop />
      <ModalContent className="flex-1 pt-16 w-full bg-white">
        <ModalHeader className="items-center justify-start gap-2">
          <ModalCloseButton className="flex flex-row items-center gap-2">
            <Icon size="xl" as={ChevronLeftIcon} />
            <Heading>New Service Project</Heading>
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody className=" mt-8" showsVerticalScrollIndicator={false}>
          <Heading size="xl" className="text-brand-primary">
            Add a new Service project
          </Heading>
          <VStack className="mt-4 gap-4 items-center justify-center">
            <FormControl className="w-full" isInvalid={!!errors.title}>
              <FormControlLabel>
                <FormControlLabelText className="text-brand-primary/50">
                  Project Title
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="h-14 border-0">
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      placeholder="Enter a brief but descriptive title"
                      autoCapitalize="words"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className={inputFieldclass}
                      maxLength={80}
                    />
                  )}
                />
              </Input>
              <FormControlError className="">
                <FormControlErrorText>
                  {errors.title && errors.title.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl className="w-full" isInvalid={!!errors.description}>
              <FormControlLabel>
                <FormControlLabelText className="text-brand-primary/50">
                  Description
                </FormControlLabelText>
              </FormControlLabel>
              <Textarea className="h-28 border-0">
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextareaInput
                      placeholder="Briefly describe the project's goals, your solution and the impact you made"
                      autoCapitalize="sentences"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className={inputFieldclass}
                      maxLength={300}
                      multiline
                      numberOfLines={4}
                    />
                  )}
                />
              </Textarea>
              <FormControlError className="">
                <FormControlErrorText>
                  {errors.description && errors.description.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl className="w-full" isInvalid={!!errors.category}>
              <FormControlLabel>
                <FormControlLabelText className="text-brand-primary/50">
                  Category
                </FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue=""
                onValueChange={(value) => {}}
                className="flex-1 border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50"
              >
                <SelectTrigger
                  variant="outline"
                  className="h-14 justify-between border-0"
                >
                  <SelectInput
                    className="font-semibold text-typography-500"
                    placeholder="Project Category"
                  />
                  <SelectIcon className="mr-3" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal className="">
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {user?.activeRoleId?.subcategories?.map((category, idx) => (
                      <SelectItem
                        key={idx}
                        label={category.name}
                        value={category._id}
                        className="font-semibold text-typography-500 h-28"
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
              {errors.category && (
                <FormControlError>
                  <FormControlErrorText>
                    {errors.category.message}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
            <FormControl className="w-full" isInvalid={!!errors.location}>
              <FormControlLabel>
                <FormControlLabelText className="text-brand-primary/50">
                  Location
                </FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue=""
                onValueChange={(value) => {}}
                className="flex-1 border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50"
              >
                <SelectTrigger
                  variant="outline"
                  className="h-14 justify-between border-0"
                >
                  <SelectInput
                    className="font-semibold text-typography-500"
                    placeholder="Project Location"
                  />
                  <SelectIcon className="mr-3" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal className="">
                  <SelectBackdrop />

                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {(["primary", "secondary", "tertiary"] as const).map(
                      (level) => {
                        type Level = "primary" | "secondary" | "tertiary";
                        const location = user?.activeRoleId?.location as
                          | Record<Level, { address?: { address?: string } }>
                          | undefined;
                        const addrObj = location?.[level]?.address;
                        if (addrObj && addrObj.address) {
                          return (
                            <SelectItem
                              key={level}
                              label={addrObj.address}
                              value={addrObj.address}
                              className="font-semibold text-typography-500 h-28"
                            />
                          );
                        }
                        return null;
                      }
                    )}
                  </SelectContent>
                </SelectPortal>
              </Select>
              {errors.location && (
                <FormControlError>
                  <FormControlErrorText>
                    {errors.location.message}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
            {/* Price Input */}
            <FormControl className="w-full" isInvalid={!!errors.price}>
              <FormControlLabel>
                <FormControlLabelText className="text-brand-primary/50">
                  Price ($)
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="h-14 border-0">
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                      placeholder="Enter your project price"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        // Remove any non-numeric characters except for the decimal point
                        const numericValue = text.replace(/[^0-9.]/g, "");
                        onChange(numericValue);
                      }}
                      value={value ? String(value) : ""}
                      className={inputFieldclass}
                      maxLength={7} // e.g., 99999.99
                    />
                  )}
                />
              </Input>
              <FormControlError className="">
                <FormControlErrorText>
                  {errors.price && errors.price.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            {/* Media Pickers */}
            <VStack className="flex-1 w-full">
              <MediaPicker
                maxFiles={6}
                maxSize={10}
                allowedTypes={["image", "video"]}
                // initialFiles={value}
                onFilesChange={(files: FileType[]) => {
                  // onChange(files);
                  console.log("Selected video files:", files);
                }}
                classname="h-52"
              />
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <VStack className="gap-2 w-full mt-4">
            <Button
              size="xl"
              isDisabled={isLoading}
              className="w-full bg-brand-primary"
              onPress={handleSubmit(onSubmit)}
            >
              <ButtonText>
                {isLoading ? <Spinner /> : "Save & Continue"}
              </ButtonText>
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
