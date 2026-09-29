import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

export const hardwareService = {
  list: async (category, params = {}) => useMock
    ? mockApi.hardware.list(category, params)
    : (await apiClient.get(endpoints.hardware.list(category), { params })).data,

  autocomplete: async (category, keyword) => useMock
    ? mockApi.hardware.autocomplete(category, keyword)
    : (await apiClient.get(endpoints.hardware.autocomplete(category), { params: { keyword } })).data,

  // endpoint เดิม เก็บไว้ไม่ให้หน้าอื่นพัง
  detail: async (category, id) => useMock
    ? { status: 'success', data: null }
    : (await apiClient.get(endpoints.hardware.detail(category, id))).data,

  // Backend brief ล่าสุด: GET /api/hardware/:masterId/detail
  masterDetail: async (masterId) => {
    if (useMock) {
      if (typeof mockApi.hardware.masterDetail === 'function') {
        return mockApi.hardware.masterDetail(masterId);
      }
      throw new Error('Mock API ยังไม่มี hardware.masterDetail');
    }
    return (await apiClient.get(endpoints.hardware.masterDetail(masterId))).data;
  },

  matchStores: async (payload) => useMock
    ? mockApi.hardware.matchStores(payload)
    : (await apiClient.post(endpoints.hardware.matchStores, payload)).data,

  summary: async (shopProductIds = []) => {
    if (useMock) {
      if (typeof mockApi.hardware.summary === 'function') {
        return mockApi.hardware.summary(shopProductIds);
      }
      return { status: 'success', data: { summary: { totalItems: 0, totalPrice: 0 }, items: [] } };
    }

    const body = shopProductIds.length === 1
      ? { shopProductId: shopProductIds[0] }
      : { shopProductId: shopProductIds };

    return (await apiClient.post(endpoints.builds.summary, body)).data;
  },
};
