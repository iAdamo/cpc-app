import React, { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { ScrollView } from "@/components/ui/scroll-view";
import { View, Dimensions } from "react-native";
import { Pressable } from "@/components/ui/pressable";
import useGlobalStore from "@/store/globalStore";

const CATEGORIES_PER_PAGE = 5;

const Categories = () => {
  const { categories: selectedCategories, setCategories } = useGlobalStore();
  const categories = [
    { name: "Plumbing", icon: "🚰" },
    { name: "Electrical", icon: "💡" },
    { name: "Cleaning", icon: "🧹" },
    { name: "Carpentry", icon: "🪚" },
    { name: "Painting", icon: "🎨" },
    { name: "Landscaping", icon: "🌳" },
    { name: "Moving", icon: "🚛" },
    { name: "Pest Control", icon: "🐜" },
    { name: "HVAC", icon: "❄️" },
    { name: "Appliance Repair", icon: "🔧" },
    { name: "Roofing", icon: "🏠" },
    { name: "Flooring", icon: "🪵" },
    { name: "Locksmith", icon: "🔐" },
    { name: "Window Cleaning", icon: "🪟" },
    { name: "Gutter Cleaning", icon: "🌧️" },
  ];

  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);

  const handleScroll = (event: any) => {
    const { width } = event.nativeEvent.layoutMeasurement;
    const offsetX = event.nativeEvent.contentOffset.x;
    const newPage = Math.round(offsetX / width);
    setPage(newPage);
  };

  const { width } = Dimensions.get("window");

  return (
    <VStack className="mx-2 mt-2 gap-2">
      {/* Progress Indicator */}
      <HStack className="justify-center mb-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 20,
              height: 4,
              borderRadius: 2,
              marginHorizontal: 2,
              backgroundColor: i === page ? "#2563eb" : "#d1d5db",
            }}
          />
        ))}
      </HStack>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ width }}
        className=""
        contentContainerClassName=""
      >
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <HStack key={pageIndex} style={{ width }} className="justify-around">
            {categories
              .slice(
                pageIndex * CATEGORIES_PER_PAGE,
                (pageIndex + 1) * CATEGORIES_PER_PAGE
              )
              .map((category, index) => (
                <Pressable
                  key={category.name}
                  className={`w-[4.5rem] h-[4.5rem] p-2 bg-gray-100 rounded-xl items-center justify-center ${
                    selectedCategories.includes(category.name)
                      ? "bg-brand-primary/20 border-2 border-brand-primary/80"
                      : ""
                  }`}
                  onPress={() => {
                    if (selectedCategories.includes(category.name)) {
                      setCategories(
                        selectedCategories.filter(
                          (cat) => cat !== category.name
                        )
                      );
                    } else {
                      setCategories([...selectedCategories, category.name]);
                    }
                  }}
                >
                  <Text size="2xl" className="mb-2">
                    {category.icon}
                  </Text>
                  <Text size="xs" className="font-medium line-clamp-1">
                    {category.name}
                  </Text>
                </Pressable>
              ))}
          </HStack>
        ))}
      </ScrollView>
    </VStack>
  );
};

export default Categories;
