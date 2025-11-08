import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { LinearGradient } from "expo-linear-gradient";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { ScrollView } from "@/components/ui/scroll-view";
import { Icon, ArrowLeftIcon, FavouriteIcon } from "@/components/ui/icon";
import {
  TagIcon,
  ClockIcon,
  MapPinIcon,
  CalendarRangeIcon,
} from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { JobData, MediaItem } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { getJobById } from "@/services/axios/service";
import { router } from "expo-router";
import useGlobalStore from "@/store/globalStore";
import DateFormatter from "@/utils/DateFormat";
import { getDistanceWithUnit } from "@/utils/GetDistance";
import { Image } from "expo-image";
import MediaView from "@/components/media/MediaView";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import RatingSection from "@/components/RatingFunction";
import CreateProposal from "./proposals/createProposalModal";

const JobView = () => {
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const [proposalModalOpen, setProposalModalOpen] = useState<JobData | null>(
    null
  );

  const { savedJobs, setSavedJobs, cachedJobs, user } = useGlobalStore();
  const params = useLocalSearchParams<{ id: string }>();
  const savedJobIds = savedJobs.map((p) => p._id);

  const hasApplied = job?.applicants?.includes(user?.activeRoleId?._id || "");

  const handleSaveToggle = () => {
    job && setSavedJobs(job);
  };

  useEffect(() => {
    setLoading(true);
    const fetchJob = async () => {
      if (!params.id) return;

      const cached = (cachedJobs || []).find((j) => j._id === params.id);
      if (cached) {
        setJob(cached);
        return;
      }

      try {
        const jobData = await getJobById(params.id);
        // console.log("Fetched Job Data:", jobData);
        if (jobData) {
          setJob(jobData);
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
      }
    };
    fetchJob();
    setLoading(false);
  }, [params.id, cachedJobs]);

  if (loading || !job) {
    return (
      <VStack className="flex-1 items-center justify-center">
        <Spinner />
      </VStack>
    );
  }
  // console.log(job.media);
  return (
    <VStack className="flex-1 bg-white">
      <VStack className="bg-white">
        <HStack className="w-full relative">
          <LinearGradient
            colors={["#fffbe020", "#facc1530"]}
            style={{
              position: "absolute",
              width: "100%",
              height: 130,
            }}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0 }}
          />
        </HStack>
        <VStack className="pt-8">
          <HStack className="p-4 justify-between items-center">
            <Button variant="link" onPress={() => router.back()} className="">
              <ButtonIcon
                as={ArrowLeftIcon}
                className="w-7 h-7 text-gray-500"
              />
            </Button>
            <Button
              variant="link"
              className=""
              onPress={() => handleSaveToggle()}
            >
              <ButtonIcon
                as={FavouriteIcon}
                className={`w-7 h-7 ${
                  savedJobIds.includes(job._id)
                    ? "fill-red-600 text-red-600"
                    : "text-gray-500"
                }`}
              />
            </Button>
          </HStack>
        </VStack>
      </VStack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 pt-6 gap-4"
      >
        <Card className="gap-4">
          <HStack className="gap-4 justify-between items-center">
            <Heading size="xl" className="font-medium flex-1">
              {job.title}
            </Heading>
            {hasApplied && (
              <Heading
                size="xs"
                className="py-0.5 px-2 bg-green-500 h-5 rounded-lg text-white text-center"
              >
                Applied
              </Heading>
            )}
          </HStack>

          <HStack space="xs" className="items-center">
            <Heading size="lg" className="font-medium text-brand-primary">
              {`$${job?.budget || 0} -`}
            </Heading>
            <Heading size="sm" className="font-medium text-typography-600">
              {job.negotiable ? "Negotiable" : "Fixed"}
            </Heading>
            <Heading
              size="xs"
              className={`text-white px-3 py-0.5 rounded-lg self-center ml-12 ${
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
            </Heading>
          </HStack>
        </Card>
        <Card className="gap-2">
          <HStack space="md" className="items-center">
            <Icon as={TagIcon} className="text-brand-primary" />
            <Text className="text-typography-600 font-medium">
              {job.subcategoryId?.categoryId?.name}
              {" -->"} {job?.subcategoryId?.name}
            </Text>
          </HStack>
          <HStack space="md" className="items-center">
            <Icon as={ClockIcon} className="text-brand-primary" />
            <Text className="text-typography-600 font-medium">
              Due in {DateFormatter.remainingTime(job.deadline)}
            </Text>
          </HStack>
          <HStack space="md" className="items-center">
            <Icon as={MapPinIcon} className="text-brand-primary" />
            <Text className="text-typography-600 font-medium">
              {job.location} (
              {
                getDistanceWithUnit(
                  job?.coordinates?.lat ?? 0,
                  job?.coordinates?.long ?? 0
                )?.text
              }{" "}
              away){" "}
            </Text>
          </HStack>
          <HStack space="md" className="items-center">
            <Icon as={CalendarRangeIcon} className="text-brand-primary" />
            <Text className="text-typography-600 font-medium">
              Posted {DateFormatter.toRelative(job?.createdAt)}
            </Text>
          </HStack>
        </Card>
        <Card className="gap-4">
          <VStack>
            <Heading size="lg" className="font-medium mb-2">
              Job Description
            </Heading>
            <Text className="text-typography-600">{job?.description}</Text>
          </VStack>
          <VStack>
            <Heading size="lg" className="font-medium mb-2">
              Attachments
            </Heading>
            {job.media && job.media.length > 0 ? (
              <HStack space="sm" className="flex-wrap ">
                {job.media.map((mediaItem) => (
                  <Pressable
                    key={(mediaItem as MediaItem).index}
                    onPress={() =>
                      setViewingPhoto((mediaItem as MediaItem).url)
                    }
                  >
                    <Image
                      source={{ uri: (mediaItem as MediaItem).thumbnail }}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                      contentFit="cover"
                    />
                  </Pressable>
                ))}
              </HStack>
            ) : (
              <Text className="text-typography-500">
                No attachments for this job.
              </Text>
            )}
          </VStack>
        </Card>
        <Card className="gap-8 mb-8">
          <HStack className="gap-4 items-center">
            <Avatar size="md">
              <AvatarFallbackText>
                {`${job.userId?.firstName ?? ""} ${
                  job.userId?.lastName ?? ""
                }`.trim()}
              </AvatarFallbackText>
              <AvatarImage
                source={{
                  uri: job.userId?.profilePicture?.thumbnail,
                }}
              />
            </Avatar>

            <VStack>
              <Heading className="text-brand-primary">
                {job.anonymous
                  ? "Anonymous"
                  : `${job.userId?.firstName ?? ""} ${
                      job.userId?.lastName ?? ""
                    }`.trim()}
              </Heading>
              <RatingSection
                rating={job.userId?.averageRating}
                reviewCount={job.userId?.reviewCount}
              />
            </VStack>
            <Text
              size="sm"
              className="self-end text-typography-600 font-medium flex-1"
            >
              Member since {DateFormatter.toShortDate(job.userId.createdAt)}
            </Text>
          </HStack>

          <Button
            size="xl"
            isDisabled={hasApplied}
            onPress={() => setProposalModalOpen(job)}
            className="bg-brand-primary mx-4 data-[active=true]:bg-brand-primary/60 rounded-xl"
          >
            <ButtonText>{hasApplied ? "Applied" : "Send Proposal"}</ButtonText>
          </Button>
        </Card>
      </ScrollView>
      {viewingPhoto && (
        <MediaView
          isOpen={viewingPhoto !== null}
          onClose={() => setViewingPhoto("")}
          url={viewingPhoto}
        />
      )}
      {proposalModalOpen && (
        <CreateProposal job={job} onClose={() => setProposalModalOpen(null)} />
      )}
    </VStack>
  );
};
export default JobView;
