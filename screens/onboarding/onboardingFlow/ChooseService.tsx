import { useEffect, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Button, ButtonText } from "@/components/ui/button";
import useGlobalStore from "@/store/globalStore";

const ChooseService = () => {
  // const [selectedServices, setSelectedSubcategory] = useState<
  //   SelectedSubcategory[]
  // >((data.subcategories as SelectedSubcategory[]) || []);
  // const [availableCategories, setAvailableCategories] = useState<
  //   ServiceCategory[]
  // >(
  //   (data.availableCategories as ServiceCategory[]) ||
  //     categories.map((category) => ({
  //       ...category,
  //       subcategories: category.subcategories.filter(
  //         (subcategory: Subcategory) =>
  //           !selectedServices.some((selected) => selected.id === subcategory.id)
  //       ),
  //     }))
  // );
  const [selectionLimitReached, setSelectionLimitReached] = useState(false);

  const { user, updateProfile, setCurrentStep, currentStep } = useGlobalStore();
  return (
    <VStack className="p-4">
      <VStack space="lg">
        <Heading size="3xl" className="text-brand-secondary">
          Choose the service you want to offer
        </Heading>
        <Text size="xl">You can only choose one</Text>
      </VStack>
      <ScrollView showsVerticalScrollIndicator={false}></ScrollView>
    </VStack>
  );
};

export default ChooseService;
