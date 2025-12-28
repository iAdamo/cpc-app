import { useState, useEffect, use } from "react";
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
import {
  Button,
  ButtonIcon,
  ButtonText,
  ButtonSpinner,
} from "@/components/ui/button";
import {
  Icon,
  ChevronLeftIcon,
  ChevronDownIcon,
  AddIcon,
  TrashIcon,
} from "@/components/ui/icon";
import {
  JobFormSchema,
  JobFormSchemaType,
} from "@/components/schema/JobSchema";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AccordionHeader,
} from "@/components/ui/accordion";
import useGlobalStore from "@/store/globalStore";
import {
  getJobsByUser,
  createJob,
  deleteJob,
  updateJob,
  getAllCategoriesWithSubcategories,
  getProposalsByJob,
  updateProposal,
} from "@/services/axios/service";
import EmptyState from "@/components/EmptyState";
import { JobData, FileType, MediaItem, ProposalData } from "@/types";
import MediaPicker from "@/components/media/MediaPicker";
import appendFormData from "@/utils/AppendFormData";
import { Image } from "expo-image";
import ProfileVatar from "@/components/ProfileAvatar";
import MediaView from "@/components/media/MediaView";
import { MapPinCheckIcon } from "lucide-react-native";
import { locationService } from "@/utils/GetDistance";
import { MapPinIcon } from "lucide-react-native";
import DateFormatter from "@/utils/DateFormat";
import RatingSection from "@/components/RatingFunction";
import { router } from "expo-router";

export const PostJob = ({ userId }: { userId?: string }) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState<JobData | undefined>();
  const [activeTab, setActiveTab] = useState<"published" | "drafts">(
    "published"
  );
  const { user, setDraftJobs, draftJobs, removeDraftJob } = useGlobalStore();

  const [jobs, setJobs] = useState<JobData[]>([]);

  useEffect(() => {
    const fetchjobs = async () => {
      setLoading(true);
      const id = userId || user?._id;

      if (id) {
        try {
          const response = await getJobsByUser();
          // Separate published and draft jobs
          const published = response.filter((job) => job.isActive);
          const drafts = response.filter((job) => !job.isActive);

          setJobs(published);
          // append to draft using setDraftJobs (deduplicates)

          // // append to draft
          // useGlobalStore.setState((state) => ({
          //   draftJobs: [...state.draftJobs, ...drafts],
          // }));

          setDraftJobs([...drafts]);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching jobs:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchjobs();
  }, [userId, user?._id]);

  // Filter jobs based on active tab
  const filteredjobs =
    activeTab === "published"
      ? jobs.filter((job) => job.isActive)
      : draftJobs.filter((job) => !job.isActive);

  const isEditable = !userId;

  const handleToggleActive = async (job: JobData) => {
    const formData = new FormData();
    formData.append("isActive", (!job.isActive).toString());
    try {
      // console.log(Array.from(formData.entries()));
      const response = await updateJob(job._id, formData);
      // Update both jobs and draftjobs arrays
      if (!response.isActive) {
        // Moving from published to drafts
        setJobs((prev) => prev.filter((s) => s._id !== job._id));
        // use setDraftJobs to merge and deduplicate. Use the server response
        // so we include any fields the server returns (category/subcategory)
        // and ensure the draft entry has the latest data.
        setDraftJobs([{ ...(response as JobData), isActive: false }]);
      } else {
        // Moving from drafts to published
        // Remove from drafts using the dedicated remover so we don't rely on merge behavior
        removeDraftJob(job._id);

        setJobs((prev) => [
          ...prev,
          { ...job, isActive: true, media: response.media },
        ]);
      }
    } catch (error) {
      console.error("Failed to toggle job active status:", error);
    }
  };

  const handleAddNewjob = () => {
    setShowPreview(undefined);
    setIsModalOpen(true);
  };

  // When deleting a draft job
  const handleDeleteJob = async (job: JobData) => {
    if (job._id.startsWith("draft-")) {
      removeDraftJob(job._id);
      return;
    }
    await deleteJob(job._id);
    setJobs((prev) => prev.filter((p) => p._id !== job._id));
    // remove from drafts via dedicated remover so dedupe/merge logic is used
    removeDraftJob(job._id);
  };

  const handleTabPress = (tab: "published" | "drafts") => {
    setActiveTab(tab);
  };

  const handleJobPress = (job: JobData) => {
    setIsModalOpen(true);
    setShowPreview(job);
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

  const renderjobCard = (job: JobData) => {
    return (
      <Card key={job._id} className="mx-4 mb-4 gap-4 shadow-xl">
        <HStack>
          <VStack className="flex-1 justify-start">
            {!userId && (
              <HStack className="items-center justify-between">
                <Button
                  className="p-2  bg-white/40 h-8 w-8 rounded-full"
                  onPress={() => handleDeleteJob(job)}
                >
                  <ButtonIcon as={TrashIcon} className="text-red-600" />
                </Button>
                {!job._id.startsWith("draft") && (
                  <Switch
                    size="md"
                    value={job.isActive}
                    onToggle={() => handleToggleActive(job)}
                    trackColor={{ false: "#d4d4d4", true: "#16a34a" }}
                    thumbColor="#fafafa"
                    ios_backgroundColor="#d4d4d4"
                  />
                )}
              </HStack>
            )}
          </VStack>
        </HStack>
        <VStack space="md" className="">
          <Heading className="">{job.title}</Heading>
          <Text className="line-clamp-2 text-typography-700">
            {job?.description}
          </Text>
        </VStack>
        <HStack space="lg" className="items-center">
          <Heading size="md">{`$${job?.budget || 0}`}</Heading>
          <Text>{job.negotiable ? "Negotiable" : "Fixed"}</Text>
          <Text
            className={`py-0.5 text-white px-2 rounded-full ${
              job.urgency === "Normal"
                ? "bg-green-500"
                : job.urgency === "Urgent"
                ? "bg-yellow-500"
                : job.urgency === "Immediate"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          >
            {job?.urgency || ""}
          </Text>
        </HStack>
        <HStack className="justify-between items-center w-full">
          <HStack space="sm" className="items-center flex-1">
            <Icon
              size="xl"
              as={MapPinIcon}
              className="fill-gray-500 stroke-white text-typography-600"
            />
            <Text className="text-typography-600 ">
              {job.location} (
              {
                locationService.getDistanceFromCurrentLocationWithUnit(
                  job?.coordinates?.[1] ?? 0,
                  job?.coordinates?.[0] ?? 0
                )?.text
              }{" "}
              away)
            </Text>
          </HStack>
          <Button
            size="md"
            onPress={() => {
              handleJobPress(job);
            }}
            className="rounded-xl h-8 bg-brand-primary"
          >
            <ButtonText>View</ButtonText>
          </Button>
        </HStack>
      </Card>
    );
  };

  return (
    <VStack className="flex-1 bg-white pt-14">
      {isEditable && (
        <HStack className="items-center justify-between px-4 pt-4">
          {renderTabButton("published", jobs.length)}
          {renderTabButton("drafts", draftJobs.length)}
          <Button
            size="sm"
            variant="outline"
            className="border-0"
            onPress={handleAddNewjob}
          >
            <ButtonIcon as={AddIcon} className="text-brand-secondary" />
            <ButtonText className="text-brand-secondary">
              Add New Job
            </ButtonText>
          </Button>
        </HStack>
      )}

      <VStack className="flex-1 mt-4">
        {loading ? (
          <Spinner className="mt-8" />
        ) : filteredjobs.length === 0 ? (
          <EmptyState
            header={`No ${
              activeTab === "published" ? "Published" : "Draft"
            } jobs`}
            text={
              activeTab === "published"
                ? "You have no published job. Switch to drafts or create a new job."
                : "You have no draft job. Switch to published or create a new job."
            }
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <VStack className="">{filteredjobs.map(renderjobCard)}</VStack>
          </ScrollView>
        )}

        {isModalOpen && (
          <CreatejobModal
            isOpen={isModalOpen || !!showPreview}
            onClose={handleModalClose}
            isEditable={isEditable && (!showPreview?.isActive || !showPreview)}
            job={showPreview}
            onPublished={(j) => setJobs((prev) => [...prev, j])}
          />
        )}
      </VStack>
    </VStack>
  );
};
export default PostJob;

export const CreatejobModal = ({
  isOpen,
  onClose,
  isEditable,
  job,
  onPublished,
}: {
  isOpen: boolean;
  onClose: () => void;
  isEditable?: boolean;
  job?: JobData;
  onPublished?: (j: JobData) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState<string>("");
  const [previewMode, setPreviewMode] = useState(!isEditable);
  const [services, setServices] = useState<any[]>([]);
  const {
    isLoading,
    user,
    setSuccess,
    setDraftJobs,
    selectedFiles,
    currentLocation,
    getCurrentLocation,
  } = useGlobalStore();

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<JobFormSchemaType>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: {
      title: job?.title || "",
      description: job?.description || "",
      categoryId: job?.subcategoryId?.categoryId?._id || "",
      subcategoryId: job?.subcategoryId?._id || "",
      location:
        job?.location ||
        [
          currentLocation?.subregion,
          currentLocation?.region,
          currentLocation?.country,
        ]
          .filter(Boolean)
          .join(" ") ||
        "",
      coordinates: [
        job?.coordinates?.[1] || currentLocation?.coords.latitude || 0,
        job?.coordinates?.[0] || currentLocation?.coords.longitude || 0,
      ],
      budget: job?.budget || 0,
      deadline: DateFormatter.remainingDays(job?.deadline as Date) || 0,
      negotiable: job?.negotiable || false,
      urgency: job?.urgency || "Normal",
      visibility: job?.visibility || "Public",
      // media: [],
      media: Array.isArray(job?.media)
        ? job?.media.map((img, idx) =>
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
        : [],
    },
  });

  // console.log({ errors });
  // print all values on change
  // console.log("Form Values:", watch());
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategoriesWithSubcategories();
        // console.log("fetched services", data);
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSaveDraft = async () => {
    if (!isDirty) return; // No changes to save
    try {
      const currentValues = getValues();

      // Create draft object
      const draftData = {
        ...currentValues,
        _id: job?._id || `draft-${Date.now()}`,
        isActive: false, // Drafts are inactive by default
        createdAt: job?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to zustand store
      setDraftJobs([draftData] as any);
      setSuccess("job saved to drafts");
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const onSubmit = async (data: JobFormSchemaType) => {
    // console.log({ data });
    try {
      setLoading(true);
      // remove categoryId
      delete (data as any).categoryId;
      // convert duration to deadline date
      const currentDate = new Date();
      const deadlineDate = new Date(
        currentDate.getTime() + data.deadline * 24 * 60 * 60 * 1000
      );
      (data as any).deadline = deadlineDate.toISOString();
      const formData = new FormData();
      appendFormData(formData, data);
      // console.log("Submitting formData:", Array.from(formData.entries()));
      const draftId = job?._id?.startsWith("draft-") ? job._id : null;

      let created: JobData | undefined;

      if (job && job._id && !job._id.startsWith("draft-")) {
        formData.append("isActive", "true");
        created = await updateJob(job._id, formData);
      } else {
        created = await createJob(formData);
      }

      if (created && created._id && draftId) {
        useGlobalStore.setState((state) => ({
          draftJobs: state.draftJobs.filter(
            (draftedJob) => draftedJob._id !== draftId
          ),
        }));
      }

      if (created && created._id) onPublished?.(created);

      useGlobalStore.setState({ selectedFiles: [] });
      onClose();
      reset();
      setSuccess("job created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Check if there are unsaved changes
    if (isDirty && isEditable) {
      // You could show a confirmation dialog here
    }
    handleSaveDraft();
    useGlobalStore.setState({ selectedFiles: [] });
    onClose();
    reset();
  };

  const inputFieldclass =
    "text-typography-500 font-semibold border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50";

  const renderFormField = () => (
    <VStack className="p-4 gap-4 items-center justify-center">
      {/* Title */}
      <FormControl
        className="w-full bg-white p-2.5 rounded-xl shadow-md"
        isInvalid={!!errors.title}
      >
        <FormControlLabel>
          <FormControlLabelText className="text-brand-primary/50">
            Job Title
          </FormControlLabelText>
        </FormControlLabel>
        <Input className="h-14 border-0">
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                placeholder="Enter a brief but descriptive title"
                autoCapitalize="sentences"
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
          <FormControlErrorText className="text-sm">
            {errors.title?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>

      {/* Description */}
      <FormControl
        className="w-full bg-white p-2.5 rounded-xl shadow-md"
        isInvalid={!!errors.description}
      >
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
                placeholder="Briefly describe the job requirements and expectations"
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
        <FormControlError className="">
          <FormControlErrorText className="text-sm">
            {errors.description?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      <HStack className="flex-1 gap-2">
        {/* Category */}
        <FormControl
          className="flex-1 bg-white p-2.5 rounded-xl shadow-md"
          isInvalid={!!errors.categoryId}
        >
          <FormControlLabel>
            <FormControlLabelText className="text-brand-primary/50">
              Category
            </FormControlLabelText>
          </FormControlLabel>
          <Select
            onValueChange={(value) => {
              setValue("categoryId", getValues("categoryId") || value, {
                shouldDirty: true,
              });
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
                placeholder={`${
                  job?.subcategoryId?.categoryId?.name
                    ? `${job.subcategoryId?.categoryId?.name}`
                    : "Select a category"
                }`}
              />
              <SelectIcon className="mr-3" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal preventScroll>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>

                {services.map(
                  (category: { _id: string; name: string }, idx: number) => (
                    <SelectItem
                      key={idx}
                      label={category.name}
                      value={category._id}
                      className="font-semibold text-typography-500 text-3xl h-16"
                    />
                  )
                )}
              </SelectContent>
            </SelectPortal>
          </Select>
          {errors.categoryId && (
            <FormControlError className="">
              <FormControlErrorText className="text-sm">
                {errors.categoryId.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>
        {/* SubCategories */}
        <FormControl
          className="flex-1 bg-white p-2.5 rounded-xl shadow-md"
          isInvalid={!!errors.subcategoryId}
        >
          <FormControlLabel>
            <FormControlLabelText className="text-brand-primary/50">
              Subcategory
            </FormControlLabelText>
          </FormControlLabel>
          <Select
            onValueChange={(value) => {
              setValue("subcategoryId", value, {
                shouldDirty: true,
              });
              setCategoryName(value);
            }}
            className="flex-1 border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50"
          >
            <SelectTrigger
              variant="outline"
              className="h-14 justify-between border-0"
            >
              <SelectInput
                className="font-semibold text-typography-500 flex-1"
                placeholder={`${
                  job?.subcategoryId?.name
                    ? `${job.subcategoryId?.name}`
                    : "Select"
                }`}
              />
              <SelectIcon className="mr-3" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal preventScroll>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {watch("categoryId") ? (
                  <ScrollView
                    className="max-h-96 w-full self-start"
                    showsVerticalScrollIndicator={false}
                  >
                    {services.map((category) => {
                      if (category._id !== watch("categoryId")) return null;
                      return category.subcategories.map(
                        (
                          subcategoryId: { _id: string; name: string },
                          idx: number
                        ) => (
                          <SelectItem
                            key={idx}
                            label={subcategoryId.name}
                            value={subcategoryId._id}
                            className="font-semibold text-typography-500"
                          />
                        )
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Heading size="sm" className="p-4">
                    Please select a category first
                  </Heading>
                )}
              </SelectContent>
            </SelectPortal>
          </Select>
          {errors.subcategoryId && (
            <FormControlError className="">
              <FormControlErrorText className="text-sm">
                {errors.subcategoryId.message}
              </FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>
      </HStack>
      {/* Bugdet */}
      <FormControl
        className="w-full bg-white p-2.5 rounded-xl shadow-md"
        isInvalid={!!errors.budget}
      >
        <FormControlLabel>
          <FormControlLabelText className="text-brand-primary/50">
            Budget ($)
          </FormControlLabelText>
        </FormControlLabel>
        <HStack className="gap-8">
          <Input className="flex-1 h-14 border-0">
            <Controller
              control={control}
              name="budget"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  placeholder="Enter budget"
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
          <VStack className="justify-end items-start">
            <Text className="font-bold text-typography-500">Negotiable</Text>
            <Controller
              control={control}
              name="negotiable"
              defaultValue={false}
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={Boolean(value)}
                  onValueChange={(v) => onChange(v)}
                  size="md"
                  trackColor={{ false: "#d4d4d4", true: "#DEAE60" }}
                  thumbColor="#102343"
                  ios_backgroundColor="#d4d4d4"
                />
              )}
            />
          </VStack>
        </HStack>
        <FormControlError className="">
          <FormControlErrorText className="text-sm">
            {errors.negotiable?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      {/* Duration */}
      <FormControl
        className="w-full bg-white p-2.5 rounded-xl shadow-md"
        isInvalid={!!errors.deadline}
      >
        <FormControlLabel>
          <FormControlLabelText className="text-brand-primary/50">
            When do you need it done? (in days)
          </FormControlLabelText>
        </FormControlLabel>
        <Input className="h-14 border-0">
          <Controller
            control={control}
            name="deadline"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                placeholder="Enter deadline"
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
        <FormControlError className="">
          <FormControlErrorText className="text-sm">
            {errors.deadline?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      {/* Location */}
      <Card className="w-full p-2.5 shadow-md rounded-xl">
        <Text className="font-semibold text-typography-400">Location</Text>
        <HStack className="w-full items-center gap-8">
          <Input className="flex-1 h-14 mt-2 border-0" isDisabled>
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  placeholder={value || "Enter job location"}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ""}
                  className="flex-1 h-14 font-semibold text-typography-900 border-0 w-72"
                />
              )}
            />
          </Input>

          <Button
            variant="outline"
            className="border-0 rounded-full w-14 h-14 bg-red-500 data-[active=true]:bg-red-500"
            isDisabled={isLoading}
            onPress={() => {
              getCurrentLocation();
              setValue(
                "location",
                `${currentLocation?.subregion} ${currentLocation?.region} ${currentLocation?.country}`,
                { shouldDirty: true }
              );
              setValue(
                "coordinates",
                [
                  currentLocation?.coords.latitude || 0,
                  currentLocation?.coords.longitude || 0,
                ],
                { shouldDirty: true }
              );
            }}
          >
            {isLoading ? (
              <ButtonSpinner />
            ) : (
              <ButtonIcon as={MapPinCheckIcon} className="text-white" />
            )}
          </Button>
        </HStack>
      </Card>

      {/* Media Picker */}
      <FormControl
        className="w-full bg-white rounded-xl shadow-md"
        isInvalid={!!errors.media}
      >
        <MediaPicker
          maxFiles={6}
          maxSize={100}
          allowedTypes={["image"]}
          initialFiles={(watch("media") || []).map((file) => ({
            ...file,
            type:
              file.type === "image"
                ? file.type
                : file.type?.includes("image")
                ? "image"
                : undefined,
          }))}
          onFilesChange={(files) => {
            if (files.length === 0) {
              setValue("media", [], { shouldDirty: true });
              return;
            }
            setValue("media", files, { shouldDirty: true });
          }}
          classname="h-80"
        />
        <FormControlError className="">
          <FormControlErrorText className="text-sm">
            {errors.media?.message}
          </FormControlErrorText>
        </FormControlError>
      </FormControl>
      {/** For next app update */}
      {/** Visibity */}
      <Card className="w-full p-2.5 shadow-md rounded-xl flex-row justify-between items-center">
        <Text className="text-typography-400 font-bold" size="lg">
          Visibility - {getValues("visibility")}
        </Text>
        <Controller
          control={control}
          name="visibility"
          defaultValue="Public"
          render={({ field: { value, onChange } }) => (
            <Switch
              value={value === "Public"}
              onValueChange={(v) => onChange(v ? "Public" : "Verified")}
              size="md"
              trackColor={{ false: "#d4d4d4", true: "#DEAE60" }}
              thumbColor="#102343"
              ios_backgroundColor="#d4d4d4"
            />
          )}
        />
      </Card>
    </VStack>
  );

  const renderPreview = () => {
    const [viewMedia, setViewMedia] = useState<string | null>(null);
    return (
      <VStack className="mt-4 gap-2 bg-[#F9F9F9] pb-8 pt-4">
        <Card className="mx-4">
          <Text className="mb-2 font-medium">Job Description</Text>
          <Text className="text-typography-600">
            {getValues("description") || job?.description}
          </Text>
        </Card>
        <Card className="mx-4">
          <Text className="mb-2 font-medium">Job Service</Text>
          <Text className="text-typography-600 font-medium">
            {categoryName ||
              `${job?.subcategoryId.categoryId.name} | ${job?.subcategoryId.name}`}
          </Text>
        </Card>
        <Card className="mx-4">
          <Text className="mb-2 font-medium">Budget</Text>
          <Text className="text-typography-700">
            ${getValues("budget") || job?.budget} -{" "}
            {getValues("negotiable") ? "Negotiable" : "Fixed Price"}
          </Text>
        </Card>
        <Card className="mx-4">
          <Text className="mb-2 font-medium">Location</Text>
          <Text className="text-typography-700">
            {getValues("location") || job?.location}
          </Text>
        </Card>

        <Card className="mx-4">
          <Text className="mb-2 font-medium">Estimated Duration</Text>
          <Text className="text-typography-700">
            {"On or Before "}
            {DateFormatter.toRelative(
              getValues("deadline") ?? job?.deadline ?? 0
            )}{" "}
            {"| Urgency"}
            {job?.urgency ? ` - ${String(job.urgency)}` : ""}
          </Text>
        </Card>
        <Card className="mx-4">
          <Text className="mb-2 font-medium">Visibility </Text>
          <Text className="text-typography-700">
            {job?.visibility === "Public"
              ? "Everyone"
              : job?.visibility === "Verified"
              ? "Verified Users Only"
              : "Only Me"}
          </Text>
        </Card>

        {job?.media &&
          job.media.length > 0 &&
          job.media.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => setViewMedia((item as MediaItem).url)}
            >
              <Image
                source={{
                  uri: (item as any).thumbnail,
                }}
                className="w-full h-80 object-cover"
                alt={`job media ${index + 1}`}
              />
            </Pressable>
          ))}

        {/* Media viewer modal */}
        {viewMedia && (
          <MediaView
            isOpen={!!viewMedia}
            onClose={() => setViewMedia(null)}
            mediaList={(job?.media as MediaItem[]) || []}
            url={viewMedia ?? ""}
          />
        )}
      </VStack>
    );
  };

  const renderProposals = () => {
    // console.log(job?.proposals);
    const [viewMedia, setViewMedia] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProposal, setSelectedProposal] =
      useState<ProposalData | null>(null);
    const { setCurrentView, createChat, selectedChat } = useGlobalStore();

    const handleJoinChat = async () => {
      await createChat(selectedProposal?.providerId.owner || "");
      setCurrentView("Chat");
      if (!selectedChat) return;
      router.push({
        pathname: "/chat/[id]",
        params: { id: selectedChat._id },
      });
    };
    const handleProposalUpdate = async () => {
      try {
        setIsLoading(true);
        // console.log({ selectedProposal });
        if (!selectedProposal?._id || !job?._id) return;
        const formData = new FormData();
        formData.append("status", "accepted");
        await updateProposal(job._id, selectedProposal._id, formData);
        formData.delete("status");
        formData.append("status", "In_progress");
        formData.append("providerId", selectedProposal.providerId._id);
        // formData.append("proposals", selectedProposal._id);
        await updateJob(job._id, formData);
        await handleJoinChat();
      } catch (error) {
        console.error("Error updating proposal:", error);
      } finally {
        setIsLoading(false);
        // Use an any cast to access asPath without TypeScript error
        onClose();
      }
    };
    const getStatusButtonClass = (status?: string) => {
      const s = (status || "").toString().toLowerCase();
      if (s === "active")
        return "self-end mt-2 bg-brand-primary data-[active=true]:bg-brand-primary/80 rounded-lg text-white";
      if (s === "in_progress" || s === "in-progress" || s === "in progress")
        return "self-end mt-2 bg-yellow-500 rounded-lg text-white";
      if (s === "accepted" || s === "accept")
        return "self-end mt-2 bg-green-500 rounded-lg text-white";
      if (s === "completed" || s === "complete")
        return "self-end mt-2 bg-gray-500 rounded-lg text-white";
      if (s === "pending")
        return "self-end mt-2 bg-gray-400 rounded-lg text-white";
      return "self-end mt-2 bg-gray-300 rounded-lg text-white";
    };
    return (
      <VStack>
        <Accordion>
          <AccordionItem value="a">
            <AccordionHeader>
              <AccordionTrigger>
                {({ isExpanded }: { isExpanded: any }) => {
                  return (
                    <>
                      <Heading size="xl" className="text-brand-primary">
                        {getValues("title") || job?.title}
                      </Heading>
                      {isExpanded ? (
                        <Text className="font-medium">Close</Text>
                      ) : (
                        <Text className="font-medium">Open</Text>
                      )}
                    </>
                  );
                }}
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent className="p-0">
              {renderPreview()}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {job?.proposals && job.proposals.length > 0 && (
          <VStack className="my-8">
            <HStack className="items-start justify-between mx-4">
              <Heading size="xl" className="text-brand-primary">
                Proposals
              </Heading>
              <Text className="px-3 py-0.5 bg-brand-primary/10 font-medium text-brand-primary/80 rounded-full">
                {job.proposals.length} Applications
              </Text>
            </HStack>
            <Card className="mx-4 mb-4 bg-brand-primary/10 mt-2">
              <Text className="text-typography-600">
                Review the proposals below and select the service provider that
                best fits your job requirements.
              </Text>
            </Card>
            {job.proposals.map((proposal: ProposalData) => (
              <Card key={proposal._id} className="gap-2">
                <ProfileVatar provider={proposal.providerId} />
                <Text size="lg" className="font-medium text-typography-600">
                  {proposal.message}
                </Text>

                <HStack className="mt-1 justify-between items-start">
                  <VStack>
                    <Heading className="text-typography-700">
                      ${proposal.proposedPrice}
                    </Heading>
                    <Text size="lg" className="text-typography-600">
                      Proposed Price
                    </Text>
                  </VStack>
                  <VStack>
                    <Heading size="md" className="text-typography-600">
                      {proposal.estimatedDuration} days
                    </Heading>
                    <Text size="lg" className=" text-typography-600">
                      Duration
                    </Text>
                  </VStack>
                  <Button
                    variant="link"
                    onPress={() => {
                      setViewMedia(proposal.attachments[0]?.url || null);
                    }}
                  >
                    <ButtonText className="">View image</ButtonText>
                  </Button>
                </HStack>
                <HStack className="mt-2 gap-2">
                  {proposal.attachments.map((mediaItem) => (
                    <Pressable
                      key={(mediaItem as MediaItem).index}
                      onPress={() => setViewMedia((mediaItem as MediaItem).url)}
                    >
                      <Image
                        source={{ uri: (mediaItem as MediaItem).thumbnail }}
                        style={{ width: 100, height: 100, borderRadius: 8 }}
                        contentFit="cover"
                      />
                    </Pressable>
                  ))}
                </HStack>
                <Button
                  isDisabled={job.status !== "Active" || isLoading}
                  onPress={() => {
                    setSelectedProposal(proposal);
                    handleProposalUpdate();
                  }}
                  className={getStatusButtonClass(job.status)}
                >
                  {isLoading ? (
                    <ButtonSpinner />
                  ) : (
                    <ButtonText>
                      {job.status === "Active" ? "Accept" : job.status}
                    </ButtonText>
                  )}
                </Button>
              </Card>
            ))}
          </VStack>
        )}
        {/* Media viewer modal */}
        {viewMedia && (
          <MediaView
            isOpen={!!viewMedia}
            onClose={() => setViewMedia(null)}
            url={viewMedia ?? ""}
          />
        )}
      </VStack>
    );
  };

  const renderFormFooter = () => {
    if (!isEditable) return null;

    if (!previewMode) {
      return (
        <ModalFooter className="mt-0 flex-col px-4">
          <HStack className="w-full gap-3">
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
            <ButtonText className="text-brand-secondary">
              {isLoading || loading ? <Spinner /> : "Publish"}
            </ButtonText>
          </Button>
        </ModalFooter>
      );
    }

    return (
      <ModalFooter className="mt-0 flex-col px-4">
        <Button
          size="xl"
          variant="outline"
          onPress={() => setPreviewMode(false)}
          className="w-full"
        >
          <ButtonText className="text-gray-500">Back to Edit</ButtonText>
        </Button>
        {isDirty && (
          <Button
            size="xl"
            isDisabled={!isValid || isLoading || loading}
            className="w-full bg-brand-primary"
            onPress={handleSubmit(onSubmit)}
          >
            <ButtonText>
              {isLoading || loading ? <Spinner /> : "Save & Publish Job"}
            </ButtonText>
          </Button>
        )}
      </ModalFooter>
    );
  };

  return (
    <Modal
      isOpen={!!isOpen}
      onClose={handleClose}
      closeOnOverlayClick={false}
      className="bg-white"
    >
      <ModalBackdrop />
      <ModalContent className="flex-1 pt-16 w-full px-0">
        <ModalHeader className="items-center justify-start gap-2">
          <ModalCloseButton
            className={`flex flex-row items-center gap-2 ${
              !isEditable && "px-4"
            }`}
          >
            <Icon size="xl" as={ChevronLeftIcon} />
            <Heading size="lg" className="text-brand-primary">
              {!previewMode ? "Job Post" : "Job Preview"}
            </Heading>
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody className="mt-8" showsVerticalScrollIndicator={false}>
          {!previewMode ? (
            <VStack>
              <Heading size="xl" className="text-brand-primary mx-4">
                Create a Request
              </Heading>
              <Card className="mx-4 mt-2 bg-brand-primary/10">
                <Text className="text-typography-500">
                  Fill in the details below to post a job request and find the
                  right service provider for your needs.
                </Text>
              </Card>
            </VStack>
          ) : (
            !job?.proposals &&
            job?._id && (
              <Heading size="xl" className="text-brand-primary mx-4">
                {job?.title || "Job Request Preview"}
              </Heading>
            )
          )}

          {!previewMode
            ? renderFormField()
            : job?.proposals && job.proposals.length > 0
            ? renderProposals()
            : renderPreview()}
        </ModalBody>

        {renderFormFooter()}
      </ModalContent>
    </Modal>
  );
};
