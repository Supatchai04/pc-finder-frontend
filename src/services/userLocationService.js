import { apiClient } from '../api/client';
import { authService } from './authService';

const locationEndpoint = '/api/users/location';
const storagePrefix = 'pcfinder:saved-user-location:';

const coordinate = (value, limit) => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const result = Number(value);
  return Number.isFinite(result) && Math.abs(result) <= limit ? result : null;
};

export const getLocationCoordinates = (payload) => {
  const data = payload?.data ?? payload;
  const candidates = [
    data?.location, data?.userLocation, data?.user?.location, data?.user,
    data?.profile?.location, data?.profile,
    data, payload?.location, payload?.userLocation, payload,
  ];
  for (const item of candidates) {
    if (!item || typeof item !== 'object') continue;
    const latitude = coordinate(item.latitude ?? item.lat, 90);
    const longitude = coordinate(item.longitude ?? item.lng ?? item.lon, 180);
    if (latitude !== null && longitude !== null) return { latitude, longitude };
  }
  return null;
};

const storageKey = (user) => {
  const id = user?.userId ?? user?.id ?? user?.email;
  return id === null || id === undefined || String(id).trim() === ''
    ? null
    : `${storagePrefix}${encodeURIComponent(String(id).trim().toLowerCase())}`;
};

const readCached = (user) => {
  const key = storageKey(user);
  if (!key || typeof window === 'undefined') return null;
  try {
    return getLocationCoordinates(JSON.parse(window.localStorage.getItem(key) || 'null'));
  } catch {
    return null;
  }
};

const cacheSaved = (user, position) => {
  const key = storageKey(user);
  const valid = getLocationCoordinates(position);
  if (!key || !valid || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(valid));
  } catch {
    // Browser storage may be blocked; the backend save is still authoritative.
  }
};

// Backend GET is optional in some deployments: PUT must remain usable if GET is absent.
const loadSaved = async (user) => {
  let readError = null;
  try {
    const response = await userLocationService.get();
    if (response?.status && response.status !== 'success') {
      throw new Error(response?.message || 'โหลดพิกัดไม่สำเร็จ');
    }
    const position = getLocationCoordinates(response);
    if (position) {
      cacheSaved(user, position);
      return { position, source: 'server', readError: null };
    }
    // An empty GET response might mean location is exposed on /api/auth/me instead.
  } catch (error) {
    readError = error;
  }

  try {
    const profile = await authService.me();
    const position = getLocationCoordinates(profile);
    if (position) {
      cacheSaved(user, position);
      return { position, source: 'server', readError: null };
    }
  } catch (error) {
    if (!readError) readError = error;
  }

  const cached = readCached(user);
  return {
    position: cached,
    source: cached ? 'device' : 'none',
    readError,
  };
};

export const userLocationService = {
  get: async () => (await apiClient.get(locationEndpoint, { timeout: 8000 })).data,
  update: async ({ latitude, longitude }) => (
    await apiClient.put(locationEndpoint, { latitude, longitude })
  ).data,
  loadSaved,
  cacheSaved,
};
