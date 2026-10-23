import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Info, MapPin, Save } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import GoogleMapPicker from '../../components/maps/GoogleMapPicker';
import { userLocationService } from '../../services/userLocationService';
import { getApiErrorMessage } from '../../utils/api';

const emptyPosition = { latitude: '', longitude: '' };
const validCoordinate = (value, limit) => (
  value !== '' && value !== null && value !== undefined &&
  Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit
);
const isValidPosition = (value) =>
  validCoordinate(value.latitude, 90) && validCoordinate(value.longitude, 180);

export default function UserLocationPage() {
  const { user } = useAuth();
  const [position, setPosition] = useState(emptyPosition);
  const [savedPosition, setSavedPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [source, setSource] = useState('none');
  const [readIssue, setReadIssue] = useState(false);
  const savingRef = useRef(false);
  const validPosition = isValidPosition(position);
  const changed = validPosition && (
    source === 'device' || !savedPosition ||
    Number(position.latitude) !== savedPosition.latitude ||
    Number(position.longitude) !== savedPosition.longitude
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setMessage('');
    const load = async () => {
      try {
        const result = await userLocationService.loadSaved(user);
        if (!active) return;
        setPosition(result.position || emptyPosition);
        setSavedPosition(result.position);
        setSource(result.source);
        setReadIssue(Boolean(result.readError));
      } catch (err) {
        if (active) {
          setPosition(emptyPosition);
          setSavedPosition(null);
          setReadIssue(true);
          setError(getApiErrorMessage(err, 'โหลดข้อมูลพิกัดเดิมไม่ได้ แต่คุณยังบันทึกตำแหน่งใหม่ได้'));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user?.userId, user?.id, user?.email]);

  const save = async () => {
    if (!validPosition || savingRef.current) return;
    const nextPosition = {
      latitude: Number(position.latitude),
      longitude: Number(position.longitude),
    };
    savingRef.current = true;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await userLocationService.update(nextPosition);
      if (response?.status && response.status !== 'success') {
        throw new Error(response?.message || 'บันทึกตำแหน่งไม่สำเร็จ');
      }
      userLocationService.cacheSaved(user, nextPosition);
      setPosition(nextPosition);
      setSavedPosition(nextPosition);
      setSource('saved');
      setReadIssue(false);
      setMessage(response?.message || 'บันทึกตำแหน่งเรียบร้อยแล้ว');
    } catch (err) {
      setError(getApiErrorMessage(err, 'บันทึกตำแหน่งไม่สำเร็จ กรุณาลองอีกครั้ง'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <CustomerPageFrame>
      <div className="user-location-page">
        <PageHeader title="ตำแหน่งของฉัน" subtitle="บันทึกตำแหน่งสำหรับใช้เปรียบเทียบระยะทางกับร้านจำหน่ายอุปกรณ์คอมพิวเตอร์" />
        {loading ? (
          <LoadingState label="กำลังตรวจสอบตำแหน่งที่บันทึกไว้..." />
        ) : (
          <section className="section-card user-location-card">
            <div className="user-location-card-header">
              <div className="user-location-card-title">
                <span className="user-location-card-icon"><MapPin size={22} /></span>
                <div>
                  <h2>เลือกตำแหน่งของคุณบนแผนที่</h2>
                  <p>ค้นหาสถานที่ คลิกแผนที่ หรือลากหมุดไปยังตำแหน่งที่ต้องการ แล้วกดบันทึก</p>
                </div>
              </div>
              <span className={`user-location-status ${source === 'saved' || source === 'server' ? 'is-saved' : ''}`}>
                {source === 'saved' || source === 'server' ? <CheckCircle2 size={15} /> : <Info size={15} />}
                {source === 'saved' || source === 'server'
                  ? 'มีตำแหน่งที่บันทึกไว้'
                  : source === 'device' ? 'แสดงตำแหน่งจากอุปกรณ์นี้' : 'ยังไม่มีตำแหน่งที่ยืนยันได้'}
              </span>
            </div>
            {readIssue && (
              <div className="user-location-notice" role="status">
                <Info size={17} />
                <span>ยังตรวจสอบข้อมูลตำแหน่งจากเซิร์ฟเวอร์ไม่ได้ แต่สามารถปักหมุดและบันทึกใหม่ได้ ข้อมูลจะถือว่าบันทึกสำเร็จเมื่อ API ยืนยันเท่านั้น</span>
              </div>
            )}
            {error && <div className="inline-error" role="alert">{error}</div>}
            {message && <div className="inline-success" role="status">{message}</div>}
            <fieldset disabled={saving} className="user-location-fieldset">
              <GoogleMapPicker
                latitude={position.latitude}
                longitude={position.longitude}
                locationLabel="ที่อยู่ของคุณ"
                locationHint="หมุดนี้จะใช้คำนวณระยะทางไปยังร้านค้า เมื่อบันทึกแล้วให้กลับไปค้นหาร้านค้าอีกครั้ง"
                onChange={(next) => {
                  if (savingRef.current) return;
                  setPosition(next);
                  setError('');
                  setMessage('');
                }}
              />
              <div className="user-location-footer">
                <div className="user-location-help">
                  <strong>{validPosition ? (changed ? 'เลือกตำแหน่งใหม่แล้ว' : 'ตำแหน่งปัจจุบัน') : 'กรุณาปักหมุดบนแผนที่'}</strong>
                  <span>{validPosition
                    ? (changed ? 'กดบันทึกเพื่อใช้ตำแหน่งใหม่นี้เปรียบเทียบระยะทาง' : 'ตำแหน่งนี้พร้อมสำหรับการเปรียบเทียบระยะทาง')
                    : 'สามารถค้นหาสถานที่หรือคลิกแผนที่เพื่อเลือกตำแหน่ง'}</span>
                </div>
                <button type="button" className="primary-btn user-location-save" onClick={save} disabled={saving || !validPosition || !changed}>
                  <Save size={17} />
                  {saving ? 'กำลังบันทึก...' : 'บันทึกตำแหน่งของฉัน'}
                </button>
              </div>
            </fieldset>
          </section>
        )}
      </div>
    </CustomerPageFrame>
  );
}
