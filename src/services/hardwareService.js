import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

export const hardwareService = {
  list: async (category, params = {}) => {
    if (useMock) return mockApi.hardware.list(category, params);
    return (await apiClient.get(endpoints.hardware.list(category), { params })).data;
  },
  autocomplete: async (category, keyword) => {
    if (useMock) return mockApi.hardware.autocomplete(category, keyword);
    return (await apiClient.get(endpoints.hardware.autocomplete(category), { params: { keyword } })).data;
  },
  detail: async (category, id) => {
    if (useMock) return { status: 'success', data: null };
    return (await apiClient.get(endpoints.hardware.detail(category, id))).data;
  },
  matchStores: async (payload) => {
    if (useMock) return mockApi.hardware.matchStores(payload);
    return (await apiClient.post(endpoints.hardware.matchStores, payload)).data;
  },
  summary: async (shopProductIds = []) => {
    if (useMock) return { status: 'success', data: { summary: { totalItems: 0, totalPrice: 0 }, items: [] } };
    const body = shopProductIds.length === 1
      ? { shopProductId: shopProductIds[0] }
      : { shopProductId: shopProductIds };
    return (await apiClient.post(endpoints.builds.summary, body)).data;
  },
};
