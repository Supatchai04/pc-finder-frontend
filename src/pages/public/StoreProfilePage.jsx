import {
  Clock3,
  ExternalLink,
  Facebook,
  Heart,
  MapPin,
  Phone,
  ShoppingBag,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../../auth/AuthContext';

import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';
import LoadingState from '../../components/ui/LoadingState';

import { storeService } from '../../services/storeService';
import { userService } from '../../services/userService';

import { getApiErrorMessage } from '../../utils/api';


/* =========================================================
   HELPERS
   ========================================================= */

const getNumberOrNull = (value) => {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};


/*
 * Marker แบบเดียวกับหน้า Match Stores / Favorites
 * ไม่ใช้ไฟล์ marker default ของ Leaflet
 * เพื่อป้องกันรูป icon แตกตอน build
 */
const STORE_MARKER_ICON = L.divIcon({
  className: '',

  iconSize: [
    36,
    46,
  ],

  iconAnchor: [
    18,
    44,
  ],

  html: `
    <div
      style="
        width: 34px;
        height: 34px;
        position: relative;

        border-radius:
          50% 50% 50% 0;

        background:
          #ef3f37;

        border:
          3px solid #ffffff;

        box-shadow:
          0 3px 10px
          rgba(30, 45, 65, 0.35);

        transform:
          rotate(-45deg);
      "
    >
      <div
        style="
          position: absolute;

          width: 10px;
          height: 10px;

          top: 9px;
          left: 9px;

          border-radius: 50%;

          background:
            #ffffff;
        "
      ></div>
    </div>
  `,
});


/* =========================================================
   LEAFLET STORE MAP
   ========================================================= */

function StorePreviewMap({
  latitude,
  longitude,
  shopName,
}) {
  const mapElementRef =
    useRef(null);

  const mapRef =
    useRef(null);


  const lat =
    getNumberOrNull(
      latitude
    );

  const lng =
    getNumberOrNull(
      longitude
    );


  useEffect(() => {
    if (
      lat === null ||
      lng === null ||
      !mapElementRef.current
    ) {
      return undefined;
    }


    /*
     * กัน Leaflet สร้าง Map ซ้ำ
     */
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }


    const map =
      L.map(
        mapElementRef.current,
        {
          zoomControl: true,
          scrollWheelZoom: true,
        }
      );


    map.setView(
      [
        lat,
        lng,
      ],
      16
    );


    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,

        attribution:
          '&copy; OpenStreetMap contributors',
      }
    ).addTo(map);


    const marker =
      L.marker(
        [
          lat,
          lng,
        ],
        {
          icon:
            STORE_MARKER_ICON,
        }
      ).addTo(map);


    if (shopName) {
      marker.bindPopup(
        shopName
      );
    }


    mapRef.current =
      map;


    /*
     * ให้ Leaflet คำนวณขนาดใหม่
     * หลัง Layout render เสร็จ
     */
    const timer =
      window.setTimeout(
        () => {
          map.invalidateSize();
        },
        250
      );


    return () => {
      window.clearTimeout(
        timer
      );

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    lat,
    lng,
    shopName,
  ]);


  /*
   * ไม่มีพิกัด
   */
  if (
    lat === null ||
    lng === null
  ) {
    return (
      <div className="store-modal-map-empty">

        <MapPin
          size={32}
        />

        <strong>
          ยังไม่มีข้อมูลพิกัดร้านค้า
        </strong>

      </div>
    );
  }


  return (
    <div
      ref={mapElementRef}
      className="store-modal-map"
    />
  );
}


/* =========================================================
   STORE PROFILE PAGE
   ========================================================= */

export default function StoreProfilePage() {
  const { shopId } =
    useParams();

  const navigate =
    useNavigate();

  const { user } =
    useAuth();


  const [
    store,
    setStore,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState('');


  const [
    favorite,
    setFavorite,
  ] = useState(false);


  const [
    busy,
    setBusy,
  ] = useState(false);


  /* =========================================================
     LOAD STORE PROFILE
     ========================================================= */

  useEffect(() => {
    let active = true;


    const run =
      async () => {
        setLoading(true);
        setError('');


        try {
          /*
           * GET
           * /api/stores/:shopId/profile
           */
          const response =
            await storeService.profile(
              shopId
            );


          if (!active) {
            return;
          }


          /*
           * รองรับทั้ง:
           *
           * data: { ... }
           *
           * และ
           *
           * data: {
           *   shop: { ... }
           * }
           */
          const raw =
            response?.data || {};


          const profile =
            raw?.shop ||
            raw;


          setStore(
            profile ||
            null
          );


          /*
           * โหลด Favorite Store
           * เฉพาะ USER
           */
          if (
            user?.role ===
            'USER'
          ) {
            try {
              const favorites =
                await userService
                  .favoriteStores({
                    page: 1,
                    limit: 100,
                  });


              if (active) {
                const rows =
                  Array.isArray(
                    favorites?.data
                  )
                    ? favorites.data
                    : [];


                setFavorite(
                  rows.some(
                    (item) =>
                      Number(
                        item.shopId
                      ) ===
                      Number(
                        shopId
                      )
                  )
                );
              }

            } catch {
              /*
               * Favorite เป็นข้อมูลเสริม
               * ไม่ให้ทำหน้า Profile พัง
               */
            }
          }

        } catch (err) {

          if (active) {
            setError(
              getApiErrorMessage(
                err,
                'โหลดข้อมูลร้านค้าไม่สำเร็จ'
              )
            );
          }

        } finally {

          if (active) {
            setLoading(false);
          }
        }
      };


    run();


    return () => {
      active = false;
    };

  }, [
    shopId,
    user?.role,
  ]);


  /* =========================================================
     FAVORITE STORE
     ========================================================= */

  const toggleFavorite =
    async () => {

      if (!user) {
        navigate(
          '/login',
          {
            state: {
              from:
                `/stores/${shopId}`,
            },
          }
        );

        return;
      }


      if (
        user.role !==
        'USER'
      ) {
        setError(
          'ฟังก์ชันบันทึกร้านค้าใช้สำหรับบัญชีผู้ใช้งานทั่วไป'
        );

        return;
      }


      setBusy(true);
      setError('');


      try {

        if (favorite) {
          await userService
            .removeFavoriteStore(
              Number(
                shopId
              )
            );
        } else {
          await userService
            .addFavoriteStore(
              Number(
                shopId
              )
            );
        }


        setFavorite(
          (value) =>
            !value
        );

      } catch (err) {

        const message =
          getApiErrorMessage(
            err
          );


        /*
         * Backend บอกว่าบันทึกอยู่แล้ว
         */
        if (
          !favorite &&
          err?.response
            ?.status === 409
        ) {
          setFavorite(true);

        } else {
          setError(
            message
          );
        }

      } finally {
        setBusy(false);
      }
    };


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <CustomerPageFrame>

        <div className="content-page public-content-page">

          <LoadingState
            label="กำลังโหลดข้อมูลร้านค้า..."
          />

        </div>

      </CustomerPageFrame>
    );
  }


  /* =========================================================
     NO STORE
     ========================================================= */

  if (!store) {
    return (
      <CustomerPageFrame>

        <div className="content-page public-content-page">

          <div className="empty-inline">
            {error ||
              'ไม่พบข้อมูลร้านค้า'}
          </div>

        </div>

      </CustomerPageFrame>
    );
  }


  /* =========================================================
     NORMALIZE DATA
     ========================================================= */

  const contact =
    store.contactChannels ||
    store.contact ||
    {};


  const location =
    store.location ||
    {};


  const latitude =
    store.latitude ??
    location.latitude ??
    null;


  const longitude =
    store.longitude ??
    location.longitude ??
    null;


  const fullAddress =
    store.fullAddress ||
    [
      store.addressText ??
        location.addressText,

      store.subDistrict ??
        location.subDistrict,

      store.district ??
        location.district,

      store.province ??
        location.province,

      store.zipCode ??
        location.zipCode,
    ]
      .filter(Boolean)
      .join(' ');


  const phone =
    contact.phone ||
    store.ownerPhone ||
    '-';


  const line =
    contact.lineId ||
    contact.line ||
    '-';


  const facebook =
    contact.facebook ||
    '-';


  const website =
    contact.website ||
    '-';


  const hasStructuredContact =
    Boolean(
      contact.phone ||
      contact.lineId ||
      contact.line ||
      contact.facebook ||
      contact.website ||
      store.ownerPhone
    );


  const initials =
    (
      store.shopName ||
      'PC'
    )
      .slice(0, 2)
      .toUpperCase();


  const lat =
    getNumberOrNull(
      latitude
    );

  const lng =
    getNumberOrNull(
      longitude
    );


  const openStreetMapUrl =
    lat !== null &&
    lng !== null
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
      : null;


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <CustomerPageFrame>

      <div className="content-page public-content-page">

        {/* =========================================
            BREADCRUMB
            ========================================= */}

        <div className="breadcrumb-line">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
          >
            ย้อนกลับ
          </button>


          <span>
            /
          </span>


          <span>
            ข้อมูลร้านค้า
          </span>

        </div>


        {/* =========================================
            ERROR
            ========================================= */}

        {error && (
          <div className="inline-error">
            {error}
          </div>
        )}


        {/* =========================================
            STORE HERO
            ========================================= */}

        <div className="store-hero">

          <div className="store-avatar large">

            {store.profileImageUrl ? (
              <img
                src={
                  store.profileImageUrl
                }
                alt={
                  store.shopName
                }
              />
            ) : (
              initials
            )}

          </div>


          <div>

            <h1>
              {store.shopName}
            </h1>


            <p>
              {store.description ||
                store.shopDescription ||
                'ร้านจำหน่ายอุปกรณ์คอมพิวเตอร์'}
            </p>

          </div>


          <button
            type="button"
            className={
              `outline-btn ${
                favorite
                  ? 'favorite-active'
                  : ''
              }`
            }
            onClick={
              toggleFavorite
            }
            disabled={
              busy
            }
          >

            <Heart
              size={16}
              fill={
                favorite
                  ? 'currentColor'
                  : 'none'
              }
            />


            {busy
              ? 'กำลังบันทึก...'
              : favorite
                ? 'บันทึกแล้ว'
                : 'บันทึกร้านนี้'}

          </button>

        </div>


        {/* =========================================
            DETAILS + OPENSTREETMAP
            ========================================= */}

        <div className="profile-map-grid">

          {/* LEFT */}

          <section className="contact-panel">

            <h3>
              รายละเอียดร้านค้า
            </h3>


            {/* HOURS */}

            <div>

              <Clock3
                size={20}
              />

              <span>

                เวลาทำการ

                <strong>
                  {store.operatingHours ||
                    '-'}
                </strong>

              </span>

            </div>


            {hasStructuredContact ? (
              <>

                {/* PHONE */}

                <div>

                  <Phone
                    size={20}
                  />

                  <span>

                    เบอร์ติดต่อ

                    <strong>
                      {phone}
                    </strong>

                  </span>

                </div>


                {/* LINE */}

                <div>

                  <span className="line-icon">
                    L
                  </span>

                  <span>

                    Line

                    <strong>
                      {line}
                    </strong>

                  </span>

                </div>


                {/* FACEBOOK */}

                <div>

                  <Facebook
                    size={20}
                  />

                  <span>

                    Facebook

                    <strong>
                      {facebook}
                    </strong>

                  </span>

                </div>


                {/* WEBSITE */}

                {website !== '-' && (
                  <div>

                    <ExternalLink
                      size={20}
                    />

                    <span>

                      เว็บไซต์

                      <strong>
                        {website}
                      </strong>

                    </span>

                  </div>
                )}

              </>

            ) : (

              <div>

                <Phone
                  size={20}
                />

                <span>

                  ข้อมูลติดต่อ

                  <strong>
                    {store.contactInfo ||
                      store.ownerPhone ||
                      '-'}
                  </strong>

                </span>

              </div>

            )}

          </section>


          {/* RIGHT — REAL LEAFLET MAP */}

          <section className="contact-panel public-store-detail-dialog">

            <h3>
              ตำแหน่งร้านค้า
            </h3>


            <StorePreviewMap
              latitude={
                latitude
              }
              longitude={
                longitude
              }
              shopName={
                store.shopName
              }
            />


            {openStreetMapUrl && (
              <a
                className="outline-btn public-store-map-link"
                href={
                  openStreetMapUrl
                }
                target="_blank"
                rel="noreferrer"
              >

                <ExternalLink
                  size={15}
                />

                เปิด OpenStreetMap

              </a>
            )}

          </section>

        </div>


        {/* =========================================
            ADDRESS
            ========================================= */}

        <section className="address-card">

          <MapPin
            size={22}
          />


          <div>

            <h3>
              ที่อยู่ร้านค้า
            </h3>


            <p>
              {fullAddress ||
                '-'}
            </p>

          </div>

        </section>


        {/* =========================================
            PRODUCTS
            ========================================= */}

        <div className="center-action">

          <button
            type="button"
            className="primary-btn"
            onClick={() =>
              navigate(
                `/stores/${shopId}/products`
              )
            }
          >

            <ShoppingBag
              size={17}
            />

            ดูสินค้าทั้งหมดของร้าน

          </button>

        </div>

      </div>

    </CustomerPageFrame>
  );
}