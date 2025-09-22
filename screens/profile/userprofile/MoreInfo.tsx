import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { EditIcon } from "@/components/ui/icon";
import { PencilLineIcon } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { ScrollView } from "react-native";
import { ProviderData, EditableFields } from "@/types";
import ReviewAndRating from "../sections/ReviewSection";

const TABS = [{ label: "About" }, { label: "Portfolio" }, { label: "Reviews" }];

const MoreInfo = ({
  provider,
  isEditable,
  editingFields,
  handleSave,
  handleEditStart,
  handleCancelEdit,
}: {
  provider: ProviderData;
  isEditable: boolean;
  editingFields: Partial<Record<EditableFields, string>>;
  handleSave: () => void;
  handleEditStart: (fields: Partial<Record<EditableFields, string>>) => void;
  handleCancelEdit: () => void;
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("About");

  return (
    <Card className="bg-white mt-2 h-auto p-4">
      <HStack className="w-full justify-between items-center rounded-lg bg-gray-100">
        {TABS.map((tab) => (
          <Button
            key={tab.label}
            variant="outline"
            onPress={() => setSelectedTab(tab.label)}
            className={`${
              selectedTab === tab.label ? "bg-brand-primary" : ""
            } rounded-lg border-0 px-10`}
          >
            <ButtonText
              className={`${
                selectedTab === tab.label ? "text-white" : "text-brand-primary"
              }`}
            >
              {tab.label}
            </ButtonText>
          </Button>
        ))}
      </HStack>
      {selectedTab === "About" && (
        <VStack className="mt-4 gap-4">
          <VStack space="xs">
            <HStack className="items-center">
              <Heading size="md" className="text-typography-700">
                Description
              </Heading>
              {isEditable && (
                <Button
                  variant="link"
                  onPress={() =>
                    handleEditStart({
                      providerDescription: provider.providerDescription || "",
                    })
                  }
                  className="ml-auto"
                >
                  <ButtonIcon
                  size="sm"
                    className="text-brand-primary"
                    as={PencilLineIcon}
                  />
                  <ButtonText className="text-brand-primary">Edit</ButtonText>
                </Button>
              )}
            </HStack>

            <Text className="text-justify break-words line-clamp-[9]">
              {provider.providerDescription ||
                `
              Hi, I&apos;m Sodiq Sanusi, a professional painter with over 10
              years of experience transforming homes and offices across Lagos. I
              specialize in creating beautiful, vibrant, and lasting finishes
              that bring your spaces to life. Whether it&apos;s a modern look,
              classic design, or artistic touch, I ensure every project is
              tailored to your style and needs. Hi, I&apos;m Akpan Blessing, a
              professional painter with over 10 years of experience transforming
              homes and offices across Lagos. I specialize in creating
              beautiful, vibrant, and lasting finishes that bring your spaces to
              life. Whether it&apos;s a modern look, classic design, or artistic
              touch, I ensure every project is tailored to your style and needs.`}
            </Text>
          </VStack>
          <VStack space="xs">
            <Heading size="md" className="text-typography-700">
              Photos
            </Heading>
            {provider.providerImages.map((item, idx) => (
              <Image
                key={idx}
                source={
                  (typeof item === "string" && item) ||
                  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                }
                alt={`Portfolio ${item}`}
                className="w-full h-60 rounded-md bg-gray-200 mb-4"
              />
            ))}
          </VStack>
        </VStack>
      )}
      {selectedTab === "Portfolio" && (
        <Card variant="filled" className="mt-4 p-0">
          <VStack space="md" className="">
            <ScrollView
              showsVerticalScrollIndicator={false}
              className=""
              style={{ height: "100%", width: "100%" }}
            >
              {provider.providerImages.map((item, idx) => (
                <Image
                  key={idx}
                  source={
                    (typeof item === "string" && item) ||
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  }
                  alt={`Portfolio ${item}`}
                  className="w-full h-60 rounded-md bg-gray-200 mb-4"
                />
              ))}
            </ScrollView>
          </VStack>
        </Card>
      )}
      {selectedTab === "Reviews" && <ReviewAndRating />}
    </Card>
  );
};

export default MoreInfo;
