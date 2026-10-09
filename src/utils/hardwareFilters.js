// Hardware filters use the same master-data fields as ProductFormModal.
// Values come from the API response, never from hard-coded product lists.
export const HARDWARE_FILTERS = {
  CPU: [
    { key: 'brand', label: 'Brand' },
    { key: 'family', label: 'Family' },
    { key: 'socket', label: 'Socket' },
    { key: 'processorClass', label: 'Processor' },
  ],
  MAINBOARD: [
    { key: 'brand', label: 'Brand' },
    { key: 'serie', label: 'Series' },
    { key: 'socket', label: 'Socket' },
    { key: 'chipset', label: 'Chipset' },
    { key: 'formFactor', label: 'Form Factor' },
  ],
  VGA: [
    { key: 'brand', label: 'Brand' },
    { key: 'series', label: 'Series' },
    { key: 'chipset', label: 'Chipset' },
    { key: 'vramSize', label: 'VRAM' },
  ],
  RAM: [
    { key: 'brand', label: 'Brand' },
    { key: 'ramType', label: 'RAM Type' },
    { key: 'capacityGB', label: 'Capacity' },
    { key: 'busSpeed', label: 'Bus Speed' },
  ],
  STORAGE: [
    { key: 'brand', label: 'Brand' },
    { key: 'storageType', label: 'Storage Type' },
    { key: 'interfaceType', label: 'Interface' },
    { key: 'capacityGB', label: 'Capacity' },
  ],
  PSU: [
    { key: 'brand', label: 'Brand' },
    { key: 'watt', label: 'Watt' },
    { key: 'standard80Plus', label: '80 Plus' },
  ],
  COOLER: [
    { key: 'brand', label: 'Brand' },
    { key: 'coolerType', label: 'Cooler Type' },
    { key: 'socketSupport', label: 'Socket Support' },
  ],
};

const CATEGORY_NESTED_KEYS = {
  CPU: ['cpus', 'cpu'],
  MAINBOARD: ['mainboards', 'mainboard'],
  VGA: ['vgas', 'vga'],
  RAM: ['rams', 'ram'],
  STORAGE: ['storages', 'storage'],
  PSU: ['psus', 'psu'],
  COOLER: ['coolers', 'cooler'],
};

const FIELD_ALIASES = {
  brand: ['brand'],
  family: ['family'],
  processorClass: ['processorClass', 'processor_class', 'processor', 'processorModel', 'processor_model'],
  socket: ['socket'],
  serie: ['serie', 'series'],
  series: ['series', 'serie'],
  chipset: ['chipset'],
  formFactor: ['formFactor', 'form_factor'],
  vramSize: ['vramSize', 'vram_size'],
  ramType: ['ramType', 'ram_type'],
  capacityGB: ['capacityGB', 'capacity_gb'],
  busSpeed: ['busSpeed', 'bus_speed'],
  storageType: ['storageType', 'storage_type'],
  interfaceType: ['interfaceType', 'interface_type'],
  watt: ['watt'],
  standard80Plus: ['standard80Plus', 'standard_80_plus'],
  coolerType: ['coolerType', 'cooler_type', 'type'],
  socketSupport: ['socketSupport', 'socket_support', 'supportedSockets', 'supported_sockets'],
};

const getSources = (item, category) => {
  if (!item || typeof item !== 'object') return [];
  const nestedKeys = CATEGORY_NESTED_KEYS[category] || [];
  const sources = [];
  const add = (value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) sources.push(value);
  };
  for (const key of nestedKeys) {
    add(item[key]);
    add(item.hardware?.[key]);
    add(item.data?.[key]);
    add(item.specs?.[key]);
    add(item.detail?.[key]);
  }
  add(item.specs);
  add(item.hardware?.specs);
  add(item.detail?.specs);
  add(item.hardware);
  add(item);
  return sources;
};

const firstValue = (sources, aliases) => {
  for (const source of sources) {
    for (const alias of aliases) {
      const value = source[alias];
      if (value !== null && value !== undefined && value !== '' && value !== '-') {
        return value;
      }
    }
  }
  return null;
};

const clean = (value) => String(value ?? '').trim();
const comparable = (value) => clean(value).toLocaleLowerCase();

const LEGACY_CATEGORY_FIELDS = {
  CPU: { socket: 'chipset' },
  RAM: { ramType: 'chipset', capacityGB: 'memory' },
  STORAGE: { interfaceType: 'chipset', capacityGB: 'memory' },
  VGA: { vramSize: 'memory' },
  PSU: { standard80Plus: 'chipset' },
};

// Legacy mock fixtures keep capacity and socket in other properties.
// These fallbacks apply only when the canonical master-data field is missing.
const readField = (item, category, key) => {
  const sources = getSources(item, category);
  const value = firstValue(sources, FIELD_ALIASES[key] || [key]);
  if (value != null) return value;
  const legacy = LEGACY_CATEGORY_FIELDS[category]?.[key];
  if (!legacy) return null;
  const legacyValue = firstValue([item], [legacy]);
  if (category === 'STORAGE' && key === 'capacityGB' && /TB\b/i.test(clean(legacyValue))) {
    const size = Number.parseFloat(clean(legacyValue));
    return Number.isFinite(size) ? size * 1000 : null;
  }
  return legacyValue;
};

const NUMERIC_FIELDS = new Set(['vramSize', 'capacityGB', 'busSpeed', 'watt']);

export const filterValues = (item, category, field) => {
  const value = readField(item, category, field);
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  return values.flatMap((raw) => {
    // A cooler can support multiple sockets. Select one socket to match it.
    const parts = field === 'socketSupport' && typeof raw === 'string'
      ? raw.split(/[,;|/]+/)
      : [raw];
    return parts.map((part) => {
      const text = clean(part);
      if (!text || text === '-') return '';
      if (NUMERIC_FIELDS.has(field)) {
        const match = text.match(/\d+(?:\.\d+)?/);
        if (!match) return text;
        const number = Number(match[0]);
        return String(field === 'capacityGB' && /TB\b/i.test(text) ? number * 1000 : number);
      }
      return text;
    }).filter(Boolean);
  });
};

export const matchesHardwareFilters = (item, category, filters, fields = HARDWARE_FILTERS[category] || []) =>
  fields.every(({ key }) => {
    const selected = filters[key];
    return !selected || filterValues(item, category, key)
      .some((value) => comparable(value) === comparable(selected));
  });

export const optionsForFilter = (rows, category, fields, index, filters) => {
  const predecessors = fields.slice(0, index);
  const relevant = rows.filter((item) => matchesHardwareFilters(item, category, filters, predecessors));
  const values = new Map();
  for (const item of relevant) {
    for (const value of filterValues(item, category, fields[index].key)) {
      const key = comparable(value);
      if (!values.has(key)) values.set(key, value);
    }
  }
  return [...values.values()].sort((left, right) =>
    left.localeCompare(right, 'th', { numeric: true, sensitivity: 'base' }));
};

export const hardwareFilterLabel = (field, value) => {
  if (['capacityGB', 'vramSize'].includes(field)) return `${value} GB`;
  if (field === 'busSpeed') return `${value} MHz`;
  if (field === 'watt') return `${value} W`;
  return value;
};

// Load every API page so filtering, option counts, and pagination remain accurate.
// Backend filtering by hardware specifications is not documented in this project.
export const fetchCompleteHardwareCatalog = async (getPage, category, searchTerm = '', isCurrent = () => true) => {
  const params = { page: 1, limit: 20, ...(searchTerm ? { search: searchTerm } : {}) };
  const first = await getPage(category, params);
  const firstRows = Array.isArray(first?.data) ? first.data : [];
  const meta = first?.meta || first?.pagination || {};
  const pageSize = Number(meta.limit ?? firstRows.length ?? 20) || 20;
  const inferredPages = Number(meta.totalItems ?? meta.total_items)
    ? Math.ceil(Number(meta.totalItems ?? meta.total_items) / pageSize)
    : 1;
  const totalPages = Number(meta.totalPages ?? meta.total_pages ?? inferredPages);

  if (!Number.isFinite(totalPages) || totalPages < 1) return firstRows;
  // Avoid silently showing incomplete filter results for very large catalogs.
  if (totalPages > 200) {
    throw new Error('รายการในหมวดนี้มีจำนวนมากเกินกว่าจะกรองบนหน้าเว็บได้ กรุณาให้ Backend รองรับตัวกรองผ่าน API');
  }

  const collected = [...firstRows];
  for (let start = 2; start <= totalPages; start += 5) {
    if (!isCurrent()) return [];
    const pages = Array.from({ length: Math.min(5, totalPages - start + 1) }, (_, index) => start + index);
    const batches = await Promise.all(pages.map((page) => getPage(category, { ...params, page })));
    for (const response of batches) {
      if (!Array.isArray(response?.data)) {
        throw new Error('Backend ส่งข้อมูลรายการ Hardware ไม่ถูกต้อง');
      }
      collected.push(...response.data);
    }
  }

  // Reject backends that return page 1 repeatedly despite a page parameter.
  const unique = new Map();
  let noId = 0;
  for (const item of collected) {
    const id = item?.masterId ?? item?.id;
    unique.set(id == null ? `missing-${noId++}` : String(id), item);
  }
  const result = [...unique.values()];
  const expected = Number(meta.totalItems ?? meta.total_items);
  if (Number.isFinite(expected) && expected > result.length) {
    throw new Error('Backend ส่งข้อมูลไม่ครบทุกหน้า จึงไม่สามารถกรองรายการได้อย่างถูกต้อง');
  }
  return result;
};
