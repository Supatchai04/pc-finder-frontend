import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { shopService } from '../../services/shopService';
import { getApiErrorMessage } from '../../utils/api';
import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';

export default function ShopRegisterPage() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setStatus('');
    const form = e.currentTarget;
    const formData = new FormData();
    const values = {
      ownerFirstName: form.ownerFirstName.value,
      ownerLastName: form.ownerLastName.value,
      shopName: form.shopName.value,
      addressText: form.addressText.value,
      subDistrict: form.subDistrict.value,
      district: form.district.value,
      province: form.province.value,
      zipCode: form.zipCode.value,
      ownerPhone: form.ownerPhone.value,
      operatingHours: form.operatingHours.value,
      latitude: form.latitude.value,
      longitude: form.longitude.value,
      contactChannels: JSON.stringify({
        line: form.line.value,
        facebook: form.facebook.value,
        website: form.website.value,
      }),
    };
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));
    ['idCardImage', 'businessRegImage', 'storeImage'].forEach((key) => {
      const file = form[key]?.files?.[0]; if (file) formData.append(key, file);
    });
    try {
      const response = await shopService.register(formData);
      setStatus(response.message || 'ส่งคำขอเปิดร้านแล้ว กรุณารอผู้ดูแลระบบยืนยัน');
    } catch (err) { setError(getApiErrorMessage(err, 'ส่งคำขอเปิดร้านไม่สำเร็จ')); }
    finally { setSaving(false); }
  };

  return <CustomerPageFrame><div className="content-page public-content-page"><PageHeader title="กรอกฟอร์มร้านค้า" subtitle="กรอกข้อมูลให้ครบถ้วนเพื่อส่งคำขอเปิดร้านในระบบ PC FINDER"/>
    {error && <div className="inline-error">{error}</div>}{status && <div className="inline-success">{status}</div>}
    <form className="register-form" onSubmit={submit} encType="multipart/form-data">
      <section><h3>ข้อมูลเจ้าของร้านและร้านค้า</h3><div className="form-grid-2"><label>ชื่อเจ้าของร้าน<input name="ownerFirstName" required/></label><label>นามสกุล<input name="ownerLastName" required/></label><label>ชื่อร้านค้า<input name="shopName" required/></label><label>เบอร์โทรศัพท์<input name="ownerPhone" required/></label></div></section>
      <section><h3>ช่องทางการติดต่อ</h3><div className="form-grid-3"><label>Line ID<input name="line"/></label><label>Facebook<input name="facebook"/></label><label>เว็บไซต์<input name="website"/></label></div></section>
      <section><h3>ที่อยู่ร้านค้า</h3><label>บ้านเลขที่ / ซอย / ถนน<textarea name="addressText" rows="3" required/></label><div className="form-grid-4"><label>จังหวัด<input name="province" required placeholder="กรอกจังหวัด"/></label><label>เขต / อำเภอ<input name="district" required/></label><label>แขวง / ตำบล<input name="subDistrict" required/></label><label>รหัสไปรษณีย์<input name="zipCode" required/></label></div><div className="form-grid-2"><label>Latitude<input name="latitude" type="number" step="any" required/></label><label>Longitude<input name="longitude" type="number" step="any" required/></label></div></section>
      <section><h3>เวลาทำการ</h3><label>รายละเอียดเวลาทำการ<input name="operatingHours" placeholder="เช่น จันทร์-เสาร์ 09:00 - 18:00" required/></label></section>
      <section><h3>เอกสารยืนยัน</h3><div className="form-grid-3"><label>รูปบัตรประชาชน<input name="idCardImage" type="file" accept="image/*" required/></label><label>หนังสือรับรองบริษัท (ถ้ามี)<input name="businessRegImage" type="file" accept="image/*,.pdf"/></label><label>รูปหน้าร้าน<input name="storeImage" type="file" accept="image/*" required/></label></div></section>
      <button className="primary-btn wide" type="submit" disabled={saving}>{saving ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอเปิดร้าน'}</button>
    </form>
  </div></CustomerPageFrame>;
}
