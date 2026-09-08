import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { hardwareService } from '../../services/hardwareService';
import { shopService } from '../../services/shopService';
import { getApiErrorMessage } from '../../utils/api';

const schemas = {
  CPU: [['hardware_key', 'Hardware Key'], ['display_name', 'ชื่อรุ่น'], ['brand', 'แบรนด์'], ['family', 'Family'], ['processorClass', 'Processor Class'], ['socket', 'Socket']],
  RAM: [['hardware_key', 'Hardware Key'], ['display_name', 'ชื่อรุ่น'], ['brand', 'แบรนด์'], ['ramType', 'ประเภท RAM'], ['capacityGB', 'ความจุ (GB)'], ['busSpeed', 'Bus Speed (MHz)']],
  VGA: [['hardware_key', 'Hardware Key'], ['display_name', 'ชื่อรุ่น'], ['brand', 'แบรนด์'], ['series', 'Series'], ['chipset', 'Chipset'], ['vramSize', 'ขนาด VRAM']],
  MAINBOARD: [['hardware_key', 'Hardware Key'], ['display_name', 'ชื่อรุ่น'], ['formFactor', 'Form Factor'], ['brand', 'แบรนด์'], ['socket', 'Socket'], ['chipset', 'Chipset'], ['serie', 'Series']],
  STORAGE: [['hardware_key', 'Hardware Key'], ['display_name', 'ชื่อรุ่น'], ['model', 'Model'], ['storageType', 'ประเภท Storage'], ['interfaceType', 'Interface'], ['capacityGB', 'ความจุ (GB)'], ['brand', 'แบรนด์']],
  PSU: [['hardware_key', 'Hardware Key'], ['display_name', 'ชื่อรุ่น'], ['brand', 'แบรนด์'], ['model', 'Model'], ['watt', 'กำลังไฟ (Watt)'], ['standard80Plus', 'มาตรฐาน 80 Plus']],
};

const initialDetails = { customTitle: '', price: '', warranty: '', description: '', imageUrl: '', productStatus: 'ACTIVE' };

export default function ProductFormModal({ show, onHide, defaultCategory = 'CPU', onSaved, editItem = null }) {
  const [category, setCategory] = useState(defaultCategory);
  const [existing, setExisting] = useState(true);
  const [hardware, setHardware] = useState({ productModelId: '' });
  const [storeDetails, setStoreDetails] = useState(initialDetails);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dirtyDetailsRef = useRef(new Set());

  useEffect(() => {
    if (!show) return;
    setError('');
    dirtyDetailsRef.current.clear();
    if (editItem) {
      setCategory(editItem.category || defaultCategory);
      setStoreDetails({
        customTitle: editItem.customTitle || editItem.hardwareName || '',
        price: editItem.price ?? '',
        warranty: editItem.warranty || '',
        description: editItem.description || '',
        imageUrl: editItem.imageUrl || '',
        productStatus: editItem.productStatus || 'ACTIVE',
      });
    } else {
      setCategory(defaultCategory);
      setExisting(true);
      setHardware({ productModelId: '' });
      setStoreDetails(initialDetails);
      setQuery('');
      setSuggestions([]);
    }
  }, [show, editItem, defaultCategory]);

  useEffect(() => {
    if (!show || editItem || !existing || query.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await hardwareService.autocomplete(category, query.trim());
        setSuggestions(Array.isArray(response.data) ? response.data : []);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [show, editItem, existing, category, query]);

  const fields = useMemo(() => schemas[category] || [['brand', 'แบรนด์']], [category]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError('');
    try {
      if (editItem) {
        const dirty = dirtyDetailsRef.current;
        if (!dirty.size) { onHide(); return; }
        const payload = {};
        if (dirty.has('customTitle')) payload.custom_title = storeDetails.customTitle.trim();
        if (dirty.has('price')) payload.price = Number(storeDetails.price || 0);
        if (dirty.has('warranty')) payload.warranty = storeDetails.warranty.trim();
        if (dirty.has('description')) payload.description = storeDetails.description.trim();
        if (dirty.has('imageUrl')) payload.imageUrl = storeDetails.imageUrl.trim();
        if (dirty.has('productStatus')) payload.productStatus = storeDetails.productStatus;
        await shopService.updateProduct(editItem.shopProductId, payload);
        onSaved?.(); onHide(); return;
      }

      const payload = {
        category,
        hardware: existing ? { productModelId: Number(hardware.productModelId) } : hardware,
        storeDetails: {
          customTitle: storeDetails.customTitle,
          price: Number(storeDetails.price || 0),
          warranty: storeDetails.warranty,
          description: storeDetails.description,
          imageUrl: storeDetails.imageUrl,
        },
      };
      await shopService.createProduct(payload);
      onSaved?.(); onHide();
    } catch (err) {
      setError(getApiErrorMessage(err, editItem ? 'อัปเดตสินค้าไม่สำเร็จ' : 'เพิ่มสินค้าไม่สำเร็จ'));
    } finally { setSaving(false); }
  };

  const updateStoreDetail = (key, value) => {
    if (editItem) dirtyDetailsRef.current.add(key);
    setStoreDetails((prev) => ({ ...prev, [key]: value }));
  };

  const selectExisting = (item) => {
    const id = item.masterId ?? item.id;
    setHardware({ productModelId: id });
    setQuery(item.displayName || item.displayname || item.name || `#${id}`);
    setSuggestions([]);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title>{editItem ? 'แก้ไขสินค้า' : `เพิ่มสินค้า (${category === 'VGA' ? 'VGA Card' : category})`}</Modal.Title></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {!editItem && <><div className="modal-section-title">ข้อมูลฮาร์ดแวร์ (Master Data)</div>
          <Row className="g-3">
            <Col md={4}><Form.Label>หมวดหมู่</Form.Label><Form.Select value={category} onChange={(e) => { setCategory(e.target.value); setHardware({ productModelId: '' }); setQuery(''); }}><option>CPU</option><option>RAM</option><option>VGA</option><option>MAINBOARD</option><option>STORAGE</option><option>PSU</option></Form.Select></Col>
            <Col md={8}><Form.Label>รูปแบบข้อมูล</Form.Label><div className="toggle-row"><Button size="sm" variant={existing ? 'primary' : 'outline-primary'} onClick={() => setExisting(true)}>เลือกจาก Master Data</Button><Button size="sm" variant={!existing ? 'primary' : 'outline-primary'} onClick={() => setExisting(false)}>เพิ่ม Master Data ใหม่</Button></div></Col>
            {existing ? <Col md={12}><Form.Label>ค้นหารายการเดิม</Form.Label><div className="autocomplete-field"><Form.Control required value={query} onChange={(e) => { setQuery(e.target.value); setHardware({ productModelId: '' }); }} placeholder="พิมพ์ชื่อรุ่นอย่างน้อย 2 ตัวอักษร" />{!!suggestions.length && <div className="autocomplete-menu modal-autocomplete">{suggestions.map((item) => <button type="button" key={item.masterId ?? item.id} onClick={() => selectExisting(item)}>{item.displayName || item.displayname || item.name}</button>)}</div>}</div><Form.Text>เลือกแล้ว Master ID: {hardware.productModelId || '-'}</Form.Text></Col> : fields.map(([key, label]) => <Col md={fields.length > 6 ? 4 : 6} key={key}><Form.Label>{label}</Form.Label><Form.Control required value={hardware[key] || ''} onChange={(e) => setHardware((prev) => ({ ...prev, [key]: e.target.value }))} /></Col>)}
          </Row><hr /></>}
          <div className="modal-section-title">ข้อมูลสินค้าในร้าน</div>
          <Row className="g-3">
            <Col md={8}><Form.Label>ชื่อสินค้าที่แสดงในร้าน</Form.Label><Form.Control required value={storeDetails.customTitle} onChange={(e) => updateStoreDetail('customTitle', e.target.value)} /></Col>
            <Col md={4}><Form.Label>ราคา (บาท)</Form.Label><Form.Control type="number" min="0" required value={storeDetails.price} onChange={(e) => updateStoreDetail('price', e.target.value)} /></Col>
            <Col md={4}><Form.Label>การรับประกัน</Form.Label><Form.Control value={storeDetails.warranty} onChange={(e) => updateStoreDetail('warranty', e.target.value)} placeholder="3 Years" /></Col>
            <Col md={8}><Form.Label>Image URL</Form.Label><Form.Control value={storeDetails.imageUrl} onChange={(e) => updateStoreDetail('imageUrl', e.target.value)} /></Col>
            {editItem && <Col md={4}><Form.Label>สถานะสินค้า</Form.Label><Form.Select value={storeDetails.productStatus} onChange={(e) => updateStoreDetail('productStatus', e.target.value)}><option value="ACTIVE">ACTIVE</option><option value="NOT_ACTIVE">NOT_ACTIVE</option></Form.Select></Col>}
            <Col md={12}><Form.Label>รายละเอียดสินค้า</Form.Label><Form.Control as="textarea" rows={4} maxLength={1000} value={storeDetails.description} onChange={(e) => updateStoreDetail('description', e.target.value)} /></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><Button variant="light" onClick={onHide}>ยกเลิก</Button><Button type="submit" disabled={saving || (!editItem && existing && !hardware.productModelId)}>{saving ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}</Button></Modal.Footer>
      </Form>
    </Modal>
  );
}
