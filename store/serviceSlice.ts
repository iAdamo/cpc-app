import { StateCreator } from "zustand";
import {
  getAllCategoriesWithSubcategories,
  getServiceById,
  getServicesByProvider,
  createService,
  updateService,
  deleteService,
} from "@/axios/service";
import { Category, Subcategory, ServiceData } from "@/types";
import { GlobalStore, ServiceState } from "@/types";

export const serviceSlice: StateCreator<GlobalStore, [], [], ServiceState> = (
  set,
  get
) => ({
  availableCategories: [],
  selectedServices: [],
  MyProjects: [],
  OtherProjects: [],

  setAvailableCategories: (categories: Category[]) =>
    set({ availableCategories: categories }),
  setSelectedServices: (services: Subcategory[]) =>
    set({ selectedServices: services }),
  setMyProjects: (projects: ServiceData[]) => set({ MyProjects: projects }),

  createService: async (data: FormData) => {
    set({ isLoading: true });
    try {
      const newProject = await createService(data);
      const currentProjects = get().MyProjects;
      const updatedProjects = [newProject, ...currentProjects];
      set({ MyProjects: updatedProjects });
      return newProject;
    } catch (error) {
      console.error("Failed to create service:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  updateService: async (id: string, data: FormData) => {
    set({ isLoading: true });
    try {
      const updatedProject = await updateService(id, data);
      const currentProjects = get().MyProjects;
      const updatedProjects = currentProjects.map((project) =>
        project._id === id ? updatedProject : project
      );
      set({ MyProjects: updatedProjects });
      return updatedProject;
    } catch (error) {
      console.error("Failed to update service:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  fetchServiceById: async (serviceId: string) => {
    set({ isLoading: true });
    try {
      const service = await getServiceById(serviceId);
      return service;
    } catch (error) {
      console.error("Failed to fetch service by ID:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  fetchServicesByProvider: async (providerId: string) => {
    set({ isLoading: true });
    try {
      const projects = await getServicesByProvider(providerId);
      const user = get().user;
      // Ensure only the provider can set their projects
      if (user?.activeRoleId?._id === providerId) {
        set({ MyProjects: projects });
      }
      return projects;
    } catch (error) {
      console.error("Failed to fetch services by provider:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  handleToggleActive: async (service: ServiceData) => {
    try {
      const updatedData = new FormData();
      updatedData.append("isActive", (!service.isActive).toString());
      const updatedService = await get().updateService(
        service._id,
        updatedData
      );
      if (updatedService) {
        const updatedProjects = get().MyProjects.map((proj) =>
          proj._id === updatedService._id ? updatedService : proj
        );
        set({ MyProjects: updatedProjects });
      }
    } catch (error) {
      console.error("Failed to toggle service active status:", error);
    }
  },
});
