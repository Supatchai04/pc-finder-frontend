import axios from 'axios';
import { tokenStorage } from '../auth/tokenStorage';
import { endpoints } from './endpoints';
import { getApiBaseUrl } from '../utils/api';

const baseURL = getApiBaseUrl().replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

let refreshPromise = null;

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // ให้ browser/Axios ใส่ multipart boundary เองเมื่อส่ง FormData
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refreshToken = tokenStorage.getRefreshToken();
    const isRefreshRequest = original?.url?.includes(endpoints.auth.refresh);

    if (error.response?.status !== 401 || original?._retry || !refreshToken || isRefreshRequest) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}${endpoints.auth.refresh}`, { refreshToken }, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, timeout: 30000 })
          .then((res) => res.data?.data?.accessToken)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;
      if (!newAccessToken) throw new Error('ไม่พบ Access Token ใหม่');
      tokenStorage.setTokens({ accessToken: newAccessToken });
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      tokenStorage.clear();
      window.dispatchEvent(new Event('pcfinder:auth-expired'));
      return Promise.reject(refreshError);
    }
  },
);
