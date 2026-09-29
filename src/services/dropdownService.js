import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export const dropdownService = {
  categories: async () => {
    return (await apiClient.get(endpoints.dropdowns.categories)).data;
  },

  shopStatuses: async () => {
    return (await apiClient.get(endpoints.dropdowns.shopStatuses)).data;
  },

  userRoles: async () => {
    return (await apiClient.get(endpoints.dropdowns.userRoles)).data;
  },

  userStatuses: async () => {
    return (await apiClient.get(endpoints.dropdowns.userStatuses)).data;
  },

  productStatuses: async () => {
    return (await apiClient.get(endpoints.dropdowns.productStatuses)).data;
  },
};