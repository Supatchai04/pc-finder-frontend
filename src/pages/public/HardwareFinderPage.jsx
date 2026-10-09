import { useEffect, useMemo, useRef, useState } from 'react';
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
import { HARDWARE_FILTERS, optionsForFilter, matchesHardwareFilters, hardwareFilterLabel, fetchCompleteHardwareCatalog } from '../../utils/hardwareFilters';

const fallbackCategories = [
  { value: 'CPU', label: 'ซีพียู (CPU)' },
  { value: 'MAINBOARD', label: 'เมนบอร์ด (Mainboard)' },
  { value: 'VGA', label: 'การ์ดจอ (VGA)' },
  { value: 'RAM', label: 'แรม (RAM)' },
  { value: 'STORAGE', label: 'อุปกรณ์จัดเก็บข้อมูล (Storage)' },
  { value: 'PSU', label: 'เพาเวอร์ซัพพลาย (PSU)' },
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

  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const latestCatalogRequest = useRef(0);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selected, setSelected] = useState(() =>
    Object.fromEntries(
      Object.entries(buildStorage.getSelected()).filter(
        ([key]) => String(key).trim().toUpperCase() !== 'CASE'
      )
    )
  );
  const [rows, setRows] = useState([]);
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
          .filter((item) =>
            item?.value &&
            item?.label &&
            !['CASE', 'COOLER'].includes(String(item.value).trim().toUpperCase())
          )
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

    setFilters({});
    setCurrentPage(1);
    setSearch('');
    setAppliedSearch('');
    setSuggestions([]);
    setCategoryState(normalizedCategory);

    const next = new URLSearchParams(searchParams);
    next.set('category', normalizedCategory);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let active = true;
    const request = ++latestCatalogRequest.current;
    setLoading(true);
    setError('');
    setRows([]);
    setCurrentPage(1);

    fetchCompleteHardwareCatalog(hardwareService.list, category, appliedSearch, () => active && request === latestCatalogRequest.current)
      .then((data) => {
        if (active && request === latestCatalogRequest.current) setRows(data);
      })
      .catch((err) => {
        if (active && request === latestCatalogRequest.current) {
          setRows([]);
          setError(getApiErrorMessage(err, 'โหลดข้อมูลฮาร์ดแวร์ไม่สำเร็จ'));
        }
      })
      .finally(() => {
        if (active && request === latestCatalogRequest.current) setLoading(false);
      });

    return () => { active = false; };
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

  const categoryFields = HARDWARE_FILTERS[category] || HARDWARE_FILTERS.VGA;
  const filterOptions = useMemo(() => categoryFields.map((_, index) =>
    optionsForFilter(rows, category, categoryFields, index, filters)), [rows, category, filters]);

  const setFilter = (key, value) => {
    const index = categoryFields.findIndex((field) => field.key === key);
    setFilters((previous) => {
      const next = { ...previous, [key]: value };
      // Later options depend on earlier ones: discard invalid dependent values.
      categoryFields.slice(index + 1).forEach((field) => { delete next[field.key]; });
      return next;
    });
    setCurrentPage(1);
  };

  const filteredRows = useMemo(() => rows.filter((item) =>
    matchesHardwareFilters(item, category, filters)), [rows, category, filters]);

  const meta = {
    page: currentPage,
    totalPages: Math.max(1, Math.ceil(filteredRows.length / 20)),
    totalItems: filteredRows.length,
    limit: 20,
  };
  const pageRows = filteredRows.slice((currentPage - 1) * 20, currentPage * 20);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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
    setFilters({});
    setCurrentPage(1);
    setSuggestions([]);
  };

  const chooseSuggestion = (item) => {
    const name = getDisplayName(item);
    setSearch(name);
    setAppliedSearch(name);
    setFilters({});
    setCurrentPage(1);
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
                {categoryFields.map((field, index) => {
                  const options = filterOptions[index];
                  return (
                    <label key={field.key}>
                      <span>{field.label}</span>
                      <select
                        value={filters[field.key] || ''}
                        onChange={(event) => setFilter(field.key, event.target.value)}
                        disabled={loading || !options.length}
                        aria-label={`กรองตาม ${field.label}`}
                      >
                        <option value="">ทั้งหมด</option>
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {hardwareFilterLabel(field.key, option)}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
                {activeFilterCount > 0 && (
                  <button type="button" className="hardware-filters-clear" onClick={() => {
                    setFilters({});
                    setCurrentPage(1);
                  }}>
                    <RotateCcw size={14} /> ล้างตัวกรอง
                  </button>
                )}
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
                  ({filteredRows.length} รายการ)
                </span>
              </h2>

              <div className="hardware-table-filter-note">
                <SlidersHorizontal size={15} />
                <span>{activeFilterCount > 0 ? `กำลังกรอง ${activeFilterCount} เงื่อนไข` : 'แสดงสินค้าทั้งหมดในหมวด'}</span>
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
                      {pageRows.map((item, index) => {
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
                      {error || 'ไม่พบรายการที่ตรงกับตัวกรองหรือคำค้นหา'}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="hardware-finder-footer">
              <PaginationBar
                page={meta.page || 1}
                pages={meta.totalPages || 1}
                onChange={setCurrentPage}
              />

              <div className="hardware-per-page">
                แสดงสูงสุด {meta.limit} รายการต่อหน้า
              </div>
            </div>
          </section>
        </main>
      </div>
    </CustomerPageFrame>
  );
}
