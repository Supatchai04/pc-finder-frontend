import {
  Clock3,
  ExternalLink,
  Heart,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  Modal,
} from 'react-bootstrap';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../../auth/AuthContext';

import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';
import LoadingState from '../../components/ui/LoadingState';
import PaginationBar from '../../components/ui/PaginationBar';
import StatusBadge from '../../components/ui/StatusBadge';

import { storeService } from '../../services/storeService';
import { userService } from '../../services/userService';

import { getApiErrorMessage } from '../../utils/api';


const categories = [
  'CPU',
  'RAM',
  'VGA',
  'MAINBOARD',
  'STORAGE',
  'PSU',
];


/* =========================================================
   MAP HELPERS
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


const STORE_MARKER_ICON =
  L.divIcon({
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
   PAGE
   ========================================================= */

export default function StoreProductsPage() {
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
    products,
    setProducts,
  ] = useState([]);


  const [
    meta,
    setMeta,
  ] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });


  const [
    category,
    setCategory,
  ] = useState('');


  const [
    search,
    setSearch,
  ] = useState('');


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState('');


  const [
    favoriteIds,
    setFavoriteIds,
  ] = useState(
    new Set()
  );


  const [
    busyId,
    setBusyId,
  ] = useState(null);


  /* =========================================================
     STORE MODAL
     ========================================================= */

  const [
    storeModalOpen,
    setStoreModalOpen,
  ] = useState(false);


  const openStoreModal =
    () => {
      setStoreModalOpen(true);
    };


  const closeStoreModal =
    () => {
      setStoreModalOpen(false);
    };


  /* =========================================================
     LOAD STORE + PRODUCTS
     ========================================================= */

  const load =
    async (
      page = 1
    ) => {

      setLoading(true);
      setError('');


      try {
        const [
          profileRes,
          productsRes,
        ] = await Promise.all([

          store
            ? Promise.resolve({
                data: store,
              })
            : storeService.profile(
                shopId
              ),

          storeService.products(
            shopId,
            {
              page,
              limit: 20,

              ...(category
                ? {
                    category,
                  }
                : {}),
            }
          ),
        ]);


        /*
         * รองรับทั้ง:
         *
         * data: {...}
         * และ
         * data: { shop: {...} }
         */
        const rawProfile =
          profileRes?.data || {};


        const profile =
          rawProfile?.shop ||
          rawProfile;


        setStore(
          profile || store
        );


        const productList =
          Array.isArray(
            productsRes.data
          )
            ? productsRes.data
            : [];


        setProducts(
          productList
        );


        setMeta(
          productsRes.meta || {
            page,
            totalPages: 1,
            totalItems:
              productList.length,
            limit: 20,
          }
        );


        /*
         * Favorite Product
         */
        if (
          user?.role ===
          'USER'
        ) {
          try {
            const favoriteRes =
              await userService
                .favoriteProducts({
                  page: 1,
                  limit: 100,
                });


            setFavoriteIds(
              new Set(
                (
                  favoriteRes.data ||
                  []
                ).map(
                  (item) =>
                    Number(
                      item.shopProductId
                    )
                )
              )
            );

          } catch {
            /*
             * Favorite โหลดไม่ได้
             * ไม่ให้กระทบรายการสินค้า
             */
          }

        } else {
          setFavoriteIds(
            new Set()
          );
        }

      } catch (err) {

        setError(
          getApiErrorMessage(
            err,
            'โหลดรายการสินค้าไม่สำเร็จ'
          )
        );

        setProducts([]);

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    load(1);

  }, [
    shopId,
    category,
    user?.role,
  ]);


  /* =========================================================
     SEARCH
     ========================================================= */

  const visibleProducts =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      if (!keyword) {
        return products;
      }


      return products.filter(
        (item) =>
          [
            item.customTitle,
            item.hardwareName,
            item.displayName,
            item.category,
            item.description,
          ]
            .filter(Boolean)
            .some(
              (value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    keyword
                  )
            )
      );

    }, [
      products,
      search,
    ]);


  /* =========================================================
     FAVORITE PRODUCT
     ========================================================= */

  const toggleFavoriteProduct =
    async (id) => {

      if (!user) {
        navigate(
          '/login',
          {
            state: {
              from:
                `/stores/${shopId}/products`,
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
          'ฟังก์ชันบันทึกสินค้าใช้สำหรับบัญชีผู้ใช้งานทั่วไป'
        );

        return;
      }


      setBusyId(id);
      setError('');


      try {
        const productId =
          Number(id);


        if (
          favoriteIds.has(
            productId
          )
        ) {
          await userService
            .removeFavoriteProduct(
              id
            );

        } else {
          await userService
            .addFavoriteProduct(
              id
            );
        }


        setFavoriteIds(
          (previous) => {

            const next =
              new Set(
                previous
              );


            if (
              next.has(
                productId
              )
            ) {
              next.delete(
                productId
              );

            } else {
              next.add(
                productId
              );
            }


            return next;
          }
        );

      } catch (err) {

        if (
          !favoriteIds.has(
            Number(id)
          ) &&
          err?.response?.status ===
            409
        ) {
          setFavoriteIds(
            (previous) =>
              new Set([
                ...previous,
                Number(id),
              ])
          );

        } else {
          setError(
            getApiErrorMessage(
              err,
              'บันทึกสินค้าไม่สำเร็จ'
            )
          );
        }

      } finally {
        setBusyId(null);
      }
    };


  /* =========================================================
     STORE DATA FOR MODAL
     ========================================================= */

  const contact =
    store?.contactChannels ||
    store?.contact ||
    {};


  const location =
    store?.location ||
    {};


  const modalLatitude =
    getNumberOrNull(
      store?.latitude ??
      location?.latitude
    );


  const modalLongitude =
    getNumberOrNull(
      store?.longitude ??
      location?.longitude
    );


  const hasModalLocation =
    modalLatitude !== null &&
    modalLongitude !== null;


  const fullAddress =
    store?.fullAddress ||
    [
      store?.addressText ??
        location?.addressText,

      store?.subDistrict ??
        location?.subDistrict,

      store?.district ??
        location?.district,

      store?.province ??
        location?.province,

      store?.zipCode ??
        location?.zipCode,
    ]
      .filter(Boolean)
      .join(' ');


  const initials =
    (
      store?.shopName ||
      'PC'
    )
      .slice(0, 2)
      .toUpperCase();


  /* =========================================================
     UI
     ========================================================= */

  return (
    <CustomerPageFrame>

      <div className="content-page public-content-page">

        {/* =========================================
            STORE HEADER
            ========================================= */}

        <div className="store-hero">

          <div className="store-avatar large">

            {store?.profileImageUrl ? (

              <img
                src={
                  store.profileImageUrl
                }
                alt={
                  store.shopName ||
                  'ร้านค้า'
                }
              />

            ) : (
              initials
            )}

          </div>


          <div>

            <h1>
              {store?.shopName ||
                'ร้านค้า'}
            </h1>


            <p>
              {store?.description ||
                store?.shopDescription ||
                'รายการสินค้าในร้าน'}
            </p>

          </div>


          {/* เปลี่ยนจาก navigate เป็น Modal */}

          <button
            type="button"
            className="outline-btn"
            onClick={
              openStoreModal
            }
          >
            ดูข้อมูลร้านค้า
          </button>

        </div>


        {error && (
          <div className="inline-error">
            {error}
          </div>
        )}


        {/* =========================================
            FILTER
            ========================================= */}

        <div className="store-filters">

          <div className="search-control">

            <Search
              size={17}
            />

            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="ค้นหาในรายการหน้านี้..."
            />

          </div>


          <select
            value={category}
            onChange={(
              event
            ) =>
              setCategory(
                event.target.value
              )
            }
          >

            <option value="">
              หมวดหมู่ทั้งหมด
            </option>


            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}

          </select>


          <small className="filter-hint">
            ช่องค้นหากรองเฉพาะรายการในหน้าปัจจุบัน
          </small>

        </div>


        {/* =========================================
            PRODUCT TABLE
            ========================================= */}

        <div className="data-card">

          {loading ? (

            <LoadingState
              label="กำลังโหลดสินค้า..."
            />

          ) : (

            <>

              <table className="finder-table store-list">

                <thead>

                  <tr>
                    <th>#</th>
                    <th>ชื่อสินค้า</th>
                    <th>หมวดหมู่</th>
                    <th>ราคา</th>
                    <th>ประกัน</th>
                    <th>สถานะ</th>
                    <th>บันทึก</th>
                  </tr>

                </thead>


                <tbody>

                  {visibleProducts.map(
                    (
                      item,
                      index
                    ) => {

                      const productId =
                        Number(
                          item.shopProductId
                        );


                      const isFavorite =
                        favoriteIds.has(
                          productId
                        );


                      return (
                        <tr
                          key={
                            item.shopProductId
                          }
                        >

                          <td>
                            {(meta.page - 1) *
                              (meta.limit || 20) +
                              index +
                              1}
                          </td>


                          <td>

                            <strong>
                              {item.customTitle ||
                                item.hardwareName ||
                                item.displayName ||
                                '-'}
                            </strong>


                            <small className="table-subtext">
                              {item.description ||
                                ''}
                            </small>

                          </td>


                          <td>
                            {item.category ||
                              '-'}
                          </td>


                          <td>
                            {item.price != null
                              ? `${Number(
                                  item.price
                                ).toLocaleString()}.-`
                              : '-'}
                          </td>


                          <td>
                            {item.warranty ||
                              '-'}
                          </td>


                          <td>

                            <StatusBadge
                              status={
                                item.productStatus ||
                                'ACTIVE'
                              }
                            />

                          </td>


                          <td>

                            <div className="product-save-actions">

                              <button
                                type="button"
                                className={
                                  `icon-only ${
                                    isFavorite
                                      ? 'favorite-active'
                                      : ''
                                  }`
                                }
                                disabled={
                                  busyId ===
                                  item.shopProductId
                                }
                                onClick={() =>
                                  toggleFavoriteProduct(
                                    item.shopProductId
                                  )
                                }
                                title={
                                  isFavorite
                                    ? 'ยกเลิกบันทึกสินค้า'
                                    : 'บันทึกสินค้า'
                                }
                              >

                                <Heart
                                  size={17}
                                  fill={
                                    isFavorite
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                />

                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>


              {!visibleProducts.length && (
                <div className="empty-inline">
                  ไม่พบสินค้าในเงื่อนไขนี้
                </div>
              )}


              <div className="table-footer">

                <span>
                  ทั้งหมด{' '}
                  {meta.totalItems ||
                    products.length}{' '}
                  รายการ
                </span>


                <PaginationBar
                  page={
                    meta.page || 1
                  }
                  pages={
                    meta.totalPages ||
                    1
                  }
                  onChange={
                    load
                  }
                />

              </div>

            </>

          )}

        </div>

      </div>


      {/* =====================================================
          STORE DETAIL MODAL
          ===================================================== */}

      <Modal
        show={storeModalOpen}
        onHide={closeStoreModal}
        centered
        size="xl"
        scrollable
        dialogClassName="public-store-detail-dialog"
      >

        <Modal.Header closeButton>

          <div className="public-store-modal-title">

            <Modal.Title>
              ข้อมูลร้านค้า
            </Modal.Title>

            <span>
              รายละเอียดและตำแหน่งของร้านค้า
            </span>

          </div>

        </Modal.Header>


        <Modal.Body>

          {store && (
            <>

              {/* STORE HEADER */}

              <section className="public-store-modal-header">

                <div className="public-store-modal-logo">

                  {store.profileImageUrl ? (

                    <img
                      src={
                        store.profileImageUrl
                      }
                      alt={
                        store.shopName ||
                        ''
                      }
                    />

                  ) : (

                    <ShoppingBag
                      size={30}
                    />

                  )}

                </div>


                <div>

                  <h2>
                    {store.shopName ||
                      '-'}
                  </h2>

                  <p>
                    {store.description ||
                      store.shopDescription ||
                      'ไม่มีคำอธิบายร้านค้า'}
                  </p>

                </div>

              </section>


              {/* DETAILS + MAP */}

              <div className="public-store-modal-grid">

                {/* LEFT */}

                <section className="public-store-modal-card">

                  <h3>
                    รายละเอียดร้านค้า
                  </h3>


                  <div className="public-store-info-row">

                    <Clock3
                      size={19}
                    />

                    <div>

                      <strong>
                        เวลาทำการ
                      </strong>

                      <span>
                        {store.operatingHours ||
                          '-'}
                      </span>

                    </div>

                  </div>


                  <div className="public-store-info-row">

                    <Phone
                      size={19}
                    />

                    <div>

                      <strong>
                        เบอร์โทรศัพท์
                      </strong>

                      <span>
                        {contact?.phone ||
                          store.ownerPhone ||
                          '-'}
                      </span>

                    </div>

                  </div>


                  <div className="public-store-contact">

                    <div>

                      <span>
                        Line
                      </span>

                      <strong>
                        {contact?.line ||
                          contact?.lineId ||
                          '-'}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Facebook
                      </span>

                      <strong>
                        {contact?.facebook ||
                          '-'}
                      </strong>

                    </div>


                    <div>

                      <span>
                        เว็บไซต์
                      </span>

                      <strong>
                        {contact?.website ||
                          '-'}
                      </strong>

                    </div>

                  </div>

                </section>


                {/* RIGHT */}

                <section className="public-store-modal-card">

                  <h3>
                    ตำแหน่งร้านค้า
                  </h3>


                  <StorePreviewMap
                    latitude={
                      modalLatitude
                    }
                    longitude={
                      modalLongitude
                    }
                    shopName={
                      store.shopName
                    }
                  />


                  {hasModalLocation && (

                    <a
                      className="outline-btn compact public-store-map-link"
                      href={
                        `https://www.openstreetmap.org/?mlat=${modalLatitude}&mlon=${modalLongitude}#map=17/${modalLatitude}/${modalLongitude}`
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


              {/* ADDRESS */}

              <section className="public-store-modal-address">

                <MapPin
                  size={20}
                />

                <div>

                  <strong>
                    ที่อยู่ร้านค้า
                  </strong>

                  <span>
                    {fullAddress ||
                      '-'}
                  </span>

                </div>

              </section>

            </>
          )}

        </Modal.Body>


        <Modal.Footer>

          <button
            type="button"
            className="outline-btn"
            onClick={
              closeStoreModal
            }
          >
            ปิด
          </button>

        </Modal.Footer>

      </Modal>

    </CustomerPageFrame>
  );
}