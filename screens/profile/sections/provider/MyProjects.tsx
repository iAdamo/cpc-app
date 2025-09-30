import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Pressable } from "@/components/ui/pressable";
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
import {
  SpeakerIcon,
  MegaphoneIcon,
  ArrowUpRightIcon,
} from "lucide-react-native";
import {
  getServicesByProvider,
  getServiceById,
  createService,
} from "@/axios/service";
import EmptyState from "@/components/EmptyState";
import { ServiceData, FileType } from "@/types";
import MediaPicker from "@/components/media/MediaPicker";
import appendFormData from "@/utils/AppendFormData";
import { Image } from "@/components/ui/image";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import VideoPlayer from "@/components/media/VideoPlayer";
import { Badge, BadgeText } from "@/components/ui/badge";

export const MyServices = ({ providerId }: { providerId?: string }) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState<ServiceData | undefined>();
  const { user, updateService } = useGlobalStore();

  // Placeholder for services data
  const [services, setServices] = useState<ServiceData[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const id = providerId || user?.activeRoleId?._id;

      if (id) {
        try {
          const response = await getServicesByProvider(id);
          if (response.length === 0) {
            setLoading(false);
            setIsModalOpen(true);
            return;
          }
          // console.log("Fetched services:", response);
          setServices(response || []);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching services:", error);
          setLoading(false);
        }
      }
    };
    fetchServices();
  }, [providerId, user?.activeRoleId?._id, setIsModalOpen]);

  const isEditable = !providerId;

  const handleToggleActive = async (service: ServiceData) => {
    const formData = new FormData();
    formData.append("isActive", (!service.isActive).toString());
    try {
      await updateService(service._id, formData);
      // Optimistically update UI
      setServices((prevServices) =>
        prevServices.map((s) =>
          s._id === service._id ? { ...s, isActive: !s.isActive } : s
        )
      );
    } catch (error) {
      console.error("Failed to toggle service active status:", error);
    }
  };
  return (
    <VStack className="flex-1 bg-white">
      <HStack className="items-center justify-between px-4 pt-4">
        {isEditable && (
          <Button
            className="bg-brand-primary border-2 border-brand-primary shadow-lg"
            onPress={() => {
              setIsModalOpen(true), setShowPreview(undefined);
            }}
          >
            {/* <ButtonIcon
              as={SpeakerIcon}
              size="lg"
              className=""
            /> */}
            <ButtonText className="">Add New Project</ButtonText>
          </Button>
        )}
      </HStack>
      <VStack className="flex-1 pt-4">
        {loading ? (
          <Spinner className="mt-8" />
        ) : services.length === 0 ? (
          <EmptyState
            header="No Service Projects"
            text="You have not added any service projects yet. Click the button above to add your first project."
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <VStack className="gap-4">
              {services.map((service) => (
                <Card key={service._id} className="relative p-0 mx-4 mb-4">
                  {/** background image with title and location at its bottom */}
                  <Image
                    source={{ uri: service.media[1] }}
                    className="w-full h-52 rounded-lg object-cover"
                    alt={service.title}
                  />
                  <VStack className="absolute inset-0 p-4 justify-between">
                    <VStack className="items-end">
                      {!providerId && (
                        <Switch
                          size="md"
                          value={service.isActive}
                          onToggle={() => handleToggleActive(service)}
                        />
                      )}
                    </VStack>
                    <Pressable
                      onPress={() => {
                        setIsModalOpen(true);
                        setShowPreview(service);
                      }}
                      className="flex-1 justify-end"
                    >
                      <VStack className="justify-end">
                        <HStack className="gap-4 items-center">
                          <VStack className="flex-1">
                            <Heading
                              size="md"
                              className="text-white line-clamp-1"
                            >
                              {service.title}
                            </Heading>
                            <Text className="text-white line-clamp-1">
                              {service.location}
                            </Text>
                            <HStack space="sm" className="items-center mt-2">
                              <Avatar size="xs">
                                <AvatarFallbackText>
                                  {service.providerId.providerName}
                                </AvatarFallbackText>
                                <AvatarImage
                                  source={
                                    typeof service.providerId.providerLogo ===
                                    "string"
                                      ? { uri: service.providerId.providerLogo }
                                      : undefined
                                  }
                                />
                              </Avatar>
                              <Text className="text-white">
                                {service.providerId.providerName}
                              </Text>
                              <Badge
                                action={
                                  service.providerId.isVerified ? "success" : ""
                                }
                                className=""
                              >
                                <BadgeText>
                                  {service.providerId.isVerified
                                    ? "Verified"
                                    : ""}
                                </BadgeText>
                              </Badge>
                            </HStack>
                          </VStack>
                          {/* <Button
                            variant="outline"
                            className="ml-auto bg-brand-secondary border-0 p-3"
                            onPress={() => {
                              setShowPreview(service);
                            }}
                          >
                            <ButtonIcon
                              as={ArrowUpRightIcon}
                              className="text-white"
                            />
                          </Button> */}
                        </HStack>
                      </VStack>
                    </Pressable>
                  </VStack>
                </Card>
              ))}
            </VStack>
          </ScrollView>
        )}
        {isModalOpen && (
          <CreateServiceModal
            isOpen={isModalOpen || !!showPreview}
            onClose={() => {
              setIsModalOpen(false);
              setShowPreview(undefined);
              Keyboard.dismiss();
            }}
            isEditable={isEditable && !showPreview}
            project={showPreview}
          />
        )}
      </VStack>
    </VStack>
  );
};
export default MyServices;

export const CreateServiceModal = ({
  isOpen,
  onClose,
  isEditable,
  project,
}: {
  isOpen: boolean;
  onClose: () => void;
  isEditable?: boolean;
  project?: ServiceData;
}) => {
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState<string>("");
  const [previewMode, setPreviewMode] = useState(!isEditable);
  const { isLoading, user, setSuccess } = useGlobalStore();

  console.log(isEditable, previewMode);
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ProjectFormSchemaType>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subcategoryId: "",
      location: "",
      maxPrice: 0,
      minPrice: 0,
      media: [],
    },
  });

  // console.log("Form errors:", errors);

  const onSubmit = async (data: ProjectFormSchemaType) => {
    try {
      setLoading(true);
      const formdata = new FormData();
      appendFormData(formdata, data);
      // console.log("Form data to submit:", Array.from(formdata.entries()));

      await createService(formdata);
      setLoading(false);
      onClose();
      reset();
      setSuccess("Service project created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
    }
  };

  const inputFieldclass =
    "text-typography-500 font-semibold border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50";

  return (
    <Modal
      isOpen={!!isOpen}
      onClose={() => {
        onClose();
        // setPreviewMode(!isEditable);
        reset();
      }}
      closeOnOverlayClick={false}
    >
      <ModalBackdrop />
      <ModalContent
        className={`flex-1 pt-16 w-full bg-white ${
          !previewMode ? "px-4" : "px-0"
        }`}
      >
        <ModalHeader className="items-center justify-start gap-2">
          <ModalCloseButton
            className={`flex flex-row items-center gap-2 ${
              !isEditable && "px-4"
            }`}
          >
            <Icon size="xl" as={ChevronLeftIcon} />
            <Heading size="lg" className="text-brand-primary">
              {!previewMode ? "New Service Project" : "Project Preview"}
            </Heading>
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody className="mt-8" showsVerticalScrollIndicator={false}>
          <Heading
            size="xl"
            className={`text-brand-primary ${!previewMode ? "" : "mx-4"}`}
          >
            {!previewMode
              ? "Add a new Service project"
              : getValues("title") || project?.title}
          </Heading>
          <VStack
            className={`mt-4 gap-4 ${
              !previewMode ? "items-center justify-center" : ""
            }`}
          >
            {!previewMode ? (
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
                <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
                  <FormControlErrorText>
                    {errors.title && errors.title.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            ) : (
              <Text className="text-typography-700 mx-4 font-medium">
                {categoryName ||
                  `${project?.subcategoryId.categoryId.name} | ${project?.subcategoryId.name}`}
              </Text>
            )}
            {!previewMode ? (
              <FormControl className="w-full" isInvalid={!!errors.description}>
                <FormControlLabel>
                  <FormControlLabelText className="text-brand-primary/50">
                    Description
                  </FormControlLabelText>
                </FormControlLabel>
                <Textarea className="h-36 border-0">
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
                        numberOfLines={7}
                      />
                    )}
                  />
                </Textarea>
                <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
                  <FormControlErrorText>
                    {errors.description && errors.description.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            ) : (
              <Card variant="filled" className="mx-4">
                <Heading size="md" className="text-typography-600 mb-2">
                  Project Description
                </Heading>
                <Text className="text-typography-600">
                  {getValues("description") || project?.description}
                </Text>
              </Card>
            )}
            {!previewMode && (
              <FormControl
                className="w-full"
                isInvalid={!!errors.subcategoryId}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-brand-primary/50">
                    Category
                  </FormControlLabelText>
                </FormControlLabel>
                <Select
                  // selectedValue={getValues("subcategoryId")}
                  onValueChange={(value) => {
                    setValue("subcategoryId", value), setCategoryName(value);
                  }}
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
                      {user?.activeRoleId?.subcategories?.map(
                        (subcategoryId, idx) => (
                          <SelectItem
                            key={idx}
                            label={subcategoryId.name}
                            value={subcategoryId._id}
                            className="font-semibold text-typography-500 h-28"
                          />
                        )
                      )}
                    </SelectContent>
                  </SelectPortal>
                </Select>
                {errors.subcategoryId && (
                  <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
                    <FormControlErrorText>
                      {errors.subcategoryId.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            )}
            {!previewMode ? (
              <FormControl className="w-full" isInvalid={!!errors.location}>
                <FormControlLabel>
                  <FormControlLabelText className="text-brand-primary/50">
                    Location
                  </FormControlLabelText>
                </FormControlLabel>
                <Select
                  selectedValue={getValues("location")}
                  onValueChange={(value) => {
                    setValue("location", value);
                  }}
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
                  <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
                    <FormControlErrorText>
                      {errors.location.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            ) : (
              <Card variant="filled" className="mx-4">
                <Heading size="md" className="text-typography-600 mb-2">
                  Location
                </Heading>
                <Text className="text-typography-700">
                  {getValues("location") || project?.location}
                </Text>
              </Card>
            )}
            {/* Estimated Price Input */}
            {!previewMode ? (
              <HStack className="flex-1 gap-4">
                <FormControl className="flex-1" isInvalid={!!errors.minPrice}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-brand-primary/50">
                      Minimum Price ($)
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-14 border-0">
                    <Controller
                      control={control}
                      name="minPrice"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <InputField
                          placeholder="Est. minimum price"
                          keyboardType="numeric"
                          onBlur={onBlur}
                          onChangeText={(text) => {
                            // Remove any non-numeric characters except for the decimal point
                            const numericValue = text.replace(/[^0-9.]/g, "");
                            const value = Number(numericValue);
                            onChange(value);
                          }}
                          value={value ? String(value) : ""}
                          className={inputFieldclass}
                          maxLength={7} // e.g., 99999.99
                        />
                      )}
                    />
                  </Input>
                  <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
                    <FormControlErrorText>
                      {errors.minPrice && errors.minPrice.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl className="flex-1" isInvalid={!!errors.maxPrice}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-brand-primary/50">
                      Maximum Price ($)
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-14 border-0">
                    <Controller
                      control={control}
                      name="maxPrice"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <InputField
                          placeholder="Est. maximum price"
                          keyboardType="numeric"
                          onBlur={onBlur}
                          onChangeText={(text) => {
                            // Remove any non-numeric characters except for the decimal point
                            const numericValue = text.replace(/[^0-9.]/g, "");
                            const value = Number(numericValue);
                            onChange(value);
                          }}
                          value={value ? String(value) : ""}
                          className={inputFieldclass}
                          maxLength={7} // e.g., 99999.99
                        />
                      )}
                    />
                  </Input>
                  <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
                    <FormControlErrorText>
                      {errors.maxPrice && errors.maxPrice.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </HStack>
            ) : (
              <Card variant="filled" className="mx-4">
                <Heading size="md" className="text-typography-600 mb-2">
                  Price Range
                </Heading>
                <Text className="text-typography-700">
                  {getValues("minPrice") && getValues("maxPrice")
                    ? `$${getValues("minPrice")} - $${getValues("maxPrice")}`
                    : project
                    ? `$${project.minPrice} - $${project.maxPrice}`
                    : ""}
                </Text>
              </Card>
            )}
            {!previewMode ? (
              <FormControl className="w-full" isInvalid={!!errors.duration}>
                <FormControlLabel>
                  <FormControlLabelText className="text-brand-primary/50">
                    Estimated Project Duration (in days)
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="h-14 border-0">
                  <Controller
                    control={control}
                    name="duration"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <InputField
                        placeholder="Enter estimated project duration"
                        keyboardType="numeric"
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          // Remove any non-numeric characters except for the decimal point
                          const numericValue = text.replace(/[^0-9]/g, "");
                          const value = Number(numericValue);
                          onChange(value);
                        }}
                        value={value ? String(value) : ""}
                        className={inputFieldclass}
                        maxLength={3} // e.g., 365
                      />
                    )}
                  />
                </Input>
                <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
                  <FormControlErrorText>
                    {errors.duration && errors.duration.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            ) : (
              <Card variant="filled" className="mx-4">
                <Heading size="md" className="text-typography-600 mb-2">
                  Estimated Duration
                </Heading>
                <Text className="text-typography-700">
                  {getValues("duration") || project?.duration} days
                </Text>
              </Card>
            )}
            {/* Media Pickers */}
            {!previewMode ? (
              <FormControl className="w-full" isInvalid={!!errors.media}>
                <MediaPicker
                  maxFiles={6}
                  maxSize={100}
                  allowedTypes={["image", "video"]}
                  // initialFiles={value}
                  onFilesChange={(files: FileType[]) => {
                    setValue("media", files);
                  }}
                  classname="h-52"
                />
                <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
                  <FormControlErrorText>
                    {errors.media && errors.media.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            ) : (
              project?.media &&
              project.media.length > 0 &&
              project.media.map((mediaUrl, index) =>
                mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".mov") ? (
                  <VideoPlayer key={index} uri={mediaUrl} />
                ) : (
                  <Image
                    key={index}
                    source={{ uri: mediaUrl }}
                    className="w-full h-80 rounded-lg object-cover -px-4"
                    alt={`Project media ${index + 1}`}
                  />
                )
              )
            )}
          </VStack>
        </ModalBody>
        {isEditable &&
          // Add New: show footer only if form is valid and not in preview
          (!previewMode && isValid ? (
            <ModalFooter className={`mt-0 flex-col ${!isEditable && "px-4"}`}>
              <Button
                size="xl"
                variant="outline"
                onPress={handleSubmit(() => setPreviewMode(true))}
                className="w-full"
              >
                <ButtonText className="text-gray-500">Preview</ButtonText>
              </Button>
              <Button
                size="xl"
                isDisabled={!isValid || isLoading || loading}
                className="w-full bg-brand-primary"
                onPress={handleSubmit(onSubmit)}
              >
                <ButtonText>
                  {isLoading || loading ? (
                    <Spinner />
                  ) : (
                    "Save & Publish Project"
                  )}
                </ButtonText>
              </Button>
            </ModalFooter>
          ) : null)}
        {isEditable && previewMode && (
          // Edit Preview: show footer with "Back to Edit" and "Save & Publish"
          <ModalFooter className={`mt-0 flex-col ${!isEditable && "px-4"}`}>
            <Button
              size="xl"
              variant="outline"
              onPress={() => setPreviewMode(false)}
              className="w-full"
            >
              <ButtonText className="text-gray-500">Back to Edit</ButtonText>
            </Button>
            <Button
              size="xl"
              isDisabled={!isValid || isLoading || loading}
              className="w-full bg-brand-primary"
              onPress={handleSubmit(onSubmit)}
            >
              <ButtonText>
                {isLoading || loading ? <Spinner /> : "Save & Publish Project"}
              </ButtonText>
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
