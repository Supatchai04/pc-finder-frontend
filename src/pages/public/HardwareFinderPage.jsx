import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import HardwareSidebar from '../../components/hardware/HardwareSidebar';
import PaginationBar from '../../components/ui/PaginationBar';
import LoadingState from '../../components/ui/LoadingState';
import { hardwareService } from '../../services/hardwareService';
import { getApiErrorMessage } from '../../utils/api';
import { buildStorage } from '../../utils/buildStorage';

const supportedCategories = ['CPU', 'RAM', 'VGA', 'MAINBOARD', 'STORAGE', 'PSU'];
const specColumns = {
  CPU: [['family', 'Family'], ['socket', 'Socket']],
  RAM: [['capacityGB', 'Capacity'], ['busSpeed', 'Bus Speed']],
  VGA: [['vramSize', 'VRAM'], ['chipset', 'Chipset']],
  MAINBOARD: [['socket', 'Socket'], ['chipset', 'Chipset']],
  STORAGE: [['capacityGB', 'Capacity'], ['interfaceType', 'Interface']],
  PSU: [['watt', 'Watt'], ['standard80Plus', '80 Plus']],
};


const specAliases = {
  busSpeed: ['busSpeed', 'bus_speed'],
  vramSize: ['vramSize', 'vram_size'],
  interfaceType: ['interfaceType', 'interface_type'],
  capacityGB: ['capacityGB', 'capacity_gb'],
  standard80Plus: ['standard80Plus', 'standard_80_plus'],
};
const getSpecValue = (specs, key) => {
  const keys = specAliases[key] || [key];
  for (const candidate of keys) {
    if (specs?.[candidate] != null && specs[candidate] !== '') return specs[candidate];
  }
  return '-';
};

const getDisplayName = (item) => item?.displayName || item?.displayname || item?.name || '-';
const getId = (item) => item?.masterId ?? item?.id;
const getPriceText = (price) => {
  if (price == null) return '-';
  if (typeof price === 'object') {
    const min = Number(price.min || 0);
    const max = Number(price.max || 0);
    if (min && max && min !== max) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
    return (min || max).toLocaleString();
  }
  return Number(price).toLocaleString();
};

export default function HardwareFinderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = String(searchParams.get('category') || 'VGA').toUpperCase();
  const [category, setCategoryState] = useState(supportedCategories.includes(initialCategory) ? initialCategory : 'VGA');
  const [brand, setBrand] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selected, setSelected] = useState(() => buildStorage.getSelected());
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const setCategory = (nextCategory) => {
    setCategoryState(nextCategory);
    const next = new URLSearchParams(searchParams);
    next.set('category', nextCategory);
    setSearchParams(next, { replace: true });
  };

  const load = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await hardwareService.list(category, { page, limit: 20, ...(appliedSearch ? { search: appliedSearch } : {}) });
      setRows(Array.isArray(response.data) ? response.data : []);
      setMeta(response.meta || { page, totalPages: 1, totalItems: response.data?.length || 0, limit: 20 });
    } catch (err) {
      setRows([]);
      setError(getApiErrorMessage(err, 'โหลดข้อมูลฮาร์ดแวร์ไม่สำเร็จ'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBrand('ทั้งหมด');
    setAppliedSearch('');
    setSearch('');
    setSuggestions([]);
  }, [category]);

  useEffect(() => { load(1); }, [category, appliedSearch]);
  useEffect(() => { buildStorage.setSelected(selected); }, [selected]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await hardwareService.autocomplete(category, search.trim());
        setSuggestions(Array.isArray(response.data) ? response.data : []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [category, search]);

  const brands = useMemo(() => ['ทั้งหมด', ...new Set(rows.map((x) => x.brand).filter(Boolean))], [rows]);
  const filteredRows = useMemo(() => rows.filter((item) => brand === 'ทั้งหมด' || item.brand === brand), [rows, brand]);
  const columns = specColumns[category] || [['', 'Spec 1'], ['', 'Spec 2']];
  const selectedCount = Object.values(selected).reduce((total, items) => total + (Array.isArray(items) ? items.length : (items ? 1 : 0)), 0);
  const selectedCategoryCount = Object.values(selected).filter((items) => Array.isArray(items) ? items.length > 0 : Boolean(items)).length;

  const isSelected = (item) => {
    const id = getId(item);
    const categoryItems = Array.isArray(selected[category]) ? selected[category] : (selected[category] ? [selected[category]] : []);
    return categoryItems.some((selectedItem) => getId(selectedItem) === id);
  };

  const toggle = (item) => {
    const id = getId(item);
    setSelected((prev) => {
      const current = Array.isArray(prev[category]) ? prev[category] : (prev[category] ? [prev[category]] : []);
      const exists = current.some((selectedItem) => getId(selectedItem) === id);
      const nextCategoryItems = exists
        ? current.filter((selectedItem) => getId(selectedItem) !== id)
        : [...current, item];

      const next = { ...prev };
      if (nextCategoryItems.length) next[category] = nextCategoryItems;
      else delete next[category];
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

  return (
    <div className="finder-layout">
      <HardwareSidebar active={category} selected={selected} onSelect={setCategory} />
      <main className="finder-main">
        <div className="finder-toolbar top">
          <div className="filter-group"><label>Brand (หน้านี้)</label><select value={brand} onChange={(e) => setBrand(e.target.value)}>{brands.map((b) => <option key={b}>{b}</option>)}</select></div>
          <div className="filter-group"><label>Series</label><select disabled title="ตัวกรอง Series ยังไม่เปิดใช้งาน"><option>Series — เร็ว ๆ นี้</option></select></div>
          <div className="finder-search autocomplete-wrap"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitSearch()} placeholder="ค้นหาสินค้า..." /><button onClick={submitSearch}>ค้นหา</button>
            {!!suggestions.length && <div className="autocomplete-menu">{suggestions.map((item) => <button key={getId(item)} onClick={() => chooseSuggestion(item)}>{getDisplayName(item)}</button>)}</div>}
          </div>
        </div>
        <div className="selected-build-strip">
          <div><strong>รายการที่เลือก {selectedCount} ชิ้น จาก {selectedCategoryCount} หมวด</strong><span>{selectedCount ? Object.entries(selected).flatMap(([key, items]) => (Array.isArray(items) ? items : [items]).filter(Boolean).map((item) => `${key}: ${getDisplayName(item)}`)).join(' • ') : 'เลือกอุปกรณ์จากตารางได้หลายชิ้นต่อหมวดเพื่อเปรียบเทียบ'}</span></div>
          {selectedCount > 0 && <button className="icon-text-btn" onClick={clearSelected}><RotateCcw size={15}/> ล้างรายการ</button>}
        </div>
        <div className="table-title-row"><h2>{category === 'VGA' ? 'VGA Card' : category} <span>({meta.totalItems ?? filteredRows.length} รายการ)</span></h2><div className="sort-control"><SlidersHorizontal size={15} /> Brand filter <span className="muted-note">Series filter ยังไม่เปิดใช้งาน</span></div></div>
        <div className="finder-table-wrap">
          {loading ? <LoadingState label="กำลังโหลดข้อมูลฮาร์ดแวร์..." /> : <>
            <table className="finder-table">
              <thead><tr><th>Brand</th><th>Model</th><th>{columns[0][1]}</th><th>{columns[1][1]}</th><th>ราคา</th><th>เลือก</th></tr></thead>
              <tbody>{filteredRows.map((item) => {
                const id = getId(item);
                const specs = item.specs || {};
                return <tr key={id}><td>{item.brand || '-'}</td><td><Link className="hardware-name-link" to={`/hardware/${category}/${id}`}>{getDisplayName(item)}</Link></td><td>{getSpecValue(specs, columns[0][0])}</td><td>{getSpecValue(specs, columns[1][0])}</td><td className="price-cell">{getPriceText(item.price)}{item.price != null ? '.-' : ''}</td><td><input type="checkbox" checked={isSelected(item)} onChange={() => toggle(item)} aria-label={`เลือก ${getDisplayName(item)}`} /></td></tr>;
              })}</tbody>
            </table>
            {!filteredRows.length && <div className="empty-inline">{error || 'ไม่พบรายการที่ตรงกับการค้นหา'}</div>}
          </>}
        </div>
        <div className="finder-footer"><PaginationBar page={meta.page || 1} pages={meta.totalPages || 1} onChange={load} /><div className="per-page">แสดงสูงสุด {meta.limit || 20} รายการ</div></div>
        <button className="search-store-floating" disabled={!selectedCount} onClick={() => navigate('/compare', { state: { selected } })}><Search size={17} /> ค้นหาร้านค้า ({selectedCount})</button>
      </main>
    </div>
  );
}
