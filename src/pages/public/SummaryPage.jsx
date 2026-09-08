import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Brand from '../../components/layout/Brand';
import LoadingState from '../../components/ui/LoadingState';
import { hardwareService } from '../../services/hardwareService';
import { getApiErrorMessage } from '../../utils/api';
import { buildStorage } from '../../utils/buildStorage';

export default function SummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const shopProductIds = useMemo(() => location.state?.shopProductIds || buildStorage.getSummaryProductIds(), [location.state]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shopProductIds.length) {
      setError('ยังไม่มีรายการสินค้าให้สร้างใบสรุป');
      setLoading(false);
      return;
    }
    buildStorage.setSummaryProductIds(shopProductIds);
    hardwareService.summary(shopProductIds).then((res) => setData(res.data || null)).catch((err) => setError(getApiErrorMessage(err, 'สร้างใบสรุปไม่สำเร็จ'))).finally(() => setLoading(false));
  }, [shopProductIds]);

  if (loading) return <div className="summary-sheet"><LoadingState label="กำลังสร้างใบสรุป..." /></div>;
  const rows = data?.items || [];
  const total = data?.summary?.totalPrice ?? rows.reduce((sum, item) => sum + Number(item.price || item.unitPrice || 0), 0);
  return <div className="summary-page-wrap"><div className="summary-toolbar print-hide"><button className="outline-btn" onClick={() => navigate(-1)}><ArrowLeft size={16}/> กลับ</button>{!error && <button className="primary-btn" onClick={() => window.print()}><Printer size={16}/> พิมพ์ / บันทึก PDF</button>}</div><div className="summary-sheet"><Brand /><h1>สรุปรายการสินค้า</h1><p>เอกสารสรุปรายการสินค้าที่เลือกจาก PC FINDER</p>{error ? <div className="empty-inline">{error}</div> : <><table><thead><tr><th>หมวด</th><th>ชื่อสินค้า</th><th>ราคา</th><th>ชื่อร้านค้า</th><th>ที่อยู่ร้านค้า</th></tr></thead><tbody>{rows.map((x) => <tr key={x.shopProductId}><td>{x.category || '-'}</td><td>{x.displayName || x.hardwareName || '-'}</td><td>{Number(x.price || x.unitPrice || 0).toLocaleString()}.-</td><td>{x.shop?.shopName || '-'}</td><td>{x.shop?.addressText || x.shop?.shopAddress || [x.shop?.subDistrict, x.shop?.district, x.shop?.province, x.shop?.zipCode].filter(Boolean).join(' ') || '-'}</td></tr>)}</tbody></table><div className="summary-total"><span>รวมทั้งหมด</span><strong>{Number(total || 0).toLocaleString()}.-</strong></div><div className="summary-meta">ทั้งหมด {data?.summary?.totalItems ?? rows.length} รายการ</div></>}</div></div>;
}
