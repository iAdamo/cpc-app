import { StateCreator } from "zustand";
import {
  getAllCategoriesWithSubcategories,
  getServiceById,
} from "@/axios/service";
import { Category, Subcategory } from "@/types";
import { GlobalStore, ServiceState } from "@/types";

export const serviceSlice: StateCreator<GlobalStore, [], [], ServiceState> = (
  set,
  get
) => ({
  availableCategories: [],
  setAvailableCategories: (categories: Category[]) =>
    set({ availableCategories: categories }),
  selectedServices: [],
  setSelectedServices: (services: Subcategory[]) =>
    set({ selectedServices: services }),
  fetchServiceById: async (serviceId: string) => {
    try {
      const service = await getServiceById(serviceId);
      return service;
    } catch (error) {
      console.error("Failed to fetch service by ID:", error);
      throw error;
    }
  },
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
