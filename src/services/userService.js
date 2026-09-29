import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

export const userService = {
  /* =========================================================
     FAVORITE PRODUCTS
     ========================================================= */

  favoriteProducts: async (params = {}) => {
    if (useMock) {
      return mockApi.users.favoriteProducts(params);
    }

    return (
      await apiClient.get(
        endpoints.users.favoriteProducts,
        { params }
      )
    ).data;
  },

  addFavoriteProduct: async (shopProductId) => {
    if (useMock) {
      return mockApi.users.addFavoriteProduct(shopProductId);
    }

    return (
      await apiClient.post(
        endpoints.users.favoriteProducts,
        { shopProductId }
      )
    ).data;
  },

  removeFavoriteProduct: async (shopProductId) => {
    if (useMock) {
      return mockApi.users.removeFavoriteProduct(shopProductId);
    }

    return (
      await apiClient.delete(
        endpoints.users.favoriteProduct(shopProductId)
      )
    ).data;
  },


  /* =========================================================
     FAVORITE STORES
     ========================================================= */

  favoriteStores: async (params = {}) => {
    if (useMock) {
      return mockApi.users.favoriteStores(params);
    }

    return (
      await apiClient.get(
        endpoints.users.favoriteStores,
        { params }
      )
    ).data;
  },

  addFavoriteStore: async (shopId) => {
    if (useMock) {
      return mockApi.users.addFavoriteStore(shopId);
    }

    return (
      await apiClient.post(
        endpoints.users.favoriteStores,
        { shopId }
      )
    ).data;
  },

  removeFavoriteStore: async (shopId) => {
    if (useMock) {
      return mockApi.users.removeFavoriteStore(shopId);
    }

    return (
      await apiClient.delete(
        endpoints.users.favoriteStore(shopId)
      )
    ).data;
  },


  /* =========================================================
     SPECS
     ========================================================= */

  specs: async (params = {}) => {
    if (useMock) {
      return mockApi.users.specs();
    }

    return (
      await apiClient.get(
        endpoints.users.specs,
        { params }
      )
    ).data;
  },

  spec: async (specId) => {
    if (useMock) {
      return {
        status: 'success',
        data: null,
      };
    }

    return (
      await apiClient.get(
        endpoints.users.spec(specId)
      )
    ).data;
  },

  createSpec: async (payload) => {
    if (useMock) {
      return {
        status: 'success',
        data: {
          specId: Date.now(),
          ...payload,
        },
      };
    }

    return (
      await apiClient.post(
        endpoints.users.specs,
        payload
      )
    ).data;
  },

  addSpecItem: async (specId, shopProductId) => {
    if (useMock) {
      return {
        status: 'success',
      };
    }

    return (
      await apiClient.post(
        endpoints.users.specItems(specId),
        { shopProductId }
      )
    ).data;
  },

  removeSpecItem: async (specId, shopProductId) => {
    if (useMock) {
      return {
        status: 'success',
      };
    }

    return (
      await apiClient.delete(
        endpoints.users.specItem(
          specId,
          shopProductId
        )
      )
    ).data;
  },

  deleteSpec: async (specId) => {
    if (useMock) {
      return {
        status: 'success',
      };
    }

    return (
      await apiClient.delete(
        endpoints.users.spec(specId)
      )
    ).data;
  },
};