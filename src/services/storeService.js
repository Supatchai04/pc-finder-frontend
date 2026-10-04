import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

export const storeService = {
  profile: async (shopId) => {
    if (useMock) {
      return mockApi.stores.profile(shopId);
    }

    return (
      await apiClient.get(
        endpoints.stores.profile(shopId)
      )
    ).data;
  },

  products: async (
    shopId,
    params = {}
  ) => {
    if (useMock) {
      return mockApi.stores.products(
        shopId,
        params
      );
    }

    return (
      await apiClient.get(
        endpoints.stores.products(shopId),
        { params }
      )
    ).data;
  },
};