import { useEffect, useRef, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import { shopService } from '../../services/shopService';
import { storeService } from '../../services/storeService';
import { getApiErrorMessage } from '../../utils/api';

const empty = { shopName: '', phone: '', addressText: '', province: '', district: '', subDistrict: '', zipCode: '', hours: '', facebook: '', line: '', website: '', description: '', latitude: '', longitude: '' };

export default function ShopProfilePage() {
  const [form, setForm] = useState(empty);
  const [initialForm, setInitialForm] = useState(empty);
  const [currentFullAddress, setCurrentFullAddress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const dirtyRef = useRef(new Set());

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const dashboard = await shopService.dashboard();
        const info = dashboard.data?.storeInfo || {};
        let profile = {};
        if (info.shopId) {
          try { profile = (await storeService.profile(info.shopId)).data || {}; } catch { /* public profile is optional for editing */ }
        }
        if (!active) return;
        const contact = profile.contactChannels || profile.contact || {};
        const next = {
          ...empty,
          shopName: profile.shopName || info.shopName || '',
          phone: contact.phone || profile.ownerPhone || '',
          hours: profile.operatingHours || '',
          facebook: contact.facebook || '',
          line: contact.line || contact.lineId || '',
          website: contact.website || '',
          description: profile.description || profile.shopDescription || '',
          latitude: profile.latitude ?? '',
          longitude: profile.longitude ?? '',
        };
        setCurrentFullAddress(profile.fullAddress || info.fullAddress || '');
        setForm(next);
        setInitialForm(next);
      } catch (err) {
        if (active) setError(getApiErrorMessage(err, 'โหลดข้อมูลร้านค้าไม่สำเร็จ'));
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, []);

  const bind = (key) => ({
    value: form[key],
    onChange: (event) => {
      dirtyRef.current.add(key);
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    },
  });

  const reset = () => {
    dirtyRef.current.clear();
    setForm(initialForm);
    setError('');
    setMessage('');
  };

  const save = async () => {
    const dirty = dirtyRef.current;
    if (!dirty.size) {
      setMessage('ยังไม่มีข้อมูลที่แก้ไข');
      return;
    }
    setSaving(true); setError(''); setMessage('');
    try {
      const payload = {};
      if (dirty.has('shopName')) payload.shopName = form.shopName.trim();
      if (dirty.has('description')) payload.shopDescription = form.description.trim();
      if (dirty.has('phone')) payload.ownerPhone = form.phone.trim();
      if (dirty.has('addressText')) payload.addressText = form.addressText.trim();
      if (dirty.has('subDistrict')) payload.subDistrict = form.subDistrict.trim();
      if (dirty.has('district')) payload.district = form.district.trim();
      if (dirty.has('province')) payload.province = form.province.trim();
      if (dirty.has('zipCode')) payload.zipCode = form.zipCode.trim();
      if (dirty.has('latitude') && form.latitude !== '') payload.latitude = Number(form.latitude);
      if (dirty.has('longitude') && form.longitude !== '') payload.longitude = Number(form.longitude);
      if (dirty.has('hours')) payload.operatingHours = form.hours.trim();
      if (['facebook', 'line', 'website'].some((key) => dirty.has(key))) {
        payload.contactChannels = {};
        if (dirty.has('facebook')) payload.contactChannels.facebook = form.facebook.trim();
        if (dirty.has('line')) payload.contactChannels.line = form.line.trim();
        if (dirty.has('website')) payload.contactChannels.website = form.website.trim();
      }
      const response = await shopService.updateProfile(payload);
      setMessage(response.message || 'บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว');
      dirtyRef.current.clear();
      setInitialForm(form);
    } catch (err) { setError(getApiErrorMessage(err, 'บันทึกข้อมูลร้านค้าไม่สำเร็จ')); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingState label="กำลังโหลดข้อมูลร้านค้า..." />;

  return <><PageHeader title="จัดการข้อมูลร้านค้า" subtitle="แก้ไขเฉพาะข้อมูลที่ต้องการ ระบบจะไม่ส่งช่องว่างไปทับข้อมูลเดิม"/>{error && <div className="inline-error">{error}</div>}{message && <div className="inline-success">{message}</div>}<div className="profile-form-grid"><section className="section-card"><h3>ข้อมูลร้านค้า</h3><label>ชื่อร้านค้า<input {...bind('shopName')}/></label><label>เบอร์ติดต่อ<input {...bind('phone')}/></label><label>คำอธิบายร้านค้า<textarea rows="4" {...bind('description')}/></label>{currentFullAddress && <div className="current-address-note"><strong>ที่อยู่ปัจจุบัน</strong><span>{currentFullAddress}</span></div>}<label>บ้านเลขที่ / ซอย / ถนน (กรอกเมื่อจะแก้ไข)<textarea rows="3" {...bind('addressText')} placeholder="กรอกเฉพาะเมื่อจำเป็นต้องแก้ที่อยู่"/></label><div className="form-grid-4"><label>จังหวัด<input {...bind('province')} placeholder="กรอกจังหวัด"/></label><label>เขต / อำเภอ<input {...bind('district')}/></label><label>แขวง / ตำบล<input {...bind('subDistrict')}/></label><label>รหัสไปรษณีย์<input {...bind('zipCode')}/></label></div><div className="form-grid-2"><label>Latitude<input type="number" step="any" {...bind('latitude')}/></label><label>Longitude<input type="number" step="any" {...bind('longitude')}/></label></div><label>เวลาทำการ<input {...bind('hours')}/></label><div className="form-actions"><button className="primary-btn" onClick={save} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</button><button className="outline-btn" onClick={reset} disabled={saving}>คืนค่าก่อนแก้ไข</button></div></section><section className="section-card"><h3>ช่องทางการติดต่อเพิ่มเติม</h3><label>Facebook<input {...bind('facebook')}/></label><label>Line<input {...bind('line')}/></label><label>เว็บไซต์<input {...bind('website')}/></label><small>ขณะนี้ข้อมูลจังหวัด เขต และแขวงสามารถกรอกเป็นข้อความได้</small></section></div></>;
}
