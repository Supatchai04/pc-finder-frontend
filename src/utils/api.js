export const isMockEnabled = () => {
  const value = import.meta.env.VITE_USE_MOCK_AUTH ?? import.meta.env.VITE_USE_MOCK_API;
  return String(value).toLowerCase() === 'true';
};

export const getApiBaseUrl = () => (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://hardware-store-search-backend.onrender.com'
);

export const getApiErrorMessage = (error, fallback = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง') => (
  error?.response?.data?.message ||
  error?.response?.data?.errorDetails ||
  error?.message ||
  fallback
);
