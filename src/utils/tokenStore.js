const ACCESS_TOKEN_KEY = 'pcfinder_access_token'
const REFRESH_TOKEN_KEY = 'pcfinder_refresh_token'

export const tokenStore = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  setAccessToken: (accessToken) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
