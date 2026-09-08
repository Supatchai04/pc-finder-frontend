import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

export const userService = {
  favoriteProducts: async (params = {}) => useMock ? mockApi.users.favorites() : (await apiClient.get(endpoints.users.favoriteProducts, { params })).data,
  addFavoriteProduct: async (shopProductId) => useMock ? { status: 'success' } : (await apiClient.post(endpoints.users.favoriteProducts, { shopProductId })).data,
  removeFavoriteProduct: async (shopProductId) => useMock ? { status: 'success' } : (await apiClient.delete(endpoints.users.favoriteProduct(shopProductId))).data,

  favoriteStores: async (params = {}) => useMock ? mockApi.users.favorites() : (await apiClient.get(endpoints.users.favoriteStores, { params })).data,
  addFavoriteStore: async (shopId) => useMock ? { status: 'success', data: { shopId } } : (await apiClient.post(endpoints.users.favoriteStores, { shopId })).data,
  removeFavoriteStore: async (shopId) => useMock ? { status: 'success' } : (await apiClient.delete(endpoints.users.favoriteStore(shopId))).data,

  specs: async (params = {}) => useMock ? mockApi.users.specs() : (await apiClient.get(endpoints.users.specs, { params })).data,
  spec: async (specId) => useMock ? { status: 'success', data: null } : (await apiClient.get(endpoints.users.spec(specId))).data,
  createSpec: async (payload) => useMock ? { status: 'success', data: { specId: Date.now(), ...payload } } : (await apiClient.post(endpoints.users.specs, payload)).data,
  addSpecItem: async (specId, shopProductId) => useMock ? { status: 'success' } : (await apiClient.post(endpoints.users.specItems(specId), { shopProductId })).data,
  removeSpecItem: async (specId, shopProductId) => useMock ? { status: 'success' } : (await apiClient.delete(endpoints.users.specItem(specId, shopProductId))).data,
  deleteSpec: async (specId) => useMock ? { status: 'success' } : (await apiClient.delete(endpoints.users.spec(specId))).data,
};
