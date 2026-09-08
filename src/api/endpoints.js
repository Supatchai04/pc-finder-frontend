export const endpoints = {
  auth: {
    google: '/api/auth/google',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    refresh: '/api/auth/refresh',
  },
  hardware: {
    list: (category) => `/api/hardware/${category}`,
    autocomplete: (category) => `/api/hardware/${category}/autocomplete`,
    detail: (category, id) => `/api/hardware/${category}/${id}`,
    matchStores: '/api/hardware/match-stores',
  },
  builds: {
    summary: '/api/builds/summary',
  },
  stores: {
    profile: (shopId) => `/api/stores/${shopId}/profile`,
    products: (shopId) => `/api/stores/${shopId}/products`,
    dashboard: '/api/stores/dashboard',
    register: '/api/users/shopRegister',
    ownProfile: '/api/stores/profile',
    ownProducts: '/api/stores/products',
    ownProduct: (shopProductId) => `/api/stores/products/${shopProductId}`,
    // API LIST (4) ระบุ DELETE เป็น /api/store/products/:shopProductId (store เอกพจน์)
    ownProductDelete: (shopProductId) => `/api/store/products/${shopProductId}`,
  },
  users: {
    favoriteProducts: '/api/users/favorites/products',
    favoriteProduct: (shopProductId) => `/api/users/favorites/products/${shopProductId}`,
    favoriteStores: '/api/users/favorites/stores',
    favoriteStore: (shopId) => `/api/users/favorites/stores/${shopId}`,
    specs: '/api/users/specs',
    spec: (specId) => `/api/users/specs/${specId}`,
    specItems: (specId) => `/api/users/specs/${specId}/items`,
    specItem: (specId, shopProductId) => `/api/users/specs/${specId}/items/${shopProductId}`,
  },
  admin: {
    dashboard: '/api/admin/dashboard',
    // Endpoint ใหม่จาก Backend update 03/09/2026
    users: '/api/users/users',
    user: (userId) => `/api/users/users/${userId}`,
    stores: '/api/stores/stores',
    store: (shopId) => `/api/stores/stores/${shopId}`,
    storeStatus: (shopId) => `/api/stores/stores/${shopId}/status`,
  },
};
