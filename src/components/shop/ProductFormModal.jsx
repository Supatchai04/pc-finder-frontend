import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import LoadingState from '../ui/LoadingState';
import { hardwareService } from '../../services/hardwareService';
import { shopService } from '../../services/shopService';
import { getApiErrorMessage } from '../../utils/api';
const CATEGORY_LABELS = {
    CPU: 'CPU',
    MAINBOARD: 'Mainboard',
    VGA: 'VGA Card',
    RAM: 'RAM',
    STORAGE: 'Storage',
    PSU: 'Power Supply',
    COOLER: 'CPU Cooler',
};
const CATEGORY_DESCRIPTIONS = {
    CPU: 'ซีพียู / โปรเซสเซอร์',
    MAINBOARD: 'เมนบอร์ด',
    VGA: 'การ์ดจอ',
    RAM: 'หน่วยความจำ',
    STORAGE: 'SSD / HDD / อุปกรณ์จัดเก็บข้อมูล',
    PSU: 'เพาเวอร์ซัพพลาย',
    COOLER: 'ชุดระบายความร้อน CPU',
};
const HARDWARE_FIELDS = {
    CPU: [
        {
            key: 'brand',
            label: 'แบรนด์',
            required: true,
            md: 6,
            placeholder: 'กรอกแบรนด์',
        },
        {
            key: 'family',
            label: 'Family',
            required: true,
            md: 6,
            placeholder: 'กรอก Family',
        },
        {
            key: 'processorClass',
            label: 'Processor',
            required: true,
            md: 6,
            placeholder: 'เช่น 12400F, 7600X',
        },
        {
            key: 'socket',
            label: 'Socket',
            required: true,
            md: 6,
            placeholder: 'เช่น LGA1700, AM5',
        },
    ],
    MAINBOARD: [
        { key: 'brand', label: 'แบรนด์', required: true, md: 4, placeholder: 'กรอกแบรนด์' },
        { key: 'serie', label: 'Series', required: true, md: 4, placeholder: 'กรอก Series' },
        { key: 'formFactor', label: 'Form Factor', required: true, md: 4, options: ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX'], placeholder: 'เลือก Form Factor' },
        { key: 'socket', label: 'Socket', required: true, md: 6, placeholder: 'เช่น AM5, LGA1700' },
        { key: 'chipset', label: 'Chipset', required: true, md: 6, placeholder: 'เช่น B650, B760' },
    ],
    VGA: [
        {
            key: 'brand',
            label: 'แบรนด์',
            required: true,
            md: 6,
            placeholder: 'กรอกแบรนด์',
        },
        {
            key: 'series',
            label: 'Series',
            required: true,
            md: 6,
            options: [
                'AMD Radeon AI PRO R9000',
                'AMD Radeon Pro Series',
                'AMD Radeon RX 6000 Series',
                'AMD Radeon RX 7000 Series',
                'AMD Radeon RX 9000 Series',
                'Intel Arc A-series',
                'Intel Arc B-series',
                'Intel Arc Pro B Series',
                'Nvidia Quadro',
                'Nvidia GeForce 10 Series',
                'Nvidia GeForce 16 Series',
                'Nvidia GeForce 30 Series',
                'Nvidia GeForce 40 Series',
                'Nvidia GeForce 50 Series',
                'Nvidia GeForce 700 Series',
                'Nvidia RTX Series',
            ],
            placeholder: 'เลือก Series',
        },
        {
            key: 'chipset',
            label: 'Chipset',
            required: true,
            md: 6,
            placeholder: 'เช่น RTX 5070 Ti',
        },
        {
            key: 'vramSize',
            label: 'ขนาด VRAM (GB)',
            required: true,
            md: 6,
            type: 'number',
            placeholder: 'เช่น 8, 12, 16',
        },
    ],
    RAM: [
        { key: 'brand', label: 'แบรนด์', required: true, md: 6, placeholder: 'กรอกแบรนด์' },
        { key: 'model', label: 'Model', required: true, md: 6, placeholder: 'เช่น FURY Beast, Vengeance RGB' },
        { key: 'ramType', label: 'ประเภท RAM', required: true, md: 4, options: ['DDR4', 'DDR5'], placeholder: 'เลือกประเภท RAM' },
        { key: 'capacityGB', label: 'ความจุ (GB)', required: true, md: 4, type: 'number', placeholder: 'เช่น 16, 32, 64' },
        { key: 'busSpeed', label: 'Bus Speed (MHz)', required: true, md: 4, type: 'number', placeholder: 'เช่น 3200, 5600, 6000' },
    ],
    STORAGE: [
        { key: 'brand', label: 'แบรนด์', required: true, md: 4, placeholder: 'กรอกแบรนด์' },
        { key: 'model', label: 'Model', required: true, md: 4, placeholder: 'กรอก Model' },
        { key: 'storageType', label: 'ประเภท Storage', required: true, md: 4, options: ['SSD M.2', 'SSD SATA', 'HDD'], placeholder: 'เลือกประเภท Storage' },
        { key: 'interfaceType', label: 'Interface', required: true, md: 6, placeholder: 'เช่น PCIe 4.0 x4, SATA III' },
        { key: 'capacityGB', label: 'ความจุ (GB)', required: true, md: 6, type: 'number', placeholder: 'เช่น 500, 1000, 2000' },
    ],
    PSU: [
        { key: 'brand', label: 'แบรนด์', required: true, md: 6, placeholder: 'กรอกแบรนด์' },
        { key: 'model', label: 'Model', required: true, md: 6, placeholder: 'กรอก Model' },
        { key: 'watt', label: 'กำลังไฟ (Watt)', required: true, md: 6, type: 'number', placeholder: 'เช่น 650, 750, 850' },
        { key: 'standard80Plus', label: 'มาตรฐาน 80 Plus', required: true, md: 6, options: ['80 Plus', '80 Plus Bronze', '80 Plus Silver', '80 Plus Gold', '80 Plus Platinum', '80 Plus Titanium'], placeholder: 'เลือกมาตรฐาน' },
    ],
    COOLER: [
        { key: 'brand', label: 'แบรนด์', required: true, md: 6, placeholder: 'กรอกแบรนด์' },
        { key: 'model', label: 'Model', required: true, md: 6, placeholder: 'กรอก Model' },
        { key: '_coolerType', label: 'ประเภทชุดระบายความร้อน', required: true, md: 6, options: ['Air Cooler', 'AIO Liquid Cooler'], placeholder: 'เลือกประเภท' },
        { key: '_socketSupport', label: 'Socket ที่รองรับ', required: true, md: 6, placeholder: 'เช่น AM5, LGA1700' },
    ],
};
const CATEGORY_DETAIL_KEYS = {
    CPU: ['cpus', 'cpu'],
    MAINBOARD: ['mainboards', 'mainboard'],
    VGA: ['vgas', 'vga'],
    RAM: ['rams', 'ram'],
    STORAGE: ['storages', 'storage'],
    PSU: ['psus', 'psu'],
    COOLER: ['coolers', 'cooler'],
};
const INITIAL_STORE_DETAILS = {
    customTitle: '',
    price: '',
    warranty: '',
    description: '',
    productStatus: 'ACTIVE',
};
const WARRANTY_OPTIONS = ['7 Days', '30 Days', '1 Year', '2 Years', '3 Years', '5 Years', 'Lifetime'];
const NUMERIC_HARDWARE_FIELDS = new Set(['vramSize', 'capacityGB', 'busSpeed', 'watt', 'ramSlots']);
const INTEGER_HARDWARE_FIELDS = new Set(['vramSize', 'capacityGB', 'watt']);
const isValidCategory = (value) => Boolean(value && CATEGORY_LABELS[value]);
const cleanValue = (value) => String(value ?? '').trim();
const createHardwareState = (category) => {
    const result = {};
    (HARDWARE_FIELDS[category] || []).forEach((field) => {
        result[field.key] = '';
    });
    return result;
};
const normalizeObjectKey = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
const readObjectValue = (source, alias) => {
    if (!source || typeof source !== 'object' || Array.isArray(source)) return undefined;
    if (Object.prototype.hasOwnProperty.call(source, alias)) {
        return source[alias];
    }
    const wanted = normalizeObjectKey(alias);
    const actualKey = Object.keys(source).find((key) => normalizeObjectKey(key) === wanted);
    return actualKey ? source[actualKey] : undefined;
};
const getFirstValue = (sources, aliases) => {
    for (const source of sources) {
        if (!source || typeof source !== 'object') continue;
        for (const alias of aliases) {
            const value = readObjectValue(source, alias);
            if (value !== undefined && value !== null && cleanValue(value) !== '') {
                return value;
            }
        }
    }
    return '';
};
const getDetailSources = (data, category) => {
    if (!data || typeof data !== 'object') return [];
    const result = [];
    const seen = new Set();
    const categoryKeys = (CATEGORY_DETAIL_KEYS[category] || []).map(normalizeObjectKey);
    const addObject = (value) => {
        if (!value || typeof value !== 'object' || Array.isArray(value) || seen.has(value)) return;
        seen.add(value);
        result.push(value);
    };
    // 1) nested ของ category โดยตรงก่อน เช่น cpus / vgas / rams / storages / psus
    Object.entries(data).forEach(([key, value]) => {
        if (categoryKeys.includes(normalizeObjectKey(key))) addObject(value);
    });
    // 2) รองรับ wrapper หลายชั้น เช่น data.hardware.vgas หรือ data.detail.specs
    const walk = (value, depth = 0) => {
        if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 5) return;
        Object.entries(value).forEach(([key, child]) => {
            if (!child || typeof child !== 'object' || Array.isArray(child)) return;
            const normalizedKey = normalizeObjectKey(key);
            if (categoryKeys.includes(normalizedKey)) addObject(child);
            if (['specs', 'hardware', 'detail', 'data'].includes(normalizedKey)) addObject(child);
            walk(child, depth + 1);
        });
    };
    walk(data);
    addObject(data);
    return result;
};
const numericOnly = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    if (typeof value === 'number') return value;
    const match = String(value).match(/\d+(?:\.\d+)?/);
    return match ? match[0] : value;
};
// รายการ RAM รุ่นเก่าบางรายการไม่มี model แต่มีชื่อรุ่นอยู่ใน displayName
// เช่น "Corsair Vengeance DDR5 32GB (16GBx2) 5600MHz" -> "Vengeance"
const inferRamModelFromName = (displayName, brand) => {
    const name = cleanValue(displayName);
    const brandName = cleanValue(brand);
    if (!name || !brandName) return '';

    // ต้องขึ้นต้นด้วยแบรนด์จริง ๆ เพื่อไม่ดึงชื่อสินค้าที่ไม่เกี่ยวข้องมาใส่ Model
    const escapedBrand = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const brandPrefix = new RegExp(`^${escapedBrand}(?:\\s+|\\s*[-:/]\\s*)`, 'i');
    if (!brandPrefix.test(name)) return '';

    const withoutBrand = name.replace(brandPrefix, '').trim();
    // ตัดส่วนสเปก (DDR, ความจุ, MHz) ออก โดยเก็บชื่อซีรีส์เช่น "Trident Z5" ไว้
    const specMatch = withoutBrand.match(/(?:^|[\s(])(?:(?:LP)?DDR[345]|PC[345][-_]?\d*|\d+(?:\.\d+)?\s*(?:GB|TB|MB)\b|\d{3,5}\s*(?:MHz|MT\/s)\b)/i);
    const model = (specMatch ? withoutBrand.slice(0, specMatch.index) : withoutBrand)
        .replace(/[\s,;:/()\-]+$/g, '')
        .trim();
    return model && /[a-zA-Z]/.test(model) ? model : '';
};
// กรณี Backend ไม่ส่ง model แยกไว้ ให้ใช้ชื่อสินค้า Master Data เป็นทางเลือกสุดท้าย
// แต่ห้ามทับค่ารุ่นที่ API ส่งมา และห้ามนำชื่อ DDR/ความจุ/Bus Speed ไปใช้เป็น Model
const fillRamModelIfMissing = (hardware, sources) => {
    if (cleanValue(hardware.model)) return hardware;
    for (const source of sources) {
        const details = getDetailSources(source, 'RAM');
        const seriesName = getFirstValue(details, ['series', 'serie', 'productSeries']);
        if (typeof seriesName === 'string' && cleanValue(seriesName)
            && !/^(?:LP)?DDR[345]$/i.test(seriesName.trim())) {
            return { ...hardware, model: seriesName.trim() };
        }
        const displayName = getFirstValue(details, ['displayName', 'display_name', 'name', 'hardwareName']);
        const inferred = inferRamModelFromName(displayName, hardware.brand);
        if (inferred) return { ...hardware, model: inferred };
    }
    return hardware;
};
const createHardwareFromMaster = (data, category) => {
    const result = createHardwareState(category);
    const sources = getDetailSources(data, category);
    const valueFor = (key) => {
        if (key === 'brand') return getFirstValue(sources, ['brand']);
        if (category === 'CPU') {
            if (key === 'family') return getFirstValue(sources, ['family']);
            if (key === 'processorClass') {
                return getFirstValue(sources, ['processorClass', 'processor', 'processor_class', 'processorModel', 'processor_model']);
            }
            if (key === 'socket') return getFirstValue(sources, ['socket']);
        }
        if (category === 'MAINBOARD') {
            if (key === 'serie') return getFirstValue(sources, ['serie', 'series']);
            if (key === 'formFactor') return getFirstValue(sources, ['formFactor', 'form_factor']);
            if (key === 'socket') return getFirstValue(sources, ['socket']);
            if (key === 'chipset') return getFirstValue(sources, ['chipset']);
        }
        if (category === 'VGA') {
            if (key === 'series') return getFirstValue(sources, ['series', 'serie']);
            if (key === 'chipset') return getFirstValue(sources, ['chipset']);
            if (key === 'vramSize') return numericOnly(getFirstValue(sources, ['vramSize', 'vram_size']));
        }
        if (category === 'RAM') {
            if (key === 'model') return getFirstValue(sources, ['model', 'modelName', 'ramModel', 'ramModelName', 'modelNumber']);
            if (key === 'ramType') return getFirstValue(sources, ['ramType', 'ram_type', 'memoryType', 'ddrType']);
            if (key === 'capacityGB') return numericOnly(getFirstValue(sources, ['capacityGB', 'capacity_gb']));
            if (key === 'busSpeed') return numericOnly(getFirstValue(sources, ['busSpeed', 'bus_speed', 'speedMHz', 'frequencyMHz']));
        }
        if (category === 'STORAGE') {
            if (key === 'model') return getFirstValue(sources, ['model']);
            if (key === 'storageType') return getFirstValue(sources, ['storageType', 'storage_type']);
            if (key === 'interfaceType') return getFirstValue(sources, ['interfaceType', 'interface_type']);
            if (key === 'capacityGB') return numericOnly(getFirstValue(sources, ['capacityGB', 'capacity_gb']));
        }
        if (category === 'PSU') {
            if (key === 'model') return getFirstValue(sources, ['model']);
            if (key === 'watt') return numericOnly(getFirstValue(sources, ['watt']));
            if (key === 'standard80Plus') return getFirstValue(sources, ['standard80Plus', 'standard_80_plus']);
        }
        if (category === 'COOLER') {
            if (key === 'model') return getFirstValue(sources, ['model']);
            if (key === '_coolerType') return getFirstValue(sources, ['coolerType', 'cooler_type', 'type']);
            if (key === '_socketSupport') {
                const value = getFirstValue(sources, ['socketSupport', 'socket_support', 'supportedSockets']);
                return Array.isArray(value) ? value.join(', ') : value;
            }
        }
        return getFirstValue(sources, [key]);
    };
    (HARDWARE_FIELDS[category] || []).forEach((field) => {
        result[field.key] = valueFor(field.key);
    });
    return result;
};
const mergeHardwareValues = (category, sources) => {
    const result = createHardwareState(category);
    sources.filter(Boolean).forEach((source) => {
        const mapped = createHardwareFromMaster(source, category);
        (HARDWARE_FIELDS[category] || []).forEach((field) => {
            if (!cleanValue(result[field.key]) && cleanValue(mapped[field.key])) {
                result[field.key] = mapped[field.key];
            }
        });
    });
    return result;
};
const createMasterSnapshot = (category, hardware) => {
    const snapshot = {};
    (HARDWARE_FIELDS[category] || []).forEach((field) => {
        snapshot[field.key] = cleanValue(hardware?.[field.key]);
    });
    return snapshot;
};
const isSameMasterValues = (category, hardware, originalMasterValues) => {
    if (!originalMasterValues) return false;
    return (HARDWARE_FIELDS[category] || []).every(
        (field) => cleanValue(hardware?.[field.key]) === cleanValue(originalMasterValues?.[field.key]),
    );
};
const createDisplayName = (category, hardware) => {
    if (category === 'CPU') return [hardware.brand, hardware.family, hardware.processorClass].map(cleanValue).filter(Boolean).join(' ');
    if (category === 'MAINBOARD') return [hardware.brand, hardware.serie, hardware.chipset].map(cleanValue).filter(Boolean).join(' ');
    if (category === 'VGA') return [hardware.brand, hardware.series, hardware.chipset, hardware.vramSize ? `${cleanValue(hardware.vramSize)}GB` : ''].map(cleanValue).filter(Boolean).join(' ');
    if (category === 'RAM') return [hardware.brand, hardware.model, hardware.ramType, hardware.capacityGB ? `${cleanValue(hardware.capacityGB)}GB` : '', hardware.busSpeed ? `${cleanValue(hardware.busSpeed)}MHz` : ''].map(cleanValue).filter(Boolean).join(' ');
    if (category === 'STORAGE') return [hardware.brand, hardware.model, hardware.capacityGB ? `${cleanValue(hardware.capacityGB)}GB` : '', hardware.interfaceType].map(cleanValue).filter(Boolean).join(' ');
    if (category === 'PSU') return [hardware.brand, hardware.model, hardware.watt ? `${cleanValue(hardware.watt)}W` : '', hardware.standard80Plus].map(cleanValue).filter(Boolean).join(' ');
    if (category === 'COOLER') return [hardware.brand, hardware.model].map(cleanValue).filter(Boolean).join(' ');
    return cleanValue(hardware.brand);
};
// ใหม่
const createHardwareKey = (displayName) =>
    String(displayName || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
const createBackendHardware = (hardware) => {
    const payload = {};
    Object.entries(hardware).forEach(([key, value]) => {
        if (key.startsWith('_')) return;
        if (INTEGER_HARDWARE_FIELDS.has(key) && cleanValue(value) !== '') {
            const parsedValue = Number.parseInt(value, 10);
            payload[key] = Number.isNaN(parsedValue) ? value : parsedValue;
            return;
        }
        if (NUMERIC_HARDWARE_FIELDS.has(key) && cleanValue(value) !== '') {
            payload[key] = Number(value);
            return;
        }
        payload[key] = typeof value === 'string' ? value.trim() : value;
    });
    return payload;
};
const getSuggestionMeta = (item, category) => {
    const hardware = createHardwareFromMaster(item, category);
    if (category === 'CPU') return [hardware.family, hardware.processorClass, hardware.socket].filter(Boolean).join(' • ');
    if (category === 'MAINBOARD') return [hardware.serie, hardware.socket, hardware.chipset].filter(Boolean).join(' • ');
    if (category === 'VGA') return [hardware.series, hardware.chipset, hardware.vramSize && `${hardware.vramSize}GB`].filter(Boolean).join(' • ');
    if (category === 'RAM') return [hardware.model, hardware.ramType, hardware.capacityGB && `${hardware.capacityGB}GB`, hardware.busSpeed && `${hardware.busSpeed}MHz`].filter(Boolean).join(' • ');
    if (category === 'STORAGE') return [hardware.model, hardware.storageType, hardware.capacityGB && `${hardware.capacityGB}GB`].filter(Boolean).join(' • ');
    if (category === 'PSU') return [hardware.model, hardware.watt && `${hardware.watt}W`, hardware.standard80Plus].filter(Boolean).join(' • ');
    return [hardware.model].filter(Boolean).join(' • ');
};
const requiredMasterComplete = (category, hardware) => (
    HARDWARE_FIELDS[category] || []
).filter((field) => field.required).every((field) => cleanValue(hardware?.[field.key]));
export default function ProductFormModal({
    show,
    onHide,
    defaultCategory = '',
    onSaved,
    editItem = null,
    prefillMasterId = null,
}) {
    const [category, setCategory] = useState('');
    const [hardware, setHardware] = useState({});
    const [storeDetails, setStoreDetails] = useState(INITIAL_STORE_DETAILS);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const [masterLoading, setMasterLoading] = useState(false);
    const [, setSelectedMasterId] = useState(null);
    const [, setOriginalMasterValues] = useState(null);
    // Refs are updated synchronously, so quick edits and pending API responses
    // cannot reuse a stale Master ID before React finishes rendering.
    const selectedMasterIdRef = useRef(null);
    const originalMasterValuesRef = useRef(null);
    const hardwareRef = useRef({});
    const modalSessionRef = useRef(0);
    const selectionRequestRef = useRef(0);
    const [autocompleteKeyword, setAutocompleteKeyword] = useState('');
    const [autocompleteFieldKey, setAutocompleteFieldKey] = useState('');
    const [autocompleteItems, setAutocompleteItems] = useState([]);
    const [autocompleteLoading, setAutocompleteLoading] = useState(false);
    const [autocompleteOpen, setAutocompleteOpen] = useState(false);
    const autocompleteRequestRef = useRef(0);
    const dirtyDetailsRef = useRef(new Set());
    const fields = useMemo(() => HARDWARE_FIELDS[category] || [], [category]);
    const hasPrefillMaster = !editItem && prefillMasterId != null && prefillMasterId !== '';
    const choosingCategory = !editItem && !hasPrefillMaster && !category;

    const clearMasterSelection = () => {
        selectedMasterIdRef.current = null;
        originalMasterValuesRef.current = null;
        setSelectedMasterId(null);
        setOriginalMasterValues(null);
    };
    const assignMasterSelection = (masterId, selectedCategory, selectedHardware) => {
        const snapshot = createMasterSnapshot(selectedCategory, selectedHardware);
        selectedMasterIdRef.current = masterId ?? null;
        originalMasterValuesRef.current = snapshot;
        setSelectedMasterId(masterId ?? null);
        setOriginalMasterValues(snapshot);
    };
    const replaceHardware = (nextHardware) => {
        hardwareRef.current = nextHardware;
        setHardware(nextHardware);
    };
    const resetModalState = () => {
        // Prevent delayed detail/autocomplete results from restoring a closed selection.
        modalSessionRef.current += 1;
        selectionRequestRef.current += 1;
        autocompleteRequestRef.current += 1;
        clearMasterSelection();
        replaceHardware({});
        setCategory('');
        setStoreDetails({ ...INITIAL_STORE_DETAILS });
        setSaving(false);
        setMasterLoading(false);
        setError('');
        setValidationError('');
        setAutocompleteKeyword('');
        setAutocompleteFieldKey('');
        setAutocompleteItems([]);
        setAutocompleteLoading(false);
        setAutocompleteOpen(false);
        dirtyDetailsRef.current.clear();
    };
    const finishAndClose = () => {
        resetModalState();
        onHide();
    };
    const handleClose = () => {
        if (saving) return;
        finishAndClose();
    };
    // Also handle the case where the parent hides the modal without calling onHide.
    useEffect(() => {
        if (!show) resetModalState();
    }, [show]);
    useEffect(() => {
        // Keep any out-of-band hardware update from retaining a mismatched ID.
        if (selectedMasterIdRef.current != null &&
            !isSameMasterValues(category, hardware, originalMasterValuesRef.current)) {
            clearMasterSelection();
        }
    }, [category, hardware]);
    useEffect(() => {
        if (!show) return undefined;
        const sessionId = ++modalSessionRef.current;
        ++selectionRequestRef.current;
        let active = true;
        setError('');
        setValidationError('');
        setSaving(false);
        setMasterLoading(false);
        clearMasterSelection();
        setAutocompleteKeyword('');
        setAutocompleteFieldKey('');
        setAutocompleteItems([]);
        setAutocompleteLoading(false);
        setAutocompleteOpen(false);
        dirtyDetailsRef.current.clear();
        if (editItem) {
            const nextCategory = isValidCategory(editItem.category) ? editItem.category : 'CPU';
            setCategory(nextCategory);
            replaceHardware(createHardwareState(nextCategory));
            setStoreDetails({
                customTitle: editItem.customTitle || editItem.hardwareName || editItem.displayName || '',
                price: editItem.price ?? '',
                warranty: editItem.warranty || '',
                description: editItem.description || '',
                productStatus: editItem.productStatus || editItem.status || 'ACTIVE',
            });
            return undefined;
        }
        if (hasPrefillMaster) {
            setCategory('');
            replaceHardware({});
            setStoreDetails({ ...INITIAL_STORE_DETAILS });
            setMasterLoading(true);
            (async () => {
                try {
                    const response = await hardwareService.masterDetail(prefillMasterId);
                    if (!active || sessionId !== modalSessionRef.current) return;
                    const data = response?.data || null;
                    if (!data) throw new Error('ไม่พบข้อมูลฮาร์ดแวร์จาก Master Data');
                    const nextCategory = String(data.category || '').toUpperCase();
                    if (!isValidCategory(nextCategory)) {
                        throw new Error(`ไม่รองรับหมวดหมู่ ${nextCategory || '-'}`);
                    }
                    const parsedHardware = createHardwareFromMaster(data, nextCategory);
                    const nextHardware = nextCategory === 'RAM'
                        ? fillRamModelIfMissing(parsedHardware, [data])
                        : parsedHardware;
                    const nextMasterId = data.masterId ?? data.id ?? prefillMasterId;
                    setCategory(nextCategory);
                    replaceHardware(nextHardware);
                    setStoreDetails({
                        ...INITIAL_STORE_DETAILS,
                        customTitle: data.displayName || data.name || '',
                    });
                    assignMasterSelection(nextMasterId, nextCategory, nextHardware);
                } catch (err) {
                    if (active && sessionId === modalSessionRef.current) {
                        setError(getApiErrorMessage(err, 'โหลดข้อมูลฮาร์ดแวร์ไม่สำเร็จ'));
                    }
                } finally {
                    if (active && sessionId === modalSessionRef.current) setMasterLoading(false);
                }
            })();
            return () => {
                active = false;
            };
        }
        const nextCategory = isValidCategory(defaultCategory) ? defaultCategory : '';
        setCategory(nextCategory);
        replaceHardware(nextCategory ? createHardwareState(nextCategory) : {});
        setStoreDetails({ ...INITIAL_STORE_DETAILS });
        return () => {
            active = false;
        };
    }, [show, editItem, defaultCategory, prefillMasterId, hasPrefillMaster]);
    useEffect(() => {
        const requestId = ++autocompleteRequestRef.current;
        if (!show || editItem || !category || masterLoading) return undefined;
        const keyword = autocompleteKeyword.trim();
        if (!keyword) {
            setAutocompleteItems([]);
            setAutocompleteLoading(false);
            return undefined;
        }
        const timer = window.setTimeout(async () => {
            setAutocompleteLoading(true);
            try {
                const response = typeof hardwareService.shopAutocomplete === 'function'
                    ? await hardwareService.shopAutocomplete(category, keyword)
                    : await hardwareService.autocomplete(category, keyword);
                if (requestId !== autocompleteRequestRef.current) return;
                setAutocompleteItems(Array.isArray(response?.data) ? response.data : []);
                setAutocompleteOpen(true);
            } catch {
                if (requestId === autocompleteRequestRef.current) {
                    setAutocompleteItems([]);
                    setAutocompleteOpen(true);
                }
            } finally {
                if (requestId === autocompleteRequestRef.current) {
                    setAutocompleteLoading(false);
                }
            }
        }, 1000);
        return () => window.clearTimeout(timer);
    }, [show, editItem, category, autocompleteKeyword, masterLoading]);
    const chooseCategory = (nextCategory) => {
        ++selectionRequestRef.current;
        clearMasterSelection();
        setCategory(nextCategory);
        replaceHardware(createHardwareState(nextCategory));
        setValidationError('');
        setError('');
        setAutocompleteKeyword('');
        setAutocompleteFieldKey('');
        setAutocompleteItems([]);
        setAutocompleteOpen(false);
    };
    const updateHardware = (key, value, { autocomplete = false } = {}) => {
        setValidationError('');
        // Typing while a suggestion detail is loading invalidates that response.
        ++selectionRequestRef.current;
        const nextHardware = { ...hardwareRef.current, [key]: value };
        if (
            selectedMasterIdRef.current != null &&
            !isSameMasterValues(category, nextHardware, originalMasterValuesRef.current)
        ) {
            clearMasterSelection();
        }
        replaceHardware(nextHardware);
        if (autocomplete && !editItem) {
            setAutocompleteFieldKey(key);
            setAutocompleteKeyword(value);
            setAutocompleteOpen(Boolean(String(value).trim()));
        }
    };
    const selectAutocompleteItem = async (item) => {
        const requestId = ++selectionRequestRef.current;
        const sessionId = modalSessionRef.current;
        const selectedCategory = category;
        const isCurrentRequest = () => requestId === selectionRequestRef.current
            && sessionId === modalSessionRef.current;
        clearMasterSelection();
        setAutocompleteLoading(true);
        setError('');
        try {
            const masterId = item?.masterId ?? item?.id;
            /*
             * สำคัญ: autocomplete response คือ source หลักตาม brief ใหม่
             * จึงต้องมาก่อน detail endpoint เพื่อไม่ให้ข้อมูล nested ที่มากับ
             * /api/hardware/:category/autocomplete ถูก response อื่นทับหาย
             */
            const sources = [item];
            let nextHardware = mergeHardwareValues(category, sources);
            // ถ้า autocomplete ส่ง Master Data มาครบแล้ว ให้ autofill ทันที
            // และไม่ยิง API เพิ่มโดยไม่จำเป็น
            if (!requiredMasterComplete(category, nextHardware) && masterId != null) {
                try {
                    const detailResponse = typeof hardwareService.shopMasterDetail === 'function'
                        ? await hardwareService.shopMasterDetail(masterId)
                        : await hardwareService.masterDetail(masterId);
                    if (!isCurrentRequest()) return;
                    if (detailResponse?.data) {
                        sources.push(detailResponse.data);
                        nextHardware = mergeHardwareValues(category, sources);
                    }
                } catch {
                    // autocomplete item ยังเป็น source หลักต่อได้
                }
            }
            // fallback endpoint รุ่นเดิม เฉพาะเมื่อข้อมูล required ยังไม่ครบจริง ๆ
            if (!requiredMasterComplete(category, nextHardware) && masterId != null) {
                try {
                    const legacyResponse = typeof hardwareService.shopDetail === 'function'
                        ? await hardwareService.shopDetail(category, masterId)
                        : await hardwareService.detail(category, masterId);
                    if (!isCurrentRequest()) return;
                    if (legacyResponse?.data) {
                        sources.push(legacyResponse.data);
                        nextHardware = mergeHardwareValues(category, sources);
                    }
                } catch {
                    // ไม่ block การเลือก suggestion
                }
            }
            if (!isCurrentRequest()) return;
            const displayName = item?.displayName
                || item?.display_name
                || item?.name
                || sources.map((source) => source?.displayName || source?.display_name || source?.name).find(Boolean)
                || '';
            // Model จาก API มีสิทธิ์ก่อน หากไม่มีใช้ Series/ชื่อ RAM แทน โดยคง RAM Type เดิมไว้
            if (category === 'RAM') {
                nextHardware = fillRamModelIfMissing(nextHardware, sources);
                if (!cleanValue(nextHardware.model)) {
                    nextHardware = fillRamModelIfMissing(nextHardware, [{ displayName }]);
                }
            }
            replaceHardware(nextHardware);
            assignMasterSelection(masterId, selectedCategory, nextHardware);
            setStoreDetails((previous) => ({
                ...previous,
                customTitle: displayName || previous.customTitle,
            }));
            setAutocompleteKeyword('');
            setAutocompleteFieldKey('');
            setAutocompleteItems([]);
            setAutocompleteOpen(false);
        } catch (err) {
            if (isCurrentRequest()) {
                setError(getApiErrorMessage(err, 'โหลดข้อมูลฮาร์ดแวร์จากรายการที่เลือกไม่สำเร็จ'));
            }
        } finally {
            if (isCurrentRequest()) setAutocompleteLoading(false);
        }
    };
    const updateStoreDetail = (key, value) => {
        setValidationError('');
        if (editItem) dirtyDetailsRef.current.add(key);
        setStoreDetails((previous) => ({ ...previous, [key]: value }));
    };
    const validateCreate = (currentMasterId, currentHardware) => {
        if (
            currentMasterId == null &&
            fields.some((field) => field.required && !cleanValue(currentHardware[field.key]))
        ) {
            setValidationError('* กรุณากรอกข้อมูลฮาร์ดแวร์ให้ครบ');
            return false;
        }
        if (!storeDetails.customTitle.trim()) {
            setValidationError('* กรุณากรอกชื่อสินค้าที่แสดงในร้าน');
            return false;
        }
        if (String(storeDetails.price).trim() === '') {
            setValidationError('* กรุณากรอกราคาสินค้า');
            return false;
        }
        if (!Number.isFinite(Number(storeDetails.price)) || Number(storeDetails.price) < 0) {
            setValidationError('* กรุณากรอกราคาให้ถูกต้อง');
            return false;
        }
        return true;
    };
    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setValidationError('');
        if (choosingCategory || masterLoading) return;
        if (editItem) {
            const dirty = dirtyDetailsRef.current;
            if (!dirty.size) {
                finishAndClose();
                return;
            }
            setSaving(true);
            try {
                const payload = {};
                if (dirty.has('customTitle')) payload.custom_title = storeDetails.customTitle.trim();
                if (dirty.has('price')) payload.price = Number(storeDetails.price || 0);
                if (dirty.has('warranty')) payload.warranty = storeDetails.warranty.trim();
                if (dirty.has('description')) payload.description = storeDetails.description.trim();
                if (dirty.has('productStatus')) payload.productStatus = storeDetails.productStatus;
                await shopService.updateProduct(editItem.shopProductId, payload);
                onSaved?.();
                finishAndClose();
            } catch (err) {
                setError(getApiErrorMessage(err, 'อัปเดตสินค้าไม่สำเร็จ'));
            } finally {
                setSaving(false);
            }
            return;
        }
        // Read synchronously updated refs, not a potentially stale render closure.
        const currentHardware = hardwareRef.current;
        const currentMasterId = selectedMasterIdRef.current != null
            && isSameMasterValues(category, currentHardware, originalMasterValuesRef.current)
            ? selectedMasterIdRef.current
            : null;
        if (!validateCreate(currentMasterId, currentHardware)) return;
        setSaving(true);
        try {
            let hardwarePayload;
            if (currentMasterId != null) {
                const numericMasterId = Number(currentMasterId);
                hardwarePayload = {
                    productModelId: Number.isFinite(numericMasterId) ? numericMasterId : currentMasterId,
                };
            } else {
                const displayName = createDisplayName(category, currentHardware);
                const backendHardware = createBackendHardware(currentHardware);
                backendHardware.hardware_key = createHardwareKey(displayName);
                backendHardware.display_name = displayName;
                hardwarePayload = backendHardware;
            }
            await shopService.createProduct({
                category,
                hardware: hardwarePayload,
                storeDetails: {
                    customTitle: storeDetails.customTitle.trim(),
                    price: Number(storeDetails.price),
                    warranty: storeDetails.warranty.trim(),
                    description: storeDetails.description.trim(),
                    productStatus: storeDetails.productStatus,
                },
            });
            onSaved?.();
            finishAndClose();
        } catch (err) {
            setError(getApiErrorMessage(err, 'เพิ่มสินค้าไม่สำเร็จ'));
        } finally {
            setSaving(false);
        }
    };
    const renderAutocompletePanel = (fieldKey) => {
        if (
            editItem ||
            !autocompleteOpen ||
            autocompleteFieldKey !== fieldKey ||
            !autocompleteKeyword.trim()
        ) {
            return null;
        }
        return (
            <div className="product-master-autocomplete-menu">
                <div className="product-master-autocomplete-head">
                    <strong>Hardware ที่พบ</strong>
                    <span>{autocompleteLoading ? 'กำลังค้นหา...' : `${autocompleteItems.length} รายการ`}</span>
                </div>
                <div className="product-master-autocomplete-list">
                    {autocompleteLoading ? (
                        <div className="product-master-autocomplete-empty">กำลังค้นหาข้อมูล...</div>
                    ) : autocompleteItems.length ? (
                        autocompleteItems.map((item) => {
                            const id = item?.masterId ?? item?.id;
                            const displayName = item?.displayName || item?.name || '-';
                            const meta = getSuggestionMeta(item, category);
                            return (
                                <button
                                    type="button"
                                    className="product-master-autocomplete-item"
                                    key={`${id ?? displayName}-${displayName}`}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => selectAutocompleteItem(item)}
                                >
                                    <strong>{displayName}</strong>
                                    {meta && <small>{meta}</small>}
                                </button>
                            );
                        })
                    ) : (
                        <div className="product-master-autocomplete-empty">ไม่พบ Hardware ที่ตรงกับคำค้น</div>
                    )}
                </div>
            </div>
        );
    };
    const renderHardwareField = (field) => {
        const value = hardware[field.key] ?? '';
        const canAutocomplete = field.key === 'brand' && !editItem;
        return (
            <Col md={field.md || 6} key={field.key}>
                <Form.Group className={canAutocomplete ? 'product-master-autocomplete-wrap' : ''}>
                    <Form.Label>
                        {field.label}
                        {field.required && <span className="required-star"> *</span>}
                    </Form.Label>
                    {field.options ? (
                        <Form.Select
                            value={value}
                            onChange={(event) => updateHardware(field.key, event.target.value)}
                        >
                            <option value="">{field.placeholder || `เลือก${field.label}`}</option>
                            {value && !field.options.includes(String(value)) && (
                                <option value={value}>{value}</option>
                            )}
                            {field.options.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </Form.Select>
                    ) : (
                        <Form.Control
                            type={field.type || 'text'}
                            min={field.type === 'number' ? 0 : undefined}
                            value={value}
                            placeholder={canAutocomplete ? 'พิมพ์เพื่อค้นหา เช่น AMD, Intel' : (field.placeholder || `กรอก${field.label}`)}
                            autoComplete="off"
                            onFocus={() => {
                                if (
                                    canAutocomplete &&
                                    autocompleteFieldKey === field.key &&
                                    autocompleteKeyword.trim()
                                ) {
                                    setAutocompleteOpen(true);
                                }
                            }}
                            onBlur={() => {
                                if (canAutocomplete) {
                                    window.setTimeout(() => setAutocompleteOpen(false), 150);
                                }
                            }}
                            onChange={(event) => updateHardware(
                                field.key,
                                event.target.value,
                                { autocomplete: canAutocomplete },
                            )}
                        />
                    )}
                    {canAutocomplete && renderAutocompletePanel(field.key)}
                </Form.Group>
            </Col>
        );
    };
    const title = editItem
        ? 'แก้ไขสินค้า'
        : category
            ? `เพิ่มสินค้า (${CATEGORY_LABELS[category]})`
            : hasPrefillMaster
                ? 'เพิ่มสินค้า'
                : 'เลือกหมวดหมู่สินค้าที่ต้องการเพิ่ม';
    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
            backdrop="static"
            dialogClassName="shop-product-form-dialog"
        >
            <Form onSubmit={submit} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {validationError && (
                        <div className="product-form-validation-error">{validationError}</div>
                    )}
                    {masterLoading ? (
                        <LoadingState label="กำลังโหลดข้อมูลฮาร์ดแวร์..." />
                    ) : choosingCategory ? (
                        <>
                            <div className="product-form-section-heading">
                                <strong>เลือกประเภท Hardware</strong>
                                <span />
                            </div>
                            <p className="text-muted mb-3">
                                เลือกหมวดหมู่ก่อน ระบบจะแสดงฟอร์มที่ตรงกับอุปกรณ์นั้น
                            </p>
                            <Row className="g-3">
                                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                    <Col md={6} key={value}>
                                        <Button
                                            type="button"
                                            variant="outline-primary"
                                            className="w-100 text-start py-3 px-3"
                                            onClick={() => chooseCategory(value)}
                                        >
                                            <strong className="d-block">{label}</strong>
                                            <small className="text-muted">{CATEGORY_DESCRIPTIONS[value]}</small>
                                        </Button>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    ) : (
                        <>
                            {!editItem && (
                                <>
                                    <div className="product-form-section-heading">
                                        <strong>ข้อมูลฮาร์ดแวร์ (Master Data)</strong>
                                        <span />
                                    </div>
                                    <Row className="g-3">
                                        {fields.map(renderHardwareField)}
                                    </Row>
                                    <div className="product-form-divider" />
                                </>
                            )}
                            <div className="product-form-section-heading">
                                <strong>ข้อมูลสินค้าของร้าน</strong>
                                <span />
                            </div>
                            <Row className="g-3">
                                <Col md={7}>
                                    <Form.Group>
                                        <Form.Label>
                                            ชื่อสินค้าที่แสดงในร้าน <span className="required-star">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            value={storeDetails.customTitle}
                                            placeholder="กรอกชื่อสินค้าที่ต้องการแสดง"
                                            onChange={(event) => updateStoreDetail('customTitle', event.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Form.Group>
                                        <Form.Label>
                                            ราคา (บาท) <span className="required-star">*</span>
                                        </Form.Label>
                                        <div className="product-price-field">
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                value={storeDetails.price}
                                                placeholder="กรอกราคา"
                                                onChange={(event) => updateStoreDetail('price', event.target.value)}
                                            />
                                            <span>บาท</span>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            สถานะสินค้า <span className="required-star">*</span>
                                        </Form.Label>
                                        <div className="product-status-radio-row">
                                            <Form.Check
                                                type="radio"
                                                name="productStatus"
                                                id="product-active"
                                                label="มีสินค้า"
                                                checked={storeDetails.productStatus === 'ACTIVE'}
                                                onChange={() => updateStoreDetail('productStatus', 'ACTIVE')}
                                            />
                                            <Form.Check
                                                type="radio"
                                                name="productStatus"
                                                id="product-not-active"
                                                label="หมด"
                                                checked={storeDetails.productStatus === 'NOT_ACTIVE'}
                                                onChange={() => updateStoreDetail('productStatus', 'NOT_ACTIVE')}
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            การรับประกัน <span className="optional-label">(ไม่บังคับ)</span>
                                        </Form.Label>
                                        <Form.Select
                                            value={storeDetails.warranty}
                                            onChange={(event) => updateStoreDetail('warranty', event.target.value)}
                                        >
                                            <option value="">เลือกระยะเวลาการรับประกัน</option>
                                            {storeDetails.warranty && !WARRANTY_OPTIONS.includes(storeDetails.warranty) && (
                                                <option value={storeDetails.warranty}>{storeDetails.warranty}</option>
                                            )}
                                            {WARRANTY_OPTIONS.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>รายละเอียดสินค้า</Form.Label>
                                        <div className="product-description-field">
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                maxLength={1000}
                                                value={storeDetails.description}
                                                placeholder="อธิบายรายละเอียดสินค้า จุดเด่น สเปกสำคัญ เงื่อนไขการรับประกัน ฯลฯ"
                                                onChange={(event) => updateStoreDetail('description', event.target.value)}
                                            />
                                            <span>{storeDetails.description.length} / 1000</span>
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={handleClose} disabled={saving}>
                        ยกเลิก
                    </Button>
                    {!choosingCategory && !masterLoading && category && (
                        <Button type="submit" disabled={saving}>
                            {saving ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
                        </Button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
