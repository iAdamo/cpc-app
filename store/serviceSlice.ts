import { StateCreator } from "zustand";
import { getAllCategoriesWithSubcategories } from "@/axios/service";
import { ServiceCategory, Subcategory } from "@/types";
import { GlobalStore, ServiceState } from "@/types";

export const serviceSlice: StateCreator<GlobalStore, [], [], ServiceState> = (
  set,
  get
) => ({
  availableCategories: [],
  setAvailableCategories: (categories: ServiceCategory[]) =>
    set({ availableCategories: categories }),
  selectedServices: [],
  setSelectedServices: (services: Subcategory[]) =>
    set({ selectedServices: services }),
  // Fetch categories on store initialization
  // (async () => {
  //   try {
  //     const categories = await getAllCategoriesWithSubcategories();
  //     set({ availableCategories: categories });
  //   } catch (error) {
  //     console.error("Failed to fetch service categories:", error);
  //   }
  // })(),


});
