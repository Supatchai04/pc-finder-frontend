import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

export const authService = {
  googleLogin: async (googleToken) => {
    if (useMock) return mockApi.auth.googleLogin();
    return (await apiClient.post(endpoints.auth.google, { googleToken })).data;
  },
  me: async () => {
    if (useMock) return mockApi.auth.me();
    return (await apiClient.get(endpoints.auth.me)).data;
  },
  logout: async (refreshToken) => {
    if (useMock) return mockApi.auth.logout();
    return (await apiClient.post(endpoints.auth.logout, { refreshToken }, { timeout: 5000 })).data;
  },
};
