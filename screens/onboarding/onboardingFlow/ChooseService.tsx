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
import { getAllCategoriesWithSubcategories } from "@/axios/service";
import { Category, Subcategory } from "@/types";

interface SelectedSubcategory extends Subcategory {
  categoryName: string;
  categoryId: string;
}

const MAX_SERVICES = 1;

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

  const [selectedServices, setSelectedServices] = useState<
    SelectedSubcategory[]
  >(
    user.activeRoleId?.subcategories?.map((sub) => ({
      ...sub,
      categoryId: sub.category?._id,
      categoryName: sub.category?.name,
    })) || []
  );

  useEffect(() => {
    setSelectionLimitReached(selectedServices.length >= MAX_SERVICES);
  }, [selectedServices]);

  const handleToggleSubcategory = (
    subcategory: Subcategory,
    categoryName: string,
    categoryId: string
  ) => {
    const isSelected = selectedServices.some(
      (service) => service._id === subcategory._id
    );
    let updatedSelections: SelectedSubcategory[] = [];
    if (isSelected) {
      setSelectedServices((prev: SelectedSubcategory[]) => {
        const filtered = prev.filter((item) => item._id !== subcategory._id);
        updatedSelections = filtered;
        return filtered;
      });
    } else {
      setSelectedServices((prev: SelectedSubcategory[]) => {
        const updated = [
          ...prev,
          {
            ...subcategory,
            _id: subcategory._id, // ensure _id is present
            categoryName,
            categoryId,
          },
        ];
        updatedSelections = updated;
        return updated;
      });
    }
    setSelectedServices(updatedSelections);
    // Update user profile immediately
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
