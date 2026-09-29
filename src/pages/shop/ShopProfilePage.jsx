import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  MapPin,
  MessageCircle,
  Store,
} from 'lucide-react';

import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import GoogleMapPicker from '../../components/maps/GoogleMapPicker';

import { shopService } from '../../services/shopService';
import { getApiErrorMessage } from '../../utils/api';


const empty = {
  shopName: '',
  phone: '',

  description: '',
  hours: '',

  addressText: '',
  province: '',
  district: '',
  subDistrict: '',
  zipCode: '',

  facebook: '',
  line: '',
  website: '',

  latitude: '',
  longitude: '',
};


export default function ShopProfilePage() {
  const [
    form,
    setForm,
  ] = useState(empty);

  const [
    initialForm,
    setInitialForm,
  ] = useState(empty);

  const [
    currentFullAddress,
    setCurrentFullAddress,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState('');

  const dirtyRef =
    useRef(new Set());


  /*
   * ============================================
   * LOAD SHOP PROFILE
   *
   * GET /api/stores/profile/me
   * ============================================
   */
  useEffect(() => {
    let active = true;


    const loadProfile =
      async () => {
        setLoading(true);
        setError('');


        try {
          const response =
            await shopService.profileMe();


          /*
           * Backend Response:
           *
           * {
           *   status: "success",
           *   data: {...}
           * }
           */
          const profile =
            response?.data || {};


          if (!active) {
            return;
          }


          const contact =
            profile.contactChannels ||
            {};


          /*
           * เอาข้อมูลจาก Response
           * มาใส่ Textbox ทุกช่อง
           */
          const nextForm = {
            ...empty,


            shopName:
              profile.shopName ||
              '',


            phone:
              profile.ownerPhone ||
              '',


            description:
              profile.shopDescription ||
              '',


            hours:
              profile.operatingHours ||
              '',


            addressText:
              profile.addressText ||
              '',


            province:
              profile.province ||
              '',


            district:
              profile.district ||
              '',


            subDistrict:
              profile.subDistrict ||
              '',


            zipCode:
              profile.zipCode ||
              '',


            facebook:
              contact.facebook ||
              '',


            line:
              contact.line ||
              '',


            website:
              contact.website ||
              '',


            latitude:
              profile.latitude ??
              '',


            longitude:
              profile.longitude ??
              '',
          };


          setForm(
            nextForm
          );


          /*
           * เก็บข้อมูลเดิม
           * สำหรับปุ่มคืนค่าก่อนแก้ไข
           */
          setInitialForm({
            ...nextForm,
          });


          /*
           * สร้างข้อความที่อยู่ปัจจุบัน
           */
          const fullAddress = [
            profile.addressText,
            profile.subDistrict,
            profile.district,
            profile.province,
            profile.zipCode,
          ]
            .filter(Boolean)
            .join(' ');


          setCurrentFullAddress(
            fullAddress
          );


          /*
           * เพิ่งโหลดข้อมูล
           * ยังถือว่ายังไม่ได้แก้ไขอะไร
           */
          dirtyRef.current.clear();
        } catch (err) {
          if (!active) {
            return;
          }


          setError(
            getApiErrorMessage(
              err,
              'โหลดข้อมูลร้านค้าไม่สำเร็จ'
            )
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };


    loadProfile();


    return () => {
      active = false;
    };
  }, []);


  /*
   * ============================================
   * BIND INPUT
   * ============================================
   */
  const bind = (key) => ({
    value:
      form[key] ?? '',

    onChange: (event) => {
      dirtyRef.current.add(
        key
      );


      setForm(
        (previous) => ({
          ...previous,

          [key]:
            event.target.value,
        })
      );


      setMessage('');
    },
  });


  /*
   * ============================================
   * MAP LOCATION
   * ============================================
   */
  const handleLocationChange = ({
    latitude,
    longitude,
  }) => {
    dirtyRef.current.add(
      'location'
    );


    setForm(
      (previous) => ({
        ...previous,

        latitude,
        longitude,
      })
    );


    setMessage('');
    setError('');
  };


  /*
   * ============================================
   * RESET
   * ============================================
   */
  const reset = () => {
    dirtyRef.current.clear();


    setForm({
      ...initialForm,
    });


    setError('');
    setMessage('');
  };


  /*
   * ============================================
   * SAVE
   *
   * PUT /api/stores/profile
   * ============================================
   */
  const save = async () => {
    const dirty =
      dirtyRef.current;


    if (!dirty.size) {
      setMessage(
        'ยังไม่มีข้อมูลที่แก้ไข'
      );

      return;
    }


    setSaving(true);
    setError('');
    setMessage('');


    try {
      const payload = {};


      /*
       * ชื่อร้าน
       */
      if (
        dirty.has(
          'shopName'
        )
      ) {
        payload.shopName =
          form.shopName.trim();
      }


      /*
       * เบอร์เจ้าของร้าน
       */
      if (
        dirty.has(
          'phone'
        )
      ) {
        payload.ownerPhone =
          form.phone.trim();
      }


      /*
       * คำอธิบายร้าน
       */
      if (
        dirty.has(
          'description'
        )
      ) {
        payload.shopDescription =
          form.description.trim();
      }


      /*
       * เวลาทำการ
       */
      if (
        dirty.has(
          'hours'
        )
      ) {
        payload.operatingHours =
          form.hours.trim();
      }


      /*
       * ที่อยู่
       */
      if (
        dirty.has(
          'addressText'
        )
      ) {
        payload.addressText =
          form.addressText.trim();
      }


      if (
        dirty.has(
          'province'
        )
      ) {
        payload.province =
          form.province.trim();
      }


      if (
        dirty.has(
          'district'
        )
      ) {
        payload.district =
          form.district.trim();
      }


      if (
        dirty.has(
          'subDistrict'
        )
      ) {
        payload.subDistrict =
          form.subDistrict.trim();
      }


      if (
        dirty.has(
          'zipCode'
        )
      ) {
        payload.zipCode =
          form.zipCode.trim();
      }


      /*
       * ตำแหน่ง Map
       */
      if (
        dirty.has(
          'location'
        )
      ) {
        const latitude =
          Number(
            form.latitude
          );


        const longitude =
          Number(
            form.longitude
          );


        if (
          !Number.isFinite(
            latitude
          ) ||
          !Number.isFinite(
            longitude
          )
        ) {
          throw new Error(
            'กรุณาปักหมุดตำแหน่งร้านค้าให้ถูกต้อง'
          );
        }


        payload.latitude =
          latitude;


        payload.longitude =
          longitude;
      }


      /*
       * ช่องทางติดต่อ
       *
       * ถ้าแก้ช่องใดช่องหนึ่ง
       * ส่งทั้ง object ไปเลย
       */
      const contactChanged =
        [
          'facebook',
          'line',
          'website',
        ].some(
          (key) =>
            dirty.has(key)
        );


      if (
        contactChanged
      ) {
        payload.contactChannels =
          {
            facebook:
              form.facebook.trim(),

            line:
              form.line.trim(),

            website:
              form.website.trim(),
          };
      }


      /*
       * PUT /api/stores/profile
       */
      const response =
        await shopService.updateProfile(
          payload
        );


      setMessage(
        response?.message ||
        'บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว'
      );


      /*
       * ค่าปัจจุบันกลายเป็นค่าเริ่มต้นใหม่
       */
      setInitialForm({
        ...form,
      });


      /*
       * Update ที่อยู่ปัจจุบัน
       */
      const nextAddress = [
        form.addressText,
        form.subDistrict,
        form.district,
        form.province,
        form.zipCode,
      ]
        .filter(Boolean)
        .join(' ');


      setCurrentFullAddress(
        nextAddress
      );


      dirtyRef.current.clear();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          err?.message ||
            'บันทึกข้อมูลร้านค้าไม่สำเร็จ'
        )
      );
    } finally {
      setSaving(false);
    }
  };


  /*
   * ============================================
   * LOADING
   * ============================================
   */
  if (loading) {
    return (
      <LoadingState
        label="กำลังโหลดข้อมูลร้านค้า..."
      />
    );
  }


  return (
    <div className="shop-profile-page">

      <PageHeader
        title="จัดการข้อมูลร้านค้า"
        subtitle="แก้ไขข้อมูลร้าน ที่อยู่ ช่องทางติดต่อ และตำแหน่งร้านค้าได้จากหน้านี้"
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


      <div className="shop-profile-layout">

        {/* =============================
            LEFT
            ============================= */}

        <div className="shop-profile-main">

          {/* SHOP INFO */}

          <section className="section-card shop-profile-card">

            <div className="shop-profile-section-title">

              <span className="shop-profile-section-icon">
                <Store
                  size={20}
                />
              </span>


              <div>
                <h3>
                  ข้อมูลร้านค้า
                </h3>

                <p>
                  ข้อมูลเดิมจากระบบจะถูกกรอกให้อัตโนมัติ
                </p>
              </div>

            </div>


            <div className="form-grid-2">

              <label>
                ชื่อร้านค้า

                <input
                  {...bind(
                    'shopName'
                  )}
                  placeholder="ชื่อร้านค้า"
                />
              </label>


              <label>
                เบอร์ติดต่อ

                <input
                  {...bind(
                    'phone'
                  )}
                  placeholder="เบอร์โทรศัพท์"
                />
              </label>

            </div>


            <label>
              คำอธิบายร้านค้า

              <textarea
                rows="4"
                {...bind(
                  'description'
                )}
                placeholder="รายละเอียดเกี่ยวกับร้านค้า"
              />
            </label>


            <label>
              เวลาทำการ

              <input
                {...bind(
                  'hours'
                )}
                placeholder="เช่น ทุกวัน 09:00 - 18:00"
              />
            </label>

          </section>


          {/* =============================
              ADDRESS
              ============================= */}

          <section className="section-card shop-profile-card">

            <div className="shop-profile-section-title">

              <span className="shop-profile-section-icon location">
                <MapPin
                  size={20}
                />
              </span>


              <div>
                <h3>
                  ที่อยู่และตำแหน่งร้านค้า
                </h3>

                <p>
                  ข้อมูลที่อยู่เดิมจะแสดงในช่องให้แก้ไขได้ทันที
                </p>
              </div>

            </div>


            {currentFullAddress && (
              <div className="current-address-note">

                <strong>
                  ที่อยู่ปัจจุบัน
                </strong>


                <span>
                  {currentFullAddress}
                </span>

              </div>
            )}


            <label>
              บ้านเลขที่ / ซอย / ถนน

              <textarea
                rows="3"
                {...bind(
                  'addressText'
                )}
                placeholder="บ้านเลขที่ อาคาร ซอย ถนน"
              />
            </label>


            <div className="form-grid-2">

              <label>
                จังหวัด

                <input
                  {...bind(
                    'province'
                  )}
                  placeholder="จังหวัด"
                />
              </label>


              <label>
                เขต / อำเภอ

                <input
                  {...bind(
                    'district'
                  )}
                  placeholder="เขต / อำเภอ"
                />
              </label>


              <label>
                แขวง / ตำบล

                <input
                  {...bind(
                    'subDistrict'
                  )}
                  placeholder="แขวง / ตำบล"
                />
              </label>


              <label>
                รหัสไปรษณีย์

                <input
                  {...bind(
                    'zipCode'
                  )}
                  placeholder="รหัสไปรษณีย์"
                />
              </label>

            </div>


            {/* MAP */}

            <div className="shop-map-section">

              <div className="shop-map-heading">

                <div>
                  <strong>
                    ปักหมุดตำแหน่งร้าน
                  </strong>

                  <span>
                    ตำแหน่งเดิมจาก Backend จะแสดงให้อัตโนมัติ
                  </span>
                </div>

              </div>


              <GoogleMapPicker
                latitude={
                  form.latitude
                }
                longitude={
                  form.longitude
                }
                onChange={
                  handleLocationChange
                }
              />

            </div>

          </section>

        </div>


        {/* =============================
            RIGHT
            ============================= */}

        <aside className="shop-profile-side">

          <section className="section-card shop-profile-card">

            <div className="shop-profile-section-title">

              <span className="shop-profile-section-icon contact">

                <MessageCircle
                  size={20}
                />

              </span>


              <div>
                <h3>
                  ช่องทางการติดต่อ
                </h3>

                <p>
                  ช่องทางเพิ่มเติมสำหรับลูกค้า
                </p>
              </div>

            </div>


            <label>
              Facebook

              <input
                {...bind(
                  'facebook'
                )}
                placeholder="Facebook Page / URL"
              />
            </label>


            <label>
              Line

              <input
                {...bind(
                  'line'
                )}
                placeholder="Line ID"
              />
            </label>


            <label>
              เว็บไซต์

              <input
                {...bind(
                  'website'
                )}
                placeholder="https://..."
              />
            </label>

          </section>


          {/* SAVE */}

          <section className="section-card shop-save-panel">

            <h3>
              บันทึกการเปลี่ยนแปลง
            </h3>


            <p>
              ระบบจะส่งเฉพาะข้อมูลที่มีการแก้ไขไปยัง Backend
            </p>


            <button
              type="button"
              className="primary-btn shop-profile-save-btn"
              onClick={
                save
              }
              disabled={
                saving
              }
            >
              {saving
                ? 'กำลังบันทึก...'
                : 'บันทึกข้อมูลร้านค้า'}
            </button>


            <button
              type="button"
              className="outline-btn shop-profile-reset-btn"
              onClick={
                reset
              }
              disabled={
                saving
              }
            >
              คืนค่าก่อนแก้ไข
            </button>

          </section>

        </aside>

      </div>

    </div>
  );
}