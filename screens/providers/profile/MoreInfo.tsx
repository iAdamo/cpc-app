import { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { ScrollView } from "react-native";
import { ProviderData } from "@/types";

const TABS = [{ label: "About" }, { label: "Portfolio" }, { label: "Reviews" }];

const MoreInfo = ({provider}: {provider: ProviderData | null}) => {
  const [selectedTab, setSelectedTab] = useState<string>("About");

  return (
    <Card className="bg-white mt-2">
      <HStack className="w-full justify-between items-center rounded-lg bg-gray-100">
        {TABS.map((tab) => (
          <Button
            key={tab.label}
            variant="outline"
            size="sm"
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
        <VStack className="mt-4">
          <Card variant="filled">
            <Text className="text-justify break-words line-clamp-[9]">
              Hi, I&apos;m Akpan Blessing, a professional painter with over 10
              years of experience transforming homes and offices across Lagos. I
              specialize in creating beautiful, vibrant, and lasting finishes
              that bring your spaces to life. Whether it&apos;s a modern look,
              classic design, or artistic touch, I ensure every project is
              tailored to your style and needs. Hi, I&apos;m Akpan Blessing, a
              professional painter with over 10 years of experience transforming
              homes and offices across Lagos. I specialize in creating
              beautiful, vibrant, and lasting finishes that bring your spaces to
              life. Whether it&apos;s a modern look, classic design, or artistic
              touch, I ensure every project is tailored to your style and needs.
            </Text>
          </Card>
        </VStack>
      )}
      {selectedTab === "Portfolio" && (
        <Card variant="filled" className="mt-4 p-2">
          <VStack space="md" className="">
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="space-y-4"
              style={{ height: 400, width: "100%",  }}
            >
              {[1, 2, 3, 4, 5].map((item) => (
                <Image
                  key={item}
                  source={{
                    uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
                  }}
                  alt={`Portfolio ${item}`}
                  className="w-full h-60 rounded-md bg-gray-200 mb-4"
                />
              ))}
            </ScrollView>
          </VStack>
        </Card>
      )}
    </Card>
  );
};

export default MoreInfo;
