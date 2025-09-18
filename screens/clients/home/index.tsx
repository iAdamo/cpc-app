import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Icon } from "@/components/ui/icon";
import { MapPinIcon, HeartIcon } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import React, { useEffect, useState } from "react";
import useGlobalStore from "@/store/globalStore";
import { Dimensions } from "react-native";
import SearchBar from "@/components/SearchEngine";

const TaskDisplay = () => {
  const { width } = Dimensions.get("window");
  const tasks = [
    {
      id: 1,
      title: "Paint living room",
      location: "Los Angeles, CA",
      description: "Need a fresh coat of paint in the living room.",
      budget: "$200-$300",
      datePosted: "2023-10-01",
    },
    {
      id: 2,
      title: "Fix leaky faucet",
      location: "New York, NY",
      description: "Kitchen faucet is leaking and needs repair.",
      budget: "$50-$100",
      datePosted: "2023-10-02",
    },
    {
      id: 3,
      title: "Install ceiling fan",
      location: "Chicago, IL",
      description: "Looking for someone to install a new ceiling fan.",
      budget: "$100-$150",
      datePosted: "2023-10-03",
    },
    {
      id: 4,
      title: "Clean gutters",
      location: "Houston, TX",
      description: "Gutters need cleaning before the rainy season.",
      budget: "$80-$120",
      datePosted: "2023-10-04",
    },
    {
      id: 5,
      title: "Repair drywall",
      location: "Phoenix, AZ",
      description: "Small holes in drywall need patching and painting.",
      budget: "$150-$200",
      datePosted: "2023-10-05",
    },
    {
      id: 6,
      title: "Lawn mowing",
      location: "Philadelphia, PA",
      description: "Regular lawn mowing service needed.",
      budget: "$40 per visit",
      datePosted: "2023-10-06",
    },
    {
      id: 7,
      title: "Replace door lock",
      location: "San Antonio, TX",
      description: "Need to replace a broken door lock.",
      budget: "$70-$120",
      datePosted: "2023-10-07",
    },
    {
      id: 8,
      title: "Tile backsplash",
      location: "San Diego, CA",
      description: "Install tile backsplash in kitchen.",
      budget: "$300-$500",
      datePosted: "2023-10-08",
    },
    {
      id: 9,
      title: "Assemble furniture",
      location: "Dallas, TX",
      description: "Help needed to assemble new furniture.",
      budget: "$50-$100",
      datePosted: "2023-10-09",
    },
    {
      id: 10,
      title: "Window cleaning",
      location: "San Jose, CA",
      description: "Professional window cleaning service required.",
      budget: "$100-$200",
      datePosted: "2023-10-10",
    },
  ];

  return (
    <VStack>
      <ScrollView>
        <SearchBar />
        <Text size="md" className="mt-4 mb-2 px-8 text-typography-600">
          Browse tasks that match your company's experience to a client's hiring
          preferences.
        </Text>
        <VStack className="px-2 mb-24">
          {tasks.map((task) => (
            <Card key={task.id} className="mb-2 border-gray-200 border-b">
              <Text className="text-typography-400 text-sm">
                Posted on: {new Date(task.datePosted).toLocaleDateString()}
              </Text>
              <VStack space="xs">
                <HStack className="justify-between items-center">
                  <Text size="lg" className="text-brand-secondary font-medium">
                    {task.title}
                  </Text>
                  <Icon  className="text-gray-500" as={HeartIcon}/>
                </HStack>

                <Text size="sm" className="text-typography-500">
                  Est. Budget: {task.budget}
                </Text>
                <Text className="text-typography-700">{task.description}</Text>

                <HStack space="xs" className="items-center">
                  <Icon
                    as={MapPinIcon}
                    size="sm"
                    className="text-typography-500"
                  />
                  <Text className="text-typography-500">{task.location}</Text>
                </HStack>
              </VStack>
            </Card>
          ))}
        </VStack>
      </ScrollView>
    </VStack>
  );
};

export default TaskDisplay;
