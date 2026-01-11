import React, { useState, useEffect, useMemo } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import { View, Dimensions } from "react-native";
import { Pressable } from "@/components/ui/pressable";
import useGlobalStore from "@/store/globalStore";
import { getAllCategoriesWithSubcategories } from "@/services/axios/service";
import { Subcategory } from "@/types";

const ITEMS_PER_PAGE = 5;

const Categories = () => {
  const [page, setPage] = useState(0);

  const {
    categories,
    selectedSubcategories,
    toggleSubcategory,
    setCategories,
  } = useGlobalStore();

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategoriesWithSubcategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  /** 🔹 Flatten all subcategories */
  const subcategories: Subcategory[] = useMemo(
    () => categories.flatMap((c) => c.subcategories || []),
    [categories]
  );

  const totalPages = Math.ceil(subcategories.length / ITEMS_PER_PAGE);
  const { width } = Dimensions.get("window");

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setPage(Math.round(offsetX / width));
  };

  const isSelected = (id: string) =>
    selectedSubcategories.some((s) => s._id === id);

  return (
    <VStack className="mx-2 mt-2 gap-2">
      {/* Pagination indicator */}
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
      >
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <HStack key={pageIndex} style={{ width }} className="justify-around">
            {subcategories
              .slice(
                pageIndex * ITEMS_PER_PAGE,
                (pageIndex + 1) * ITEMS_PER_PAGE
              )
              .map((sub) => (
                <Pressable
                  key={sub._id}
                  className={`w-[4.5rem] h-[4.5rem] p-2 rounded-xl items-center justify-center ${
                    isSelected(sub._id)
                      ? "bg-brand-primary/20 border-2 border-brand-primary/80"
                      : "bg-gray-100"
                  }`}
                  onPress={() => toggleSubcategory(sub)}
                >
                  <Text
                    size="xs"
                    className="font-medium text-center line-clamp-2"
                  >
                    {sub.name}
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
