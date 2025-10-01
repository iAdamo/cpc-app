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
import {
  Icon,
  ChevronLeftIcon,
  ChevronDownIcon,
  AddIcon,
  TrashIcon,
} from "@/components/ui/icon";
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
  deleteService,
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
  const [activeTab, setActiveTab] = useState<"published" | "drafts">(
    "published"
  );
  const { user, updateService, draftProjects, setDraftProjects } =
    useGlobalStore();

  const [services, setServices] = useState<ServiceData[]>([]);
  const [draftServices, setDraftServices] = useState<ServiceData[]>([]);

  // Filter services based on active tab
  const filteredServices =
    activeTab === "published"
      ? services.filter((service) => service.isActive)
      : draftServices.filter((service) => !service.isActive);

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

          // Separate published and draft services
          const published = response.filter((service) => service.isActive);
          const drafts = response.filter((service) => !service.isActive);

          setServices(published);
          setDraftServices([...(drafts || []), ...draftProjects]); // Include draftProjects from store
          setLoading(false);
        } catch (error) {
          console.error("Error fetching services:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchServices();
  }, [providerId, user?.activeRoleId?._id, draftProjects]);

  const isEditable = !providerId;

  const handleToggleActive = async (service: ServiceData) => {
    const formData = new FormData();
    formData.append("isActive", (!service.isActive).toString());
    try {
      await updateService(service._id, formData);

      // Update both services and draftServices arrays
      if (service.isActive) {
        // Moving from published to drafts
        setServices((prev) => prev.filter((s) => s._id !== service._id));
        setDraftServices((prev) => [...prev, { ...service, isActive: false }]);
      } else {
        // Moving from drafts to published
        setDraftServices((prev) => prev.filter((s) => s._id !== service._id));
        setServices((prev) => [...prev, { ...service, isActive: true }]);
      }
    } catch (error) {
      console.error("Failed to toggle service active status:", error);
    }
  };

  const handleAddNewProject = () => {
    setShowPreview(undefined);
    setIsModalOpen(true);
  };

  // When deleting a draft project
  const handleDeleteProject = async (project: ServiceData) => {
    if (project._id.startsWith("draft-")) {
      useGlobalStore.setState((state) => ({
        draftProjects: state.draftProjects.filter((p) => p._id !== project._id),
      }));
      return;
    }
    await deleteService(project._id);
    setServices((prev) => prev.filter((p) => p._id !== project._id));
    useGlobalStore.setState((state) => ({
      draftProjects: state.draftProjects.filter((p) => p._id !== project._id),
    }));
  };

  const handleTabPress = (tab: "published" | "drafts") => {
    setActiveTab(tab);
  };

  const handleServicePress = (service: ServiceData) => {
    setIsModalOpen(true);
    setShowPreview(service);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setShowPreview(undefined);
    Keyboard.dismiss();
  };

  const renderTabButton = (tab: "published" | "drafts", count: number) => {
    const isActive = activeTab === tab;
    const label = tab === "published" ? "Published" : "Drafts";

    return (
      <Button
        size="sm"
        variant="outline"
        className={`border-0 ${
          isActive ? "bg-brand-primary" : "bg-transparent"
        }`}
        onPress={() => handleTabPress(tab)}
      >
        <ButtonText className="text-brand-secondary">
          {label} ({count})
        </ButtonText>
      </Button>
    );
  };

  const renderServiceCard = (service: ServiceData) => {
    return (
      <Card key={service._id} className="relative p-0 mx-4 mb-4">
        <Image
          source={{
            uri:
              Array.isArray(service.media) && service.media.length > 0
                ? (() => {
                    const found = service.media.find(
                      (mediaItem: string | FileType) =>
                        typeof mediaItem === "string"
                          ? !(
                              mediaItem.endsWith(".mp4") ||
                              mediaItem.endsWith(".mov")
                            )
                          : mediaItem.type !== "video"
                    );
                    if (!found)
                      return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
                    if (typeof found === "string") return found;
                    // found is FileType
                    return (found as FileType).uri;
                  })()
                : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
          }}
          className="w-full h-52 rounded-lg object-cover"
          alt={service.title}
        />
        <VStack className="absolute inset-0 p-4 justify-between">
          <VStack className="flex-1 justify-start">
            {!providerId && (
              <HStack className="items-center justify-between">
                <Button
                  className="p-2  bg-white/40 h-8 w-8 rounded-full"
                  onPress={() => handleDeleteProject(service)}
                >
                  <ButtonIcon as={TrashIcon} className="text-red-600" />
                </Button>
                <Switch
                  size="md"
                  value={service.isActive}
                  onToggle={() => handleToggleActive(service)}
                />
              </HStack>
            )}
          </VStack>
          <Pressable
            onPress={() => handleServicePress(service)}
            className="flex-1 justify-end"
          >
            <VStack className="justify-end">
              <HStack className="gap-4 items-center">
                <VStack className="flex-1">
                  <Heading size="md" className="text-white line-clamp-1">
                    {service?.title}
                  </Heading>
                  <Text className="text-white line-clamp-1">
                    {service?.location}
                  </Text>
                  <HStack space="sm" className="items-center mt-2">
                    <Avatar size="xs">
                      <AvatarFallbackText>
                        {service?.providerId?.providerName}
                      </AvatarFallbackText>
                      <AvatarImage
                        source={
                          typeof service?.providerId?.providerLogo === "string"
                            ? { uri: service?.providerId?.providerLogo }
                            : undefined
                        }
                      />
                    </Avatar>
                    <Text className="text-white">
                      {service?.providerId?.providerName}
                    </Text>
                    {service?.providerId?.isVerified && (
                      <Badge action="success">
                        <BadgeText>Verified</BadgeText>
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
          </Pressable>
        </VStack>
      </Card>
    );
  };

  return (
    <VStack className="flex-1 bg-white">
      {isEditable && (
        <HStack className="items-center justify-between px-4 pt-4">
          {renderTabButton("published", services.length)}
          {renderTabButton("drafts", draftServices.length)}
          <Button
            size="sm"
            variant="outline"
            className="border-0"
            onPress={handleAddNewProject}
          >
            <ButtonIcon as={AddIcon} className="text-brand-secondary" />
            <ButtonText className="text-brand-secondary">
              Add New Project
            </ButtonText>
          </Button>
        </HStack>
      )}

      <VStack className="flex-1 pt-4">
        {loading ? (
          <Spinner className="mt-8" />
        ) : filteredServices.length === 0 ? (
          <EmptyState
            header={`No ${
              activeTab === "published" ? "Published" : "Draft"
            } Services`}
            text={
              activeTab === "published"
                ? "You have no published service projects. Switch to drafts or create a new project."
                : "You have no draft service projects. Switch to published or create a new project."
            }
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <VStack className="gap-4">
              {filteredServices.map(renderServiceCard)}
            </VStack>
          </ScrollView>
        )}

        {isModalOpen && (
          <CreateServiceModal
            isOpen={isModalOpen || !!showPreview}
            onClose={handleModalClose}
            isEditable={
              isEditable &&
              (showPreview?._id.startsWith("draft-") || !showPreview)
            }
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
  const { isLoading, user, setSuccess, setDraftProjects, selectedFiles } =
    useGlobalStore();

    console.log("project", project);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<ProjectFormSchemaType>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      subcategoryId: project?.subcategoryId?._id || "",
      location: project?.location || "",
      maxPrice: project?.maxPrice || 0,
      minPrice: project?.minPrice || 0,
      duration: project?.duration || 0,
      media: Array.isArray(project?.media)
        ? project?.media.map(
            (img, index) =>
              typeof img === "string"
                ? {
                    uri: img,
                    name: img.split("/").pop() || `image-${index}.jpg`,
                    type:
                      img.endsWith(".mp4") || img.endsWith(".mov")
                        ? "video/mp4"
                        : "image/jpeg",
                  }
                : img // already a FileType object
          )
        : [],
    },
  });

  const handleSaveDraft = async () => {
    if (!isDirty) return; // No changes to save
    try {
      const currentValues = getValues();

      // Create draft object
      const draftData = {
        ...currentValues,
        _id: project?._id || `draft-${Date.now()}`,
        isActive: false, // Drafts are inactive by default
        createdAt: project?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to zustand store
      setDraftProjects([draftData] as any);
      setSuccess("Project saved to drafts");
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const onSubmit = async (data: ProjectFormSchemaType) => {
    try {
      setLoading(true);
      const formdata = new FormData();
      appendFormData(formdata, data);

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

  const handleClose = () => {
    // Check if there are unsaved changes
    if (isDirty && isEditable) {
      // You could show a confirmation dialog here
      console.log("Unsaved changes detected");
    }
    handleSaveDraft();
    useGlobalStore.setState({ selectedFiles: [] });
    onClose();
    reset();
  };

  const inputFieldclass =
    "text-typography-500 font-semibold border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50";

  const renderFormField = () => (
    <VStack className="mt-4 gap-4 items-center justify-center">
      {/* Title */}
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
          <FormControlErrorText>{errors.title?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      {/* Description */}
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
            {errors.description?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      {/* Category */}
      <FormControl className="w-full" isInvalid={!!errors.subcategoryId}>
        <FormControlLabel>
          <FormControlLabelText className="text-brand-primary/50">
            Category
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          onValueChange={(value) => {
            setValue("subcategoryId", value);
            setCategoryName(value);
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
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {/* {user?.activeRoleId?.subcategories?.map((subcategoryId, idx) => (
                <SelectItem
                  key={idx}
                  label={subcategoryId.name}
                  value={subcategoryId._id}
                  className="font-semibold text-typography-500 h-28"
                />
              ))} */}
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

      {/* Location */}
      <FormControl className="w-full" isInvalid={!!errors.location}>
        <FormControlLabel>
          <FormControlLabelText className="text-brand-primary/50">
            Location
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          onValueChange={(value) => setValue("location", value)}
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
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {(["primary", "secondary", "tertiary"] as const).map((level) => {
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
              })}
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

      {/* Price Range */}
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
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    onChange(Number(numericValue));
                  }}
                  value={value ? String(value) : ""}
                  className={inputFieldclass}
                  maxLength={7}
                />
              )}
            />
          </Input>
          <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
            <FormControlErrorText>
              {errors.minPrice?.message}
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
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    onChange(Number(numericValue));
                  }}
                  value={value ? String(value) : ""}
                  className={inputFieldclass}
                  maxLength={7}
                />
              )}
            />
          </Input>
          <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
            <FormControlErrorText>
              {errors.maxPrice?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </HStack>

      {/* Duration */}
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
                  const numericValue = text.replace(/[^0-9]/g, "");
                  onChange(Number(numericValue));
                }}
                value={value ? String(value) : ""}
                className={inputFieldclass}
                maxLength={3}
              />
            )}
          />
        </Input>
        <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
          <FormControlErrorText>
            {errors.duration?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      {/* Media Picker */}
      <FormControl className="w-full" isInvalid={!!errors.media}>
        <MediaPicker
          maxFiles={6}
          maxSize={100}
          allowedTypes={["image", "video"]}
          initialFiles={
            (watch("media") || []).map((file) => ({
              ...file,
              type:
                file.type === "image" || file.type === "video"
                  ? file.type
                  : file.type?.includes("video")
                  ? "video"
                  : file.type?.includes("image")
                  ? "image"
                  : undefined,
            }))
          }
          onFilesChange={(files: FileType[]) => {
            setValue("media", files);
          }}
          classname="h-52"
        />
        <FormControlError className="bg-red-500/20 px-4 py-2 rounded-lg">
          <FormControlErrorText>{errors.media?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    </VStack>
  );

  const renderPreview = () => (
    <VStack className="mt-4 gap-4">
      {/* <Text className="text-typography-700 mx-4 font-medium">
        {categoryName ||
          `${project?.subcategoryId.categoryId.name} | ${project?.subcategoryId.name}`}
      </Text> */}

      <Card variant="filled" className="mx-4">
        <Heading size="md" className="text-typography-600 mb-2">
          Project Description
        </Heading>
        <Text className="text-typography-600">
          {getValues("description") || project?.description}
        </Text>
      </Card>

      <Card variant="filled" className="mx-4">
        <Heading size="md" className="text-typography-600 mb-2">
          Location
        </Heading>
        <Text className="text-typography-700">
          {getValues("location") || project?.location}
        </Text>
      </Card>

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

      <Card variant="filled" className="mx-4">
        <Heading size="md" className="text-typography-600 mb-2">
          Estimated Duration
        </Heading>
        <Text className="text-typography-700">
          {getValues("duration") || project?.duration} days
        </Text>
      </Card>

      {project?.media &&
        project.media.length > 0 &&
        project.media.map((mediaUrl, index) =>
          mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".mov") ? (
            <VideoPlayer key={index} uri={mediaUrl} />
          ) : (
            <Image
              key={index}
              source={{ uri: mediaUrl }}
              className="w-full h-80 object-cover -px-4"
              alt={`Project media ${index + 1}`}
            />
          )
        )}
    </VStack>
  );

  const renderFormFooter = () => {
    if (!isEditable) return null;

    if (!previewMode) {
      return (
        <ModalFooter className="mt-0 flex-col">
          <HStack className="w-full gap-3">
            {/* <Button
              size="xl"
              variant="outline"
              className="flex-1"
              onPress={handleSaveDraft}
            >
              <ButtonText className="text-gray-500">Save as Draft</ButtonText>
            </Button> */}
            {isValid && (
              <Button
                size="xl"
                variant="outline"
                className="flex-1"
                onPress={handleSubmit(() => setPreviewMode(true))}
                isDisabled={!isValid}
              >
                <ButtonText className="text-brand-primary">Preview</ButtonText>
              </Button>
            )}
          </HStack>
          <Button
            size="xl"
            isDisabled={isLoading || loading}
            className="w-full bg-brand-primary"
            onPress={handleSubmit(onSubmit)}
          >
            <ButtonText>
              {isLoading || loading ? <Spinner /> : "Save & Publish Project"}
            </ButtonText>
          </Button>
        </ModalFooter>
      );
    }

    return (
      <ModalFooter className="mt-0 flex-col">
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
    );
  };

  return (
    <Modal isOpen={!!isOpen} onClose={handleClose} closeOnOverlayClick={false}>
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

          {!previewMode ? renderFormField() : renderPreview()}
        </ModalBody>

        {renderFormFooter()}
      </ModalContent>
    </Modal>
  );
};
