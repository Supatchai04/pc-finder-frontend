import { apiClient } from '../api/client';

const locationEndpoint = '/api/users/location';

export const userLocationService = {
  get: async () => (await apiClient.get(locationEndpoint)).data,
  update: async ({ latitude, longitude }) => (
    await apiClient.put(locationEndpoint, { latitude, longitude })
  ).data,
};
