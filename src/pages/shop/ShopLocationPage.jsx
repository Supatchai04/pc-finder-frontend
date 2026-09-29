import {
  useEffect,
  useState,
} from 'react';

import {
  MapPin,
  Save,
} from 'lucide-react';

import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';

import GoogleMapPicker from '../../components/maps/GoogleMapPicker';

import { shopService } from '../../services/shopService';
import { storeService } from '../../services/storeService';

import { getApiErrorMessage } from '../../utils/api';


export default function ShopLocationPage() {
  const [latitude, setLatitude] =
    useState('');

  const [longitude, setLongitude] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [message, setMessage] =
    useState('');


  useEffect(() => {
    let active = true;


    const load = async () => {
      try {
        const dashboard =
          await shopService.dashboard();

        const info =
          dashboard.data?.storeInfo ||
          {};


        let profile = {};


        if (info.shopId) {
          try {
            const response =
              await storeService.profile(
                info.shopId
              );

            profile =
              response.data || {};
          } catch {
            // ถ้า public profile โหลดไม่ได้
            // ไม่ให้ทั้งหน้าพัง
          }
        }


        if (!active) {
          return;
        }


        const location =
          profile.location || {};


        setLatitude(
          profile.latitude ??
          location.latitude ??
          ''
        );


        setLongitude(
          profile.longitude ??
          location.longitude ??
          ''
        );


        const fullAddress =
          profile.fullAddress ||
          [
            profile.addressText ||
              location.addressText,

            profile.subDistrict ||
              location.subDistrict,

            profile.district ||
              location.district,

            profile.province ||
              location.province,

            profile.zipCode ||
              location.zipCode,
          ]
            .filter(Boolean)
            .join(' ');


        setAddress(
          fullAddress ||
          info.fullAddress ||
          'ยังไม่มีข้อมูลที่อยู่ร้านค้า'
        );
      } catch (err) {
        if (active) {
          setError(
            getApiErrorMessage(
              err,
              'โหลดตำแหน่งร้านค้าไม่สำเร็จ'
            )
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };


    load();


    return () => {
      active = false;
    };
  }, []);


  const handleLocationChange = ({
    latitude: nextLatitude,
    longitude: nextLongitude,
  }) => {
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);

    setMessage('');
    setError('');
  };


  const save = async () => {
    const lat =
      Number(latitude);

    const lng =
      Number(longitude);


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setError(
        'กรุณาค้นหาสถานที่หรือปักหมุดตำแหน่งร้านค้าก่อน'
      );

      return;
    }


    setSaving(true);
    setError('');
    setMessage('');


    try {
      const response =
        await shopService.updateProfile({
          latitude: lat,
          longitude: lng,
        });


      setMessage(
        response.message ||
        'บันทึกตำแหน่งร้านค้าเรียบร้อยแล้ว'
      );
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'บันทึกตำแหน่งร้านค้าไม่สำเร็จ'
        )
      );
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <LoadingState label="กำลังโหลดตำแหน่งร้านค้า..." />
    );
  }


  return (
    <div className="shop-location-page">

      <PageHeader
        title="จัดการตำแหน่งร้านค้า"
        subtitle="ค้นหาและปักหมุดตำแหน่งร้านค้าของคุณบนแผนที่"
      />


      {error && (
        <div className="inline-error">
          {error}
        </div>
      )}


      {message && (
        <div className="inline-success">
          {message}
        </div>
      )}


      <section className="section-card shop-location-card">

        <div className="shop-location-heading">

          <span className="shop-location-heading-icon">
            <MapPin size={21} />
          </span>


          <div>
            <h2>
              ตำแหน่งร้านค้าบนแผนที่
            </h2>

            <p>
              ค้นหาสถานที่ หรือคลิกบนแผนที่เพื่อปักหมุดตำแหน่งร้านจริง
            </p>
          </div>

        </div>


        <div className="shop-location-address">

          <MapPin size={18} />

          <div>
            <strong>
              ที่อยู่ร้านค้า
            </strong>

            <span>
              {address}
            </span>
          </div>

        </div>


        <GoogleMapPicker
          latitude={latitude}
          longitude={longitude}
          onChange={handleLocationChange}
        />


        <div className="shop-location-actions">

          <button
            type="button"
            className="primary-btn"
            onClick={save}
            disabled={saving}
          >
            <Save size={17} />

            {saving
              ? 'กำลังบันทึก...'
              : 'บันทึกตำแหน่งร้านค้า'}
          </button>

        </div>

      </section>

    </div>
  );
}