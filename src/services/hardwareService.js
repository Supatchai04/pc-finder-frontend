import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { mockApi } from '../mocks/mockApi';
import { isMockEnabled } from '../utils/api';

const useMock = isMockEnabled();

const clean = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const pick = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && clean(value) !== '') {
      return value;
    }
  }
  return '';
};

/*
 * ทำให้ Mock autocomplete มี shape เหมือน Backend จริง
 * เพื่อให้หน้า Add Product สามารถ autofill nested JSON ได้เหมือน production
 */
const buildMockAutocompleteItem = (item, category) => {
  const specs = item?.specs && typeof item.specs === 'object' ? item.specs : {};
  const masterId = item?.masterId ?? item?.id;
  const displayName = item?.displayName || item?.name || '';

  const result = {
    masterId,
    displayName,
    brand: item?.brand || '',
  };

  if (category === 'CPU') {
    result.cpus = {
      masterId,
      family: pick(item?.family, specs?.family),
      processorClass: pick(
        item?.processorClass,
        item?.processor,
        specs?.processorClass,
        specs?.processor,
        specs?.processor_class,
      ),
      socket: pick(item?.socket, specs?.socket),
    };
  }

  if (category === 'MAINBOARD') {
    result.mainboards = {
      masterId,
      serie: pick(item?.serie, item?.series, specs?.serie, specs?.series),
      formFactor: pick(item?.formFactor, item?.form_factor, specs?.formFactor, specs?.form_factor),
      socket: pick(item?.socket, specs?.socket),
      chipset: pick(item?.chipset, specs?.chipset),
    };
  }

  if (category === 'VGA') {
    result.vgas = {
      masterId,
      series: pick(item?.series, item?.serie, specs?.series, specs?.serie),
      chipset: pick(item?.chipset, specs?.chipset),
      vramSize: pick(item?.vramSize, item?.vram_size, specs?.vramSize, specs?.vram_size),
    };
  }

  if (category === 'RAM') {
    result.rams = {
      masterId,
      model: pick(item?.model, specs?.model),
      ramType: pick(item?.ramType, item?.ram_type, specs?.ramType, specs?.ram_type),
      capacityGB: pick(item?.capacityGB, item?.capacity_gb, specs?.capacityGB, specs?.capacity_gb),
      busSpeed: pick(item?.busSpeed, item?.bus_speed, specs?.busSpeed, specs?.bus_speed),
    };
  }

  if (category === 'STORAGE') {
    result.storages = {
      masterId,
      storageType: pick(item?.storageType, item?.storage_type, specs?.storageType, specs?.storage_type),
      interfaceType: pick(item?.interfaceType, item?.interface_type, specs?.interfaceType, specs?.interface_type),
      capacityGB: pick(item?.capacityGB, item?.capacity_gb, specs?.capacityGB, specs?.capacity_gb),
      model: pick(item?.model, specs?.model),
    };
  }

  if (category === 'PSU') {
    result.psus = {
      masterId,
      model: pick(item?.model, specs?.model),
      watt: pick(item?.watt, specs?.watt),
      standard80Plus: pick(
        item?.standard80Plus,
        item?.standard_80_plus,
        specs?.standard80Plus,
        specs?.standard_80_plus,
      ),
    };
  }

  if (category === 'COOLER') {
    result.coolers = {
      masterId,
      model: pick(item?.model, specs?.model),
      coolerType: pick(item?.coolerType, item?.cooler_type, specs?.coolerType, specs?.cooler_type, specs?.type),
      socketSupport: pick(
        item?.socketSupport,
        item?.socket_support,
        item?.supportedSockets,
        specs?.socketSupport,
        specs?.socket_support,
        specs?.supportedSockets,
      ),
    };
  }

  return result;
};

export const hardwareService = {
  /*
   * Add Product ต้องเรียก Backend autocomplete จริงตาม brief
   * แม้เครื่อง local จะเปิด VITE_USE_MOCK_AUTH=true เพื่อจำลอง role SHOP
   * จะได้ไม่ใช้ mock ที่มี Master Data ไม่ครบ
   */
  shopAutocomplete: async (category, keyword) => (
    await apiClient.get(
      endpoints.hardware.autocomplete(category),
      { params: { keyword } },
    )
  ).data,

  // fallback สำหรับ Add Product เท่านั้น — ไม่เปลี่ยน behavior ของหน้าอื่น
  shopMasterDetail: async (masterId) => (
    await apiClient.get(endpoints.hardware.masterDetail(masterId))
  ).data,

  shopDetail: async (category, id) => (
    await apiClient.get(endpoints.hardware.detail(category, id))
  ).data,

  list: async (category, params = {}) => useMock
    ? mockApi.hardware.list(category, params)
    : (await apiClient.get(endpoints.hardware.list(category), { params })).data,

  autocomplete: async (category, keyword) => {
    if (!useMock) {
      return (
        await apiClient.get(
          endpoints.hardware.autocomplete(category),
          { params: { keyword } },
        )
      ).data;
    }

    /*
     * Mock autocomplete เดิมส่งแค่ id/name/brand
     * จึงเติม Master Data ไม่ครบ แม้ Dropdown จะขึ้นแล้ว
     * ตรงนี้ enrich ด้วยข้อมูลเต็มจาก mock list แล้วแปลงให้เหมือน Backend ใหม่
     */
    const [autocompleteResponse, listResponse] = await Promise.all([
      mockApi.hardware.autocomplete(category, keyword),
      mockApi.hardware.list(category, {}),
    ]);

    const suggestions = Array.isArray(autocompleteResponse?.data)
      ? autocompleteResponse.data
      : [];

    const fullRows = Array.isArray(listResponse?.data)
      ? listResponse.data
      : [];

    const rows = suggestions.map((suggestion) => {
      const suggestionId = suggestion?.masterId ?? suggestion?.id;

      const fullItem = fullRows.find((item) =>
        String(item?.masterId ?? item?.id) === String(suggestionId)
      );

      return buildMockAutocompleteItem(
        {
          ...(fullItem || {}),
          ...suggestion,
          specs: fullItem?.specs || suggestion?.specs || {},
        },
        category,
      );
    });

    return {
      ...autocompleteResponse,
      data: rows,
    };
  },

  // endpoint เดิม เก็บไว้ไม่ให้หน้าอื่นพัง
  detail: async (category, id) => useMock
    ? { status: 'success', data: null }
    : (await apiClient.get(endpoints.hardware.detail(category, id))).data,

  // Backend brief ล่าสุด: GET /api/hardware/:masterId/detail
  masterDetail: async (masterId) => {
    if (useMock) {
      if (typeof mockApi.hardware.masterDetail === 'function') {
        return mockApi.hardware.masterDetail(masterId);
      }
      throw new Error('Mock API ยังไม่มี hardware.masterDetail');
    }
    return (await apiClient.get(endpoints.hardware.masterDetail(masterId))).data;
  },

  matchStores: async (payload) => useMock
    ? mockApi.hardware.matchStores(payload)
    : (await apiClient.post(endpoints.hardware.matchStores, payload)).data,

  summary: async (shopProductIds = []) => {
    if (useMock) {
      if (typeof mockApi.hardware.summary === 'function') {
        return mockApi.hardware.summary(shopProductIds);
      }
      return {
        status: 'success',
        data: {
          summary: { totalItems: 0, totalPrice: 0 },
          items: [],
        },
      };
    }

    const body = shopProductIds.length === 1
      ? { shopProductId: shopProductIds[0] }
      : { shopProductId: shopProductIds };

    return (await apiClient.post(endpoints.builds.summary, body)).data;
  },
};
