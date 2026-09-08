import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

export const adminService = {
  dashboard: async () => useMock ? mockApi.admin.dashboard() : (await apiClient.get(endpoints.admin.dashboard)).data,
  users: async (params = {}) => useMock ? mockApi.admin.users(params) : (await apiClient.get(endpoints.admin.users, { params })).data,
  stores: async (params = {}) => useMock ? mockApi.admin.stores(params) : (await apiClient.get(endpoints.admin.stores, { params })).data,
  store: async (shopId) => useMock ? mockApi.admin.store(shopId) : (await apiClient.get(endpoints.admin.store(shopId))).data,
  updateUserStatus: async (userId, userStatus) => useMock ? mockApi.admin.updateUserStatus(userId, userStatus) : (await apiClient.put(endpoints.admin.user(userId), { userStatus })).data,
  updateStoreStatus: async (shopId, shopStatus) => useMock ? mockApi.admin.updateStoreStatus(shopId, shopStatus) : (await apiClient.put(endpoints.admin.storeStatus(shopId), { shopStatus })).data,
};
