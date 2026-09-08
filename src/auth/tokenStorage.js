const ACCESS_KEY = 'pcfinder_access_token';
const REFRESH_KEY = 'pcfinder_refresh_token';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (tokens = {}) => {
    const { accessToken, refreshToken } = tokens;
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
