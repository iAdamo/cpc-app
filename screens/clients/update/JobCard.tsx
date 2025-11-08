import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { MapPinIcon, HeartIcon, CheckCheckIcon } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import useGlobalStore from "@/store/globalStore";
import { JobData } from "@/types";
import DateFormatter from "@/utils/DateFormat";
import { getDistanceWithUnit } from "@/utils/GetDistance";
import { router } from "expo-router";

const JobCard = ({ item: job }: { item: JobData }) => {
  const { savedJobs, setSavedJobs, user } = useGlobalStore();
  const savedJobIds = savedJobs.map((p) => p._id);

  const handleSaveToggle = (job: JobData) => {
    setSavedJobs(job);
  };

  const hasApplied = job?.applicants?.includes(user?.activeRoleId?._id || "");

  return (
    <Pressable
      key={job._id}
      onPress={() => {
        router.push({
          pathname: "/clients/jobs/[id]",
          params: { id: job._id },
        });
      }}
    >
      <Card
        variant={`${hasApplied ? "filled" : "elevated"}`}
        className="mb-2 border-gray-200 border-b"
      >
        <HStack className="justify-between items-start">
          <VStack space="xs">
            <Text className="text-typography-400 text-sm">
              Posted on: {DateFormatter.toLongDate(job.createdAt)}
            </Text>
            <VStack space="sm">
              <VStack space="sm" className="text-brand-secondary">
                <Text size="lg" className="text-brand-secondary font-medium">
                  {job.title}
                </Text>
                <HStack space="xs" className="items-center">
                  <Text
                    size="md"
                    className="font-medium text-typography-500"
                  >{`Budget: $${job?.budget || 0} -`}</Text>
                  <Text className="text-typography-600">
                    {job.negotiable ? "Negotiable" : "Fixed"}
                  </Text>
                  <Text size="sm" className="text-typography-500 font-medium">
                    {"| "}Due {DateFormatter.toDateTime(job?.deadline)}
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
              <Text className="line-clamp-2 text-typography-600">
                {job?.description}
              </Text>
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
                      getDistanceWithUnit(
                        job?.coordinates?.lat ?? 0,
                        job?.coordinates?.long ?? 0
                      )?.text
                    }{" "}
                    away)
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </VStack>
          <VStack space="xs" className="items-end h-full z-50">
            {hasApplied && (
              <Box className="items-end">
                <Icon
                  as={CheckCheckIcon}
                  className="stroke-green-500 text-green-500"
                />
                <Text size="sm" className="text-green-500">
                  Applied
                </Text>
              </Box>
            )}
            <Button
              variant="link"
              onPress={() => handleSaveToggle(job)}
              className="z-50"
            >
              <ButtonIcon
                as={HeartIcon}
                className={`${
                  savedJobIds.includes(job._id)
                    ? "fill-red-600 text-red-600"
                    : ""
                }`}
              />
            </Button>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
};

export default JobCard;
