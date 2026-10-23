import { useEffect, useRef, useState } from 'react';
import { MapPin, Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import GoogleMapPicker from '../../components/maps/GoogleMapPicker';
import { userLocationService } from '../../services/userLocationService';
import { getApiErrorMessage } from '../../utils/api';

const validCoordinate = (value, limit) => (
  (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
  Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit
);

export default function UserLocationPage() {
  const [position, setPosition] = useState({ latitude: '', longitude: '' });
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const savingRef = useRef(false);
  const validPosition = validCoordinate(position.latitude, 90) &&
    validCoordinate(position.longitude, 180);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoaded(false);
    setError('');
    const load = async () => {
      try {
        const response = await userLocationService.get();
        if (response?.status !== 'success') {
          throw new Error(response?.message || 'โหลดตำแหน่งไม่สำเร็จ');
        }
        const data = response.data;
        const empty = data == null ||
          ((data.latitude == null || data.latitude === '') &&
            (data.longitude == null || data.longitude === ''));
        if (!empty && !(validCoordinate(data.latitude, 90) && validCoordinate(data.longitude, 180))) {
          throw new Error('ข้อมูลพิกัดที่ได้รับไม่ถูกต้อง กรุณาลองโหลดอีกครั้ง');
        }
        if (active) {
          setPosition(empty ? { latitude: '', longitude: '' } : {
            latitude: Number(data.latitude), longitude: Number(data.longitude),
          });
          setLoaded(true);
        }
      } catch (err) {
        if (active) setError(getApiErrorMessage(err, 'โหลดตำแหน่งไม่สำเร็จ'));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [attempt]);

  const save = async () => {
    if (!loaded || !validPosition || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await userLocationService.update({
        latitude: Number(position.latitude), longitude: Number(position.longitude),
      });
      if (response?.status !== 'success') {
        throw new Error(response?.message || 'บันทึกตำแหน่งไม่สำเร็จ');
      }
      setMessage(response.message || 'อัปเดตตำแหน่งเรียบร้อยแล้ว');
    } catch (err) {
      setError(getApiErrorMessage(err, 'บันทึกตำแหน่งไม่สำเร็จ'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="กำลังโหลดตำแหน่งของคุณ..." />;

  return (
    <div className="shop-location-page">
      <PageHeader title="ตำแหน่งของฉัน" subtitle="ค้นหาและปักหมุดที่อยู่ของคุณบนแผนที่" />
      {error && <div className="inline-error" role="alert">{error}</div>}
      {message && <div className="inline-success" role="status">{message}</div>}
      {!loaded ? (
        <button type="button" className="primary-btn" onClick={() => setAttempt(value => value + 1)}>
          โหลดตำแหน่งอีกครั้ง
        </button>
      ) : (
        <section className="section-card shop-location-card">
          <div className="shop-location-heading">
            <span className="shop-location-heading-icon"><MapPin size={21} /></span>
            <div>
              <h2>ตำแหน่งที่อยู่บนแผนที่</h2>
              <p>ค้นหาสถานที่ หรือคลิกบนแผนที่เพื่อปักหมุดที่อยู่ของคุณ แล้วกดบันทึก</p>
            </div>
          </div>
          <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <div inert={saving ? '' : undefined}>
              <GoogleMapPicker
                latitude={position.latitude}
                longitude={position.longitude}
                locationLabel="ที่อยู่ของคุณ"
                locationHint="ค้นหาสถานที่ คลิกบนแผนที่ หรือลากหมุดเพื่อเปลี่ยนตำแหน่งที่อยู่ของคุณ"
                onChange={(next) => {
                  if (savingRef.current) return;
                  setPosition(next);
                  setError('');
                  setMessage('');
                }}
              />
            </div>
            <div className="shop-location-actions">
              <button type="button" className="primary-btn" onClick={save} disabled={saving || !validPosition}>
                <Save size={17} />
                {saving ? 'กำลังบันทึก...' : 'บันทึกตำแหน่งของฉัน'}
              </button>
            </div>
          </fieldset>
        </section>
      )}
    </div>
  );
}
