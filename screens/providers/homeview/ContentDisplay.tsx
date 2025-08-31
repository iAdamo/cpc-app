import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ScrollView, View, Dimensions, Pressable } from "react-native";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ChevronRightIcon } from "@/components/ui/icon";
import { ChevronDownIcon, ListIcon, Grid2X2Icon } from "lucide-react-native";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import useGlobalStore from "@/store/globalStore";
import ProviderCard from "@/components/ProviderCard";
import { ProviderData } from "@/types";

const ContentDisplay = ({ providers }: { providers: ProviderData[] }) => {
  // companies
  const data = [
    {
      providerName: "John's Plumbing",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Expert plumbing services for residential and commercial needs.",
      rating: 4.8,
      reviews: 120,
      location: "New York, NY",
      category: "Plumbing",
    },
    {
      providerName: "Bright Electricians",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Professional electrical installations and repairs.",
      rating: 4.6,
      reviews: 95,
      location: "Los Angeles, CA",
      category: "Electrical",
    },
    {
      providerName: "Sparkle Cleaners",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Top-notch cleaning services for homes and offices.",
      rating: 4.9,
      reviews: 150,
      location: "Chicago, IL",
      category: "Cleaning",
    },
    {
      providerName: "Handy Carpentry",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Custom carpentry solutions for all your needs.",
      rating: 4.7,
      reviews: 80,
      location: "Houston, TX",
      category: "Carpentry",
    },
    {
      providerName: "Pro Painters",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Quality painting services for interiors and exteriors.",
      rating: 4.5,
      reviews: 60,
      location: "Phoenix, AZ",
      category: "Painting",
    },
    {
      providerName: "Green Thumb Landscaping",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Beautiful landscaping and lawn care services.",
      rating: 4.8,
      reviews: 110,
      location: "Philadelphia, PA",
      category: "Landscaping",
    },
    {
      providerName: "Swift Movers",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Reliable moving services for local and long-distance moves.",
      rating: 4.6,
      reviews: 70,
      location: "San Antonio, TX",
      category: "Moving",
    },
    {
      providerName: "PestAway Control",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Effective pest control solutions for homes and businesses.",
      rating: 4.7,
      reviews: 85,
      location: "San Diego, CA",
      category: "Pest Control",
    },
    {
      providerName: "Cool Air HVAC",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Expert HVAC installation and repair services.",
      rating: 4.9,
      reviews: 130,
      location: "Dallas, TX",
      category: "HVAC",
    },
    {
      providerName: "FixIt Appliance Repair",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Trusted appliance repair services for all major brands.",
      rating: 4.5,
      reviews: 55,
      location: "San Jose, CA",
      category: "Appliance Repair",
    },
  ];
  const { width } = Dimensions.get("window");
  const { displayStyle } = useGlobalStore();
  const view =
    displayStyle === "Grid"
      ? "flex-row flex-wrap justify-between"
      : "flex flex-col";
  return (
    <VStack className={`${view}`}>
      {(providers && providers.length > 0 ? providers : data).map(
        (provider, index) => (
          <ProviderCard key={index} provider={provider} />
        )
      )}
    </VStack>
  );
};
export default ContentDisplay;
