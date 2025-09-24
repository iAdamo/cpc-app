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
import SocialMediaDetails from "./SocialLinks";
import About from "./About";
import MyServices from "../sections/provider/MyServices";

const TABS = [{ label: "About" }, { label: "Portfolio" }, { label: "Reviews" }];

const MoreInfo = ({
  provider,
  isEditable,
}: {
  provider: ProviderData;
  isEditable: boolean;
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("About");

  return (
    <Card className="bg-white mt-2 h-auto p-0">
      <HStack className="flex-1 justify-between items-center rounded-lg bg-gray-100 m-4">
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
          <About
            provider={provider}
            isEditable={isEditable}
          />
        </VStack>
      )}
      {selectedTab === "Portfolio" && (
        <MyServices providerId={provider?._id || ""} />
      )}
      {selectedTab === "Reviews" && <ReviewAndRating />}
    </Card>
  );
};

export default MoreInfo;
