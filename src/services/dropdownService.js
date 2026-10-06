import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import thaiAddressData from '../data/thai-address.json';


/*
 * thai-address.json structure:
 * [
 *   {
 *     name_th: 'กรุงเทพมหานคร',
 *     districts: [
 *       {
 *         name_th: 'เขตพระนคร',
 *         sub_districts: [
 *           {
 *             name_th: 'พระบรมมหาราชวัง',
 *             zip_code: 10200
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * ]
 */

const activeOnly = (items = []) =>
  Array.isArray(items)
    ? items.filter((item) => !item?.deleted_at)
    : [];

const findProvince = (provinceName) =>
  activeOnly(thaiAddressData).find(
    (province) => province?.name_th === provinceName
  );

const findDistrict = (provinceName, districtName) => {
  const province = findProvince(provinceName);

  return activeOnly(province?.districts).find(
    (district) => district?.name_th === districtName
  );
};

const findSubDistrict = (
  provinceName,
  districtName,
  subDistrictName
) => {
  const district = findDistrict(
    provinceName,
    districtName
  );

  return activeOnly(
    district?.sub_districts
  ).find(
    (subDistrict) =>
      subDistrict?.name_th ===
      subDistrictName
  );
};

export const dropdownService = {
  /*
   * Existing Backend dropdowns
   * เก็บของเดิมไว้ทั้งหมด
   */
  categories: async () => {
    return (
      await apiClient.get(
        endpoints.dropdowns.categories
      )
    ).data;
  },

  shopStatuses: async () => {
    return (
      await apiClient.get(
        endpoints.dropdowns.shopStatuses
      )
    ).data;
  },

  userRoles: async () => {
    return (
      await apiClient.get(
        endpoints.dropdowns.userRoles
      )
    ).data;
  },

  userStatuses: async () => {
    return (
      await apiClient.get(
        endpoints.dropdowns.userStatuses
      )
    ).data;
  },

  productStatuses: async () => {
    return (
      await apiClient.get(
        endpoints.dropdowns.productStatuses
      )
    ).data;
  },

  /*
   * Thai address cascading dropdown
   */

  provinces: () => {
    return activeOnly(
      thaiAddressData
    ).map(
      (province) =>
        province.name_th
    );
  },

  districts: (provinceName) => {
    if (!provinceName) {
      return [];
    }

    const province =
      findProvince(
        provinceName
      );

    return activeOnly(
      province?.districts
    ).map(
      (district) =>
        district.name_th
    );
  },

  subDistricts: (
    provinceName,
    districtName
  ) => {
    if (
      !provinceName ||
      !districtName
    ) {
      return [];
    }

    const district =
      findDistrict(
        provinceName,
        districtName
      );

    return activeOnly(
      district?.sub_districts
    ).map(
      (subDistrict) =>
        subDistrict.name_th
    );
  },

  zipCode: (
    provinceName,
    districtName,
    subDistrictName
  ) => {
    if (
      !provinceName ||
      !districtName ||
      !subDistrictName
    ) {
      return '';
    }

    const subDistrict =
      findSubDistrict(
        provinceName,
        districtName,
        subDistrictName
      );

    return subDistrict?.zip_code != null
      ? String(
          subDistrict.zip_code
        )
      : '';
  },

  /*
   * เผื่อใช้ปักหมุดอัตโนมัติในอนาคต
   */
  addressDetail: (
    provinceName,
    districtName,
    subDistrictName
  ) => {
    const subDistrict =
      findSubDistrict(
        provinceName,
        districtName,
        subDistrictName
      );

    if (!subDistrict) {
      return null;
    }

    return {
      province:
        provinceName,
      district:
        districtName,
      subDistrict:
        subDistrictName,
      zipCode:
        subDistrict?.zip_code != null
          ? String(
              subDistrict.zip_code
            )
          : '',
      latitude:
        subDistrict?.lat ?? null,
      longitude:
        subDistrict?.long ?? null,
    };
  },
};
