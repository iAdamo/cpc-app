import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import ProfileItem from "./ProfileItem";

interface SectionProps {
  title: string;
  items: { text: string; icon: any; action: () => void }[];
}

const ProfileSection = ({ title, items }: SectionProps) => (
  <VStack className="mt-4">
    <Heading className="px-4 mb-4 text-brand-primary">{title}</Heading>
    <VStack className="bg-white border-y border-gray-200">
      {items.map((item, idx) => (
        <ProfileItem
          key={idx}
          text={item.text}
          icon={item.icon}
          showDivider={idx !== items.length - 1}
          onPress={item.action}
        />
      ))}
    </VStack>
  </VStack>
);

export default ProfileSection;
