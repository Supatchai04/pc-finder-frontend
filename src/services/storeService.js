import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

export const storeService = {
  profile: async (shopId) => useMock ? mockApi.stores.profile(shopId) : (await apiClient.get(endpoints.stores.profile(shopId))).data,
  products: async (shopId, params = {}) => useMock ? mockApi.stores.products(shopId, params) : (await apiClient.get(endpoints.stores.products(shopId), { params })).data,
};
