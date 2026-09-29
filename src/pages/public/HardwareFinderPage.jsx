import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';
import HardwareSidebar from '../../components/hardware/HardwareSidebar';
import PaginationBar from '../../components/ui/PaginationBar';
import LoadingState from '../../components/ui/LoadingState';

import { hardwareService } from '../../services/hardwareService';
import { dropdownService } from '../../services/dropdownService';
import { getApiErrorMessage } from '../../utils/api';
import { buildStorage } from '../../utils/buildStorage';

const fallbackCategories = [
  { value: 'CPU', label: 'ซีพียู (CPU)' },
  { value: 'MAINBOARD', label: 'เมนบอร์ด (Mainboard)' },
  { value: 'VGA', label: 'การ์ดจอ (VGA)' },
  { value: 'RAM', label: 'แรม (RAM)' },
  { value: 'STORAGE', label: 'อุปกรณ์จัดเก็บข้อมูล (Storage)' },
  { value: 'PSU', label: 'เพาเวอร์ซัพพลาย (PSU)' },
  { value: 'COOLER', label: 'ชุดระบายความร้อน (Cooler)' },
];

const fallbackCategoryValues = fallbackCategories.map((item) => item.value);

const categoryUiLabels = {
  CPU: 'CPU',
  MAINBOARD: 'Mainboard',
  VGA: 'VGA Card',
  RAM: 'Memory',
  STORAGE: 'Storage',
  PSU: 'Power Supply',
  COOLER: 'CPU Cooler',
};

const specColumns = {
  CPU: [
    ['family', 'Family'],
    ['socket', 'Socket'],
  ],
  RAM: [
    ['capacityGB', 'Capacity'],
    ['busSpeed', 'Bus Speed'],
  ],
  VGA: [
    ['vramSize', 'VRAM'],
    ['chipset', 'Chipset'],
  ],
  MAINBOARD: [
    ['socket', 'Socket'],
    ['chipset', 'Chipset'],
  ],
  STORAGE: [
    ['capacityGB', 'Capacity'],
    ['interfaceType', 'Interface'],
  ],
  PSU: [
    ['watt', 'Watt'],
    ['standard80Plus', '80 Plus'],
  ],
};

const specAliases = {
  busSpeed: ['busSpeed', 'bus_speed'],
  vramSize: ['vramSize', 'vram_size'],
  interfaceType: ['interfaceType', 'interface_type'],
  capacityGB: ['capacityGB', 'capacity_gb'],
  standard80Plus: ['standard80Plus', 'standard_80_plus'],
};

const getSpecValue = (specs, key) => {
  if (!key) return '-';

  const keys = specAliases[key] || [key];

  for (const candidate of keys) {
    if (specs?.[candidate] != null && specs[candidate] !== '') {
      return specs[candidate];
    }
  }

  return '-';
};

const getDisplayName = (item) =>
  item?.displayName ||
  item?.displayname ||
  item?.hardwareName ||
  item?.name ||
  '-';

const getId = (item) => item?.masterId ?? item?.id;

const getPriceText = (price) => {
  if (price == null) return '-';

  if (typeof price === 'object') {
    const min = Number(price.min || 0);
    const max = Number(price.max || 0);

    if (min && max && min !== max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()}`;
    }

    const value = min || max;
    return value ? value.toLocaleString() : '-';
  }

  const number = Number(price);
  return Number.isFinite(number) ? number.toLocaleString() : '-';
};

const getItemSpecs = (item, category) => {
  if (item?.specs && typeof item.specs === 'object') {
    return item.specs;
  }

  const nestedKeyByCategory = {
    CPU: 'cpus',
    MAINBOARD: 'mainboards',
    VGA: 'vgas',
    RAM: 'rams',
    STORAGE: 'storages',
    PSU: 'psus',
    COOLER: 'coolers',
  };

  const nestedKey = nestedKeyByCategory[category];

  if (nestedKey && item?.[nestedKey] && typeof item[nestedKey] === 'object') {
    return item[nestedKey];
  }

  return item || {};
};

export default function HardwareFinderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCategory = String(
    searchParams.get('category') || 'VGA'
  ).toUpperCase();

  const [categoryOptions, setCategoryOptions] = useState(fallbackCategories);
  const [category, setCategoryState] = useState(
    fallbackCategoryValues.includes(initialCategory) ? initialCategory : 'VGA'
  );

  const [brand, setBrand] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selected, setSelected] = useState(() => buildStorage.getSelected());
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const response = await dropdownService.categories();
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        const validCategories = data
          .filter((item) => item?.value && item?.label)
          .map((item) => ({
            ...item,
            value: String(item.value).toUpperCase(),
          }));

        if (!active || !validCategories.length) return;

        setCategoryOptions(validCategories);

        const validValues = validCategories.map((item) => item.value);

        if (!validValues.includes(category)) {
          const nextCategory = validValues.includes('VGA')
            ? 'VGA'
            : validValues[0];

          setCategoryState(nextCategory);

          const next = new URLSearchParams(searchParams);
          next.set('category', nextCategory);
          setSearchParams(next, { replace: true });
        }
      } catch (err) {
        console.error('Failed to load hardware categories:', err);
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const setCategory = (nextCategory) => {
    const normalizedCategory = String(nextCategory).toUpperCase();

    setBrand('ทั้งหมด');
    setSearch('');
    setAppliedSearch('');
    setSuggestions([]);
    setCategoryState(normalizedCategory);

    const next = new URLSearchParams(searchParams);
    next.set('category', normalizedCategory);
    setSearchParams(next, { replace: true });
  };

  const load = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await hardwareService.list(category, {
        page,
        limit: 20,
        ...(appliedSearch ? { search: appliedSearch } : {}),
      });

      const data = Array.isArray(response.data) ? response.data : [];

      setRows(data);
      setMeta(
        response.meta || {
          page,
          totalPages: 1,
          totalItems: data.length,
          limit: 20,
        }
      );
    } catch (err) {
      setRows([]);
      setError(
        getApiErrorMessage(err, 'โหลดข้อมูลฮาร์ดแวร์ไม่สำเร็จ')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [category, appliedSearch]);

  useEffect(() => {
    buildStorage.setSelected(selected);
  }, [selected]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await hardwareService.autocomplete(
          category,
          search.trim()
        );

        setSuggestions(
          Array.isArray(response.data) ? response.data : []
        );
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [category, search]);

  const brands = useMemo(
    () => [
      'ทั้งหมด',
      ...new Set(rows.map((item) => item.brand).filter(Boolean)),
    ],
    [rows]
  );

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (item) => brand === 'ทั้งหมด' || item.brand === brand
      ),
    [rows, brand]
  );

  const backendCategoryLabel =
    categoryOptions.find(
      (item) => String(item.value).toUpperCase() === category
    )?.label || category;

  const currentCategoryLabel =
    categoryUiLabels[category] || backendCategoryLabel;

  const columns = specColumns[category] || [
    ['', 'Spec 1'],
    ['', 'Spec 2'],
  ];

  const selectedFlatItems = useMemo(
    () =>
      Object.entries(selected).flatMap(([selectedCategory, items]) =>
        (Array.isArray(items) ? items : items ? [items] : [])
          .filter(Boolean)
          .map((item) => ({
            category: selectedCategory,
            item,
          }))
      ),
    [selected]
  );

  const selectedCount = selectedFlatItems.length;

  const selectedCategoryCount = Object.values(selected).filter((items) =>
    Array.isArray(items) ? items.length > 0 : Boolean(items)
  ).length;

  const isSelected = (item) => {
    const id = getId(item);
    const categoryItems = Array.isArray(selected[category])
      ? selected[category]
      : selected[category]
        ? [selected[category]]
        : [];

    return categoryItems.some(
      (selectedItem) => getId(selectedItem) === id
    );
  };

  const toggle = (item) => {
    const id = getId(item);

    setSelected((previous) => {
      const current = Array.isArray(previous[category])
        ? previous[category]
        : previous[category]
          ? [previous[category]]
          : [];

      const exists = current.some(
        (selectedItem) => getId(selectedItem) === id
      );

      const nextCategoryItems = exists
        ? current.filter((selectedItem) => getId(selectedItem) !== id)
        : [...current, item];

      const next = { ...previous };

      if (nextCategoryItems.length) {
        next[category] = nextCategoryItems;
      } else {
        delete next[category];
      }

      return next;
    });
  };

  const clearSelected = () => {
    setSelected({});
    buildStorage.clearSelected();
    buildStorage.clearSummaryProductIds();
  };

  const submitSearch = () => {
    setAppliedSearch(search.trim());
    setSuggestions([]);
  };

  const chooseSuggestion = (item) => {
    const name = getDisplayName(item);
    setSearch(name);
    setAppliedSearch(name);
    setSuggestions([]);
  };

  const goToCompare = () => {
    if (!selectedCount) return;

    navigate('/compare', {
      state: { selected },
    });
  };

  return (
    <CustomerPageFrame>
      <div className="hardware-finder-workspace">
        <HardwareSidebar
          active={category}
          selected={selected}
          categories={categoryOptions}
          onSelect={setCategory}
          onCompare={goToCompare}
        />

        <main className="hardware-finder-content">
          <section className="hardware-finder-main-card">
            <div className="hardware-finder-toolbar">
              <div className="hardware-finder-filters">
                <label>
                  <span>Brand</span>
                  <select
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                  >
                    {brands.map((brandName) => (
                      <option key={brandName} value={brandName}>
                        {brandName}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Series</span>
                  <select
                    disabled
                    title="ตัวกรอง Series ยังไม่เปิดใช้งาน"
                    defaultValue="ทั้งหมด"
                  >
                    <option value="ทั้งหมด">ทั้งหมด</option>
                  </select>
                </label>
              </div>

              <div className="hardware-finder-search autocomplete-wrap">
                <Search size={18} />

                <input
                  type="text"
                  value={search}
                  placeholder="ค้นหาสินค้า..."
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      submitSearch();
                    }
                  }}
                />

                <button type="button" onClick={submitSearch}>
                  ค้นหา
                </button>

                {!!suggestions.length && (
                  <div className="autocomplete-menu">
                    {suggestions.map((item, index) => (
                      <button
                        type="button"
                        key={`${getId(item) ?? 'suggestion'}-${index}`}
                        onClick={() => chooseSuggestion(item)}
                      >
                        {getDisplayName(item)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="hardware-selected-strip">
              <div className="hardware-selected-strip-copy">
                <strong>
                  รายการที่เลือก {selectedCount} ชิ้น จาก{' '}
                  {selectedCategoryCount} หมวด
                </strong>

                <div className="hardware-selected-items">
                  {selectedCount ? (
                    selectedFlatItems.map(
                      ({ category: itemCategory, item }, index) => (
                        <span
                          className="hardware-selected-chip"
                          key={`${itemCategory}-${getId(item)}-${index}`}
                        >
                          <b>
                            {categoryUiLabels[itemCategory] || itemCategory}
                          </b>
                          <span>{getDisplayName(item)}</span>
                        </span>
                      )
                    )
                  ) : (
                    <span className="hardware-selected-empty">
                      เลือกอุปกรณ์จากตารางได้หลายชิ้นต่อหมวดเพื่อเปรียบเทียบร้านค้า
                    </span>
                  )}
                </div>
              </div>

              {selectedCount > 0 && (
                <button
                  type="button"
                  className="hardware-selected-reset"
                  onClick={clearSelected}
                >
                  <RotateCcw size={15} />
                  ล้างรายการ
                </button>
              )}
            </div>

            <div className="hardware-table-heading">
              <h2>
                {currentCategoryLabel}{' '}
                <span>
                  ({meta.totalItems ?? filteredRows.length} รายการ)
                </span>
              </h2>

              <div className="hardware-table-filter-note">
                <SlidersHorizontal size={15} />
                <span>Brand filter</span>
                <small>Series filter ยังไม่เปิดใช้งาน</small>
              </div>
            </div>

            <div className="hardware-table-wrap">
              {loading ? (
                <LoadingState label="กำลังโหลดข้อมูลฮาร์ดแวร์..." />
              ) : (
                <>
                  <table className="hardware-finder-table">
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>{columns[0][1]}</th>
                        <th>{columns[1][1]}</th>
                        <th className="hardware-price-column">ราคา</th>
                        <th className="hardware-select-column">เลือก</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRows.map((item, index) => {
                        const id = getId(item);
                        const specs = getItemSpecs(item, category);
                        const selectedRow = isSelected(item);

                        return (
                          <tr
                            key={`${id ?? 'hardware'}-${index}`}
                            className={selectedRow ? 'selected' : ''}
                          >
                            <td>{item.brand || '-'}</td>

                            <td>
                              {id != null ? (
                                <Link
                                  className="hardware-model-name"
                                  to={`/hardware/${category}/${id}`}
                                >
                                  {getDisplayName(item)}
                                </Link>
                              ) : (
                                <span className="hardware-model-name">
                                  {getDisplayName(item)}
                                </span>
                              )}
                            </td>

                            <td>
                              {getSpecValue(specs, columns[0][0])}
                            </td>

                            <td>
                              {getSpecValue(specs, columns[1][0])}
                            </td>

                            <td className="hardware-price">
                              {getPriceText(item.price)}
                              {item.price != null ? '.-' : ''}
                            </td>

                            <td className="hardware-select-cell">
                              <input
                                type="checkbox"
                                checked={selectedRow}
                                onChange={() => toggle(item)}
                                aria-label={`เลือก ${getDisplayName(item)}`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {!filteredRows.length && (
                    <div className="empty-inline">
                      {error || 'ไม่พบรายการที่ตรงกับการค้นหา'}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="hardware-finder-footer">
              <PaginationBar
                page={meta.page || 1}
                pages={meta.totalPages || 1}
                onChange={load}
              />

              <div className="hardware-per-page">
                แสดงสูงสุด {meta.limit || 20} รายการ
              </div>
            </div>
          </section>
        </main>
      </div>
    </CustomerPageFrame>
  );
}
