import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

export const shopService = {
  dashboard: async () => useMock ? mockApi.shop.dashboard() : (await apiClient.get(endpoints.stores.dashboard)).data,
  products: async (params = {}) => useMock ? mockApi.shop.products(params) : (await apiClient.get(endpoints.stores.ownProducts, { params })).data,
  register: async (payload) => {
    if (useMock) return mockApi.shop.register(payload);
    return (await apiClient.post(endpoints.stores.register, payload)).data;
  },
  profileMe: async () => {
  if (useMock) {
    return mockApi.shop.profileMe();
  }

  return (
    await apiClient.get(
      '/api/stores/profile/me'
    )
  ).data;
},
  updateProfile: async (payload) => useMock ? mockApi.shop.updateProfile(payload) : (await apiClient.put(endpoints.stores.ownProfile, payload)).data,
  createProduct: async (payload) => useMock ? mockApi.shop.createProduct(payload) : (await apiClient.post(endpoints.stores.ownProducts, payload)).data,
  updateProduct: async (shopProductId, payload) => useMock ? { status: 'success', data: { shopProductId, ...payload } } : (await apiClient.put(endpoints.stores.ownProduct(shopProductId), payload)).data,
  deleteProduct: async (shopProductId) => {
    if (useMock) return { status: 'success' };
    try {
      return (await apiClient.delete(endpoints.stores.ownProductDelete(shopProductId))).data;
    } catch (error) {
      // API LIST (4) uses singular /api/store for DELETE while PUT uses /api/stores.
      // Retry plural only when the singular route itself appears unavailable.
      if ([404, 405].includes(error?.response?.status)) {
        return (await apiClient.delete(endpoints.stores.ownProduct(shopProductId))).data;
      }
      throw error;
    }
  },
};
