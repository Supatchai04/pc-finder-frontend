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
    { key: 'brand', label: 'แบรนด์', required: true, md: 4, placeholder: 'กรอกแบรนด์' },
    { key: 'family', label: 'Family', required: true, md: 4, placeholder: 'กรอก Family' },
    { key: '_tier', label: 'Tier (Processor Class)', md: 4, placeholder: 'กรอก Tier' },
    { key: 'processorClass', label: 'Processor', required: true, md: 6, placeholder: 'เช่น 12400F, 7600X' },
    { key: 'socket', label: 'Socket', required: true, md: 6, placeholder: 'เช่น LGA1700, AM5' },
  ],
  MAINBOARD: [
    { key: 'brand', label: 'แบรนด์', required: true, md: 4, placeholder: 'กรอกแบรนด์' },
    { key: 'serie', label: 'Series', required: true, md: 4, placeholder: 'กรอก Series' },
    { key: 'formFactor', label: 'Form Factor', required: true, md: 4, options: ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX'], placeholder: 'เลือก Form Factor' },
    { key: 'socket', label: 'Socket', required: true, md: 6, placeholder: 'เช่น AM5, LGA1700' },
    { key: 'chipset', label: 'Chipset', required: true, md: 6, placeholder: 'เช่น B650, B760' },
  ],
  VGA: [
    { key: 'brand', label: 'แบรนด์', required: true, md: 6, placeholder: 'กรอกแบรนด์' },
    { key: 'series', label: 'Series', required: true, md: 6, placeholder: 'กรอก Series' },
    { key: 'chipset', label: 'Chipset', required: true, md: 6, placeholder: 'เช่น RTX 5070 Ti' },
    { key: 'vramSize', label: 'ขนาด VRAM (GB)', required: true, md: 6, type: 'number', placeholder: 'เช่น 8, 12, 16' },
  ],
  RAM: [
    { key: 'brand', label: 'แบรนด์', required: true, md: 6, placeholder: 'กรอกแบรนด์' },
    { key: 'ramType', label: 'ประเภท RAM', required: true, md: 6, options: ['DDR4', 'DDR5'], placeholder: 'เลือกประเภท RAM' },
    { key: 'capacityGB', label: 'ความจุ (GB)', required: true, md: 6, type: 'number', placeholder: 'เช่น 16, 32, 64' },
    { key: 'busSpeed', label: 'Bus Speed (MHz)', required: true, md: 6, type: 'number', placeholder: 'เช่น 3200, 5600, 6000' },
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
  CPU: 'cpus', MAINBOARD: 'mainboards', VGA: 'vgas', RAM: 'rams', STORAGE: 'storages', PSU: 'psus', COOLER: 'coolers',
};

const INITIAL_STORE_DETAILS = { customTitle: '', price: '', warranty: '', description: '', productStatus: 'ACTIVE' };
const WARRANTY_OPTIONS = ['7 Days', '30 Days', '1 Year', '2 Years', '3 Years', '5 Years', 'Lifetime'];
const isValidCategory = (value) => Boolean(value && CATEGORY_LABELS[value]);

const createHardwareState = (category) => {
  const result = {};
  (HARDWARE_FIELDS[category] || []).forEach((field) => { result[field.key] = ''; });
  return result;
};

const getCategoryDetail = (data, category) => data?.[CATEGORY_DETAIL_KEYS[category]] || {};

const createHardwareFromMaster = (data, category) => {
  const result = createHardwareState(category);
  const detail = getCategoryDetail(data, category);

  const valueFor = (key) => {
    if (key === 'brand') return data?.brand ?? detail?.brand ?? '';
    if (key === 'serie') return detail?.serie ?? detail?.series ?? data?.serie ?? data?.series ?? '';
    if (key === '_tier') return detail?.tier ?? detail?.processorTier ?? data?.tier ?? '';
    if (key === '_coolerType') return detail?.coolerType ?? detail?.type ?? data?.coolerType ?? '';
    if (key === '_socketSupport') {
      const value = detail?.socketSupport ?? detail?.supportedSockets ?? data?.socketSupport ?? '';
      return Array.isArray(value) ? value.join(', ') : value;
    }
    return detail?.[key] ?? data?.[key] ?? '';
  };

  (HARDWARE_FIELDS[category] || []).forEach((field) => { result[field.key] = valueFor(field.key); });
  return result;
};

const createDisplayName = (category, hardware) => {
  if (category === 'CPU') return [hardware.brand, hardware.family, hardware.processorClass].filter(Boolean).join(' ');
  if (category === 'MAINBOARD') return [hardware.brand, hardware.serie, hardware.chipset].filter(Boolean).join(' ');
  if (category === 'VGA') return [hardware.brand, hardware.chipset, hardware.vramSize ? `${hardware.vramSize}GB` : ''].filter(Boolean).join(' ');
  if (category === 'RAM') return [hardware.brand, hardware.capacityGB ? `${hardware.capacityGB}GB` : '', hardware.ramType, hardware.busSpeed ? `${hardware.busSpeed}MHz` : ''].filter(Boolean).join(' ');
  if (category === 'STORAGE') return [hardware.brand, hardware.model, hardware.capacityGB ? `${hardware.capacityGB}GB` : ''].filter(Boolean).join(' ');
  if (category === 'PSU') return [hardware.brand, hardware.model, hardware.watt ? `${hardware.watt}W` : ''].filter(Boolean).join(' ');
  if (category === 'COOLER') return [hardware.brand, hardware.model].filter(Boolean).join(' ');
  return hardware.brand || '';
};

const createHardwareKey = (category, displayName) => `${category}-${displayName}`.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function ProductFormModal({ show, onHide, defaultCategory = '', onSaved, editItem = null, prefillMasterId = null }) {
  const [category, setCategory] = useState('');
  const [hardware, setHardware] = useState({});
  const [storeDetails, setStoreDetails] = useState(INITIAL_STORE_DETAILS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [masterLoading, setMasterLoading] = useState(false);
  const [usingExistingMaster, setUsingExistingMaster] = useState(false);
  const [loadedMasterId, setLoadedMasterId] = useState(null);
  const dirtyDetailsRef = useRef(new Set());
  const fields = useMemo(() => HARDWARE_FIELDS[category] || [], [category]);

  const hasPrefillMaster = !editItem && prefillMasterId != null && prefillMasterId !== '';
  const choosingCategory = !editItem && !hasPrefillMaster && !category;

  useEffect(() => {
    if (!show) return undefined;
    let active = true;

    setError('');
    setValidationError('');
    setSaving(false);
    setMasterLoading(false);
    setUsingExistingMaster(false);
    setLoadedMasterId(null);
    dirtyDetailsRef.current.clear();

    if (editItem) {
      const nextCategory = isValidCategory(editItem.category) ? editItem.category : 'CPU';
      setCategory(nextCategory);
      setHardware(createHardwareState(nextCategory));
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
      setHardware({});
      setStoreDetails({ ...INITIAL_STORE_DETAILS });
      setMasterLoading(true);

      (async () => {
        try {
          const response = await hardwareService.masterDetail(prefillMasterId);
          if (!active) return;
          const data = response?.data || null;
          if (!data) throw new Error('ไม่พบข้อมูลฮาร์ดแวร์จาก Master Data');

          const nextCategory = String(data.category || '').toUpperCase();
          if (!isValidCategory(nextCategory)) throw new Error(`ไม่รองรับหมวดหมู่ ${nextCategory || '-'}`);

          setCategory(nextCategory);
          setHardware(createHardwareFromMaster(data, nextCategory));
          setStoreDetails({ ...INITIAL_STORE_DETAILS, customTitle: data.displayName || '' });
          setLoadedMasterId(data.masterId ?? prefillMasterId);
          setUsingExistingMaster(true);
        } catch (err) {
          if (active) setError(getApiErrorMessage(err, 'โหลดข้อมูลฮาร์ดแวร์ไม่สำเร็จ'));
        } finally {
          if (active) setMasterLoading(false);
        }
      })();

      return () => { active = false; };
    }

    const nextCategory = isValidCategory(defaultCategory) ? defaultCategory : '';
    setCategory(nextCategory);
    setHardware(nextCategory ? createHardwareState(nextCategory) : {});
    setStoreDetails({ ...INITIAL_STORE_DETAILS });
    return () => { active = false; };
  }, [show, editItem, defaultCategory, prefillMasterId, hasPrefillMaster]);

  const chooseCategory = (nextCategory) => {
    setCategory(nextCategory);
    setHardware(createHardwareState(nextCategory));
    setValidationError('');
    setError('');
    setUsingExistingMaster(false);
    setLoadedMasterId(null);
  };

  const updateHardware = (key, value) => {
    if (usingExistingMaster) return;
    setValidationError('');
    setHardware((prev) => ({ ...prev, [key]: value }));
  };

  const updateStoreDetail = (key, value) => {
    setValidationError('');
    if (editItem) dirtyDetailsRef.current.add(key);
    setStoreDetails((prev) => ({ ...prev, [key]: value }));
  };

  const validateCreate = () => {
    if (!usingExistingMaster && fields.some((field) => field.required && !String(hardware[field.key] ?? '').trim())) {
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
      if (!dirty.size) { onHide(); return; }
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
        onHide();
      } catch (err) {
        setError(getApiErrorMessage(err, 'อัปเดตสินค้าไม่สำเร็จ'));
      } finally { setSaving(false); }
      return;
    }

    if (!validateCreate()) return;
    setSaving(true);

    try {
      let hardwarePayload;

      if (usingExistingMaster && loadedMasterId != null) {
        // ใช้ Master Data เดิมจาก Gap Analysis ไม่สร้างซ้ำ
        hardwarePayload = { productModelId: Number(loadedMasterId) };
      } else {
        const displayName = createDisplayName(category, hardware);
        const backendHardware = Object.fromEntries(Object.entries(hardware).filter(([key]) => !key.startsWith('_')));
        backendHardware.hardware_key = createHardwareKey(category, displayName);
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
      onHide();
    } catch (err) {
      setError(getApiErrorMessage(err, 'เพิ่มสินค้าไม่สำเร็จ'));
    } finally { setSaving(false); }
  };

  const renderHardwareField = (field) => {
    const value = hardware[field.key] ?? '';
    return <Col md={field.md || 6} key={field.key}><Form.Group>
      <Form.Label>{field.label}{field.required && <span className="required-star"> *</span>}</Form.Label>
      {field.options ? <Form.Select value={value} disabled={usingExistingMaster} onChange={(e) => updateHardware(field.key, e.target.value)}>
        <option value="">{field.placeholder || `เลือก${field.label}`}</option>
        {value && !field.options.includes(String(value)) && <option value={value}>{value}</option>}
        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
      </Form.Select> : <Form.Control type={field.type || 'text'} min={field.type === 'number' ? 0 : undefined} value={value} disabled={usingExistingMaster} readOnly={usingExistingMaster} placeholder={field.placeholder || `กรอก${field.label}`} onChange={(e) => updateHardware(field.key, e.target.value)}/>} 
    </Form.Group></Col>;
  };

  const title = editItem ? 'แก้ไขสินค้า' : category ? `เพิ่มสินค้า (${CATEGORY_LABELS[category]})` : hasPrefillMaster ? 'เพิ่มสินค้า' : 'เลือกหมวดหมู่สินค้าที่ต้องการเพิ่ม';

  return <Modal show={show} onHide={onHide} centered size="lg" backdrop="static" dialogClassName="shop-product-form-dialog">
    <Form onSubmit={submit} noValidate>
      <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {validationError && <div className="product-form-validation-error">{validationError}</div>}

        {masterLoading ? <LoadingState label="กำลังโหลดข้อมูลฮาร์ดแวร์..."/> : choosingCategory ? <>
          <div className="product-form-section-heading"><strong>เลือกประเภท Hardware</strong><span /></div>
          <p className="text-muted mb-3">เลือกหมวดหมู่ก่อน ระบบจะแสดงฟอร์มที่ตรงกับอุปกรณ์นั้น</p>
          <Row className="g-3">{Object.entries(CATEGORY_LABELS).map(([value, label]) => <Col md={6} key={value}><Button type="button" variant="outline-primary" className="w-100 text-start py-3 px-3" onClick={() => chooseCategory(value)}><strong className="d-block">{label}</strong><small className="text-muted">{CATEGORY_DESCRIPTIONS[value]}</small></Button></Col>)}</Row>
        </> : <>
          {!editItem && <>
            <div className="product-form-section-heading"><strong>ข้อมูลฮาร์ดแวร์ (Master Data)</strong><span /></div>
            {usingExistingMaster && <div className="inline-success mb-3">ดึงข้อมูล Master Data #{loadedMasterId} และกรอกให้อัตโนมัติแล้ว</div>}
            <Row className="g-3">{fields.map(renderHardwareField)}</Row>
            <div className="product-form-divider" />
          </>}

          <div className="product-form-section-heading"><strong>ข้อมูลสินค้าของร้าน</strong><span /></div>
          <Row className="g-3">
            <Col md={7}><Form.Group><Form.Label>ชื่อสินค้าที่แสดงในร้าน <span className="required-star">*</span></Form.Label><Form.Control value={storeDetails.customTitle} placeholder="กรอกชื่อสินค้าที่ต้องการแสดง" onChange={(e) => updateStoreDetail('customTitle', e.target.value)}/></Form.Group></Col>
            <Col md={5}><Form.Group><Form.Label>ราคา (บาท) <span className="required-star">*</span></Form.Label><div className="product-price-field"><Form.Control type="number" min="0" value={storeDetails.price} placeholder="กรอกราคา" onChange={(e) => updateStoreDetail('price', e.target.value)}/><span>บาท</span></div></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>สถานะสินค้า <span className="required-star">*</span></Form.Label><div className="product-status-radio-row"><Form.Check type="radio" name="productStatus" id="product-active" label="มีสินค้า" checked={storeDetails.productStatus === 'ACTIVE'} onChange={() => updateStoreDetail('productStatus', 'ACTIVE')}/><Form.Check type="radio" name="productStatus" id="product-not-active" label="หมด" checked={storeDetails.productStatus === 'NOT_ACTIVE'} onChange={() => updateStoreDetail('productStatus', 'NOT_ACTIVE')}/></div></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>การรับประกัน <span className="optional-label">(ไม่บังคับ)</span></Form.Label><Form.Select value={storeDetails.warranty} onChange={(e) => updateStoreDetail('warranty', e.target.value)}><option value="">เลือกระยะเวลาการรับประกัน</option>{storeDetails.warranty && !WARRANTY_OPTIONS.includes(storeDetails.warranty) && <option value={storeDetails.warranty}>{storeDetails.warranty}</option>}{WARRANTY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</Form.Select></Form.Group></Col>
            <Col md={12}><Form.Group><Form.Label>รายละเอียดสินค้า</Form.Label><div className="product-description-field"><Form.Control as="textarea" rows={5} maxLength={1000} value={storeDetails.description} placeholder="อธิบายรายละเอียดสินค้า จุดเด่น สเปกสำคัญ เงื่อนไขการรับประกัน ฯลฯ" onChange={(e) => updateStoreDetail('description', e.target.value)}/><span>{storeDetails.description.length} / 1000</span></div></Form.Group></Col>
          </Row>
        </>}
      </Modal.Body>
      <Modal.Footer><Button variant="light" onClick={onHide} disabled={saving}>ยกเลิก</Button>{!choosingCategory && !masterLoading && category && <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}</Button>}</Modal.Footer>
    </Form>
  </Modal>;
}
