import React, { useEffect, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
// import { Pressable } from "@/components/ui/pressable";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { CloseIcon, CheckIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import useGlobalStore from "@/store/globalStore";
import { getAllCategoriesWithSubcategories } from "@/services/axios/service";
import { Category, Subcategory } from "@/types";

interface SelectedSubcategory extends Subcategory {
  categoryName: string;
  categoryId: string;
}

type SelectedService = { _id: string; categoryId: string };

const MAX_SERVICES = 3;

const ChooseService = () => {
  const [selectionLimitReached, setSelectionLimitReached] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const { user, updateProfile, setCurrentStep, currentStep } = useGlobalStore();
  if (!user) return;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getAllCategoriesWithSubcategories();
        // console.log("Fetched categories:", categories);
        setCategories(categories);
      } catch (error) {
        console.error("Failed to fetch service categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // console.log("787", user.activeRoleId?.subcategories);

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    user.activeRoleId?.subcategories?.map((sub) => ({
      _id: sub._id,
      categoryId: sub.category?._id,
    })) || []
  );

  useEffect(() => {
    setSelectionLimitReached(selectedServices.length >= MAX_SERVICES);
  }, [selectedServices]);

  const handleToggleSubcategory = (
    subcategory: Subcategory,
    _categoryName: string, // not needed
    categoryId: string
  ) => {
    const isSelected = selectedServices.some(
      (service) => service._id === subcategory._id
    );
    let updatedSelections: SelectedService[] = [];
    if (isSelected) {
      updatedSelections = selectedServices.filter(
        (item) => item._id !== subcategory._id
      );
    } else {
      updatedSelections = [
        ...selectedServices,
        { _id: subcategory._id, categoryId },
      ];
    }
    setSelectedServices(updatedSelections);
    updateProfile({
      activeRoleId: { ...user.activeRoleId, subcategories: updatedSelections },
    });
  };

  const isSubcategorySelected = (subcategoryId: string): boolean => {
    return selectedServices.some((service) => service._id === subcategoryId);
  };

  return (
    <VStack className="flex-1 p-4">
      <VStack space="lg" className="mb-4">
        <Heading size="3xl" className="text-brand-secondary">
          Choose the service you want to offer
        </Heading>
        <Text size="xl">You can only choose one</Text>
      </VStack>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {categories.map((category) => (
          <VStack key={category._id} className="mb-6">
            <Heading className="mb-4">{category.name}</Heading>
            {category.subcategories.length > 0 ? (
              <HStack className="flex-wrap gap-2">
                {category.subcategories.map((subcategory) => {
                  const isSelected = isSubcategorySelected(subcategory._id);
                  return (
                    <Button
                      key={subcategory._id}
                      variant="outline"
                      size="sm"
                      className={`h-12 rounded-xl ${
                        isSelected
                          ? "border-brand-secondary border-2 data-[active=true]:border-brand-secondary"
                          : "border-gray-300 data-[active=true]:border-brand-secondary"
                      }`}
                      onPress={() =>
                        handleToggleSubcategory(
                          subcategory,
                          category.name,
                          category._id
                        )
                      }
                      isDisabled={selectionLimitReached && !isSelected}
                    >
                      <ButtonText className="text-gray-600">
                        {subcategory.name}
                      </ButtonText>
                    </Button>
                  );
                })}
              </HStack>
            ) : (
              <Text>No subcategories available</Text>
            )}
          </VStack>
        ))}
      </ScrollView>
      <Button
        size="xl"
        variant="outline"
        className="mb-2 bg-brand-secondary border-0"
        onPress={() => setCurrentStep(currentStep + 1)}
      >
        <ButtonText className="text-white">Continue</ButtonText>
      </Button>
    </VStack>
  );
};

export default ChooseService;
