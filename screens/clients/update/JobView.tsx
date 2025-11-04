import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { LinearGradient } from "expo-linear-gradient";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Icon, ArrowLeftIcon, FavouriteIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { JobData } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { getJobById } from "@/services/axios/service";
import { router } from "expo-router";
import useGlobalStore from "@/store/globalStore";

const JobView = () => {
  const [job, setJob] = useState<JobData | null>(null);

  const params = useLocalSearchParams<{ id: string }>();
  useEffect(() => {
    const fetchJob = async () => {
      if (params.id) {
        const jobData = await getJobById(params.id);
        console.log("Fetched Job Data:", jobData);
        if (jobData) {
          setJob(jobData);
        }
      }
    };
    fetchJob();
  }, [params.id]);

  const { savedJobs, setSavedJobs } = useGlobalStore();
  const savedJobIds = savedJobs.map((p) => p._id);

  const handleSaveToggle = () => {
    job && setSavedJobs(job);
  };

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
        <VStack className="pt-12">
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
      <VStack className="flex-1 pt-32">
        <Heading className="text-brand-secondary font-medium">
          {job.title}
        </Heading>
        <HStack space="xs" className="items-center">
          <Text size="md" className="font-medium text-typography-500">
            {`Budget: $${job?.budget || 0} -`}
          </Text>
          <Text className="text-typography-600">
            {job.negotiable ? "Negotiable" : "Fixed"}
          </Text>
          <Text size="sm" className="text-typography-500 font-medium">
            {` | Due ${new Date(job?.deadline).toLocaleDateString()}`}
          </Text>
        </HStack>
        <Text
          size="sm"
          className={`text-white px-2 rounded-full self-start ${
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
      </VStack>
    </VStack>
  );
};
export default JobView;
