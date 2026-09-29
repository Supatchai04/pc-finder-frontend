import {
  Clock3,
  ExternalLink,
  Heart,
  MapPin,
  PackageSearch,
  Phone,
  Search,
  ShoppingBag,
  Store,
  Trash2,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  Modal,
} from 'react-bootstrap';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import PageHeader from '../../components/ui/PageHeader';
import PaginationBar from '../../components/ui/PaginationBar';
import LoadingState from '../../components/ui/LoadingState';
import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';

import { userService } from '../../services/userService';
import { storeService } from '../../services/storeService';
import { getApiErrorMessage } from '../../utils/api';


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


const STORE_MARKER_ICON = L.divIcon({
  className: '',
  iconSize: [36, 46],
  iconAnchor: [18, 44],

  html: `
    <div
      style="
        width: 34px;
        height: 34px;
        position: relative;
        border-radius: 50% 50% 50% 0;
        background: #ef3f37;
        border: 3px solid #ffffff;
        box-shadow: 0 3px 10px rgba(30, 45, 65, 0.35);
        transform: rotate(-45deg);
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
          background: #ffffff;
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
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);

  const lat =
    getNumberOrNull(latitude);

  const lng =
    getNumberOrNull(longitude);


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

    const map = L.map(
      mapElementRef.current,
      {
        zoomControl: true,
        scrollWheelZoom: true,
      }
    );

    map.setView(
      [lat, lng],
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

    const marker = L.marker(
      [lat, lng],
      {
        icon: STORE_MARKER_ICON,
      }
    ).addTo(map);

    if (shopName) {
      marker.bindPopup(shopName);
    }

    mapRef.current = map;

    const timer =
      window.setTimeout(
        () => {
          map.invalidateSize();
        },
        250
      );

    return () => {
      window.clearTimeout(timer);

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
        <MapPin size={32} />

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


export default function FavoritesPage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  const initialTab =
    searchParams.get('tab') ===
    'products'
      ? 'products'
      : 'stores';


  const [
    tab,
    setTabState,
  ] = useState(initialTab);

  const [
    rows,
    setRows,
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
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    category,
    setCategory,
  ] = useState('');

  const [
    search,
    setSearch,
  ] = useState('');


  /* =========================================================
     STORE MODAL
     ========================================================= */

  const [
    storeModalOpen,
    setStoreModalOpen,
  ] = useState(false);

  const [
    selectedStore,
    setSelectedStore,
  ] = useState(null);

  const [
    storeLoading,
    setStoreLoading,
  ] = useState(false);

  const [
    storeError,
    setStoreError,
  ] = useState('');


  const setTab = (
    nextTab
  ) => {
    setTabState(nextTab);
    setCategory('');
    setSearch('');

    const next =
      new URLSearchParams(
        searchParams
      );

    next.set(
      'tab',
      nextTab
    );

    setSearchParams(
      next,
      {
        replace: true,
      }
    );
  };


  const load = async (
    page = 1
  ) => {
    setLoading(true);
    setError('');

    try {
      const response =
        tab === 'stores'
          ? await userService
              .favoriteStores({
                page,
                limit: 20,
              })

          : await userService
              .favoriteProducts({
                page,
                limit: 20,

                ...(category
                  ? {
                      category,
                    }
                  : {}),
              });

      setRows(
        Array.isArray(
          response.data
        )
          ? response.data
          : []
      );

      setMeta(
        response.meta || {
          page,
          totalPages: 1,
          totalItems:
            response.data?.length ||
            0,
          limit: 20,
        }
      );

    } catch (err) {
      setRows([]);

      setError(
        getApiErrorMessage(
          err,
          'โหลดรายการที่บันทึกไม่สำเร็จ'
        )
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const nextTab =
      searchParams.get(
        'tab'
      ) === 'products'
        ? 'products'
        : 'stores';

    if (
      nextTab !== tab
    ) {
      setTabState(
        nextTab
      );
    }
  }, [
    searchParams,
  ]);


  useEffect(() => {
    load(1);
  }, [
    tab,
    category,
  ]);


  const filteredRows =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return rows;
      }

      return rows.filter(
        (item) => {
          const text =
            tab === 'stores'
              ? [
                  item.shopName,
                  item.district,
                  item.province,
                ]
                  .filter(Boolean)
                  .join(' ')

              : [
                  item.displayName,
                  item.hardwareName,
                  item.category,
                  item.shopName,
                  item.district,
                  item.province,
                ]
                  .filter(Boolean)
                  .join(' ');

          return text
            .toLowerCase()
            .includes(keyword);
        }
      );
    }, [
      rows,
      search,
      tab,
    ]);


  const remove = async (
    item
  ) => {
    const label =
      tab === 'stores'
        ? 'ร้านค้า'
        : 'สินค้า';

    if (
      !window.confirm(
        `ต้องการลบ${label}นี้ออกจากรายการที่บันทึกไว้หรือไม่?`
      )
    ) {
      return;
    }

    try {
      if (
        tab === 'stores'
      ) {
        await userService
          .removeFavoriteStore(
            item.shopId
          );

      } else {
        await userService
          .removeFavoriteProduct(
            item.shopProductId
          );
      }

      setRows(
        (previous) =>
          previous.filter(
            (row) =>
              tab === 'stores'
                ? row.shopId !==
                  item.shopId

                : row.shopProductId !==
                  item.shopProductId
          )
      );

      setMeta(
        (previous) => ({
          ...previous,

          totalItems:
            Math.max(
              0,
              Number(
                previous.totalItems ||
                0
              ) - 1
            ),
        })
      );

    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'ลบรายการไม่สำเร็จ'
        )
      );
    }
  };


  const openStoreModal =
    async (
      item
    ) => {
      const shopId =
        item?.shopId;

      if (
        shopId === null ||
        shopId === undefined
      ) {
        setError(
          'ไม่พบรหัสร้านค้า'
        );

        return;
      }

      setSelectedStore({
        ...item,

        shopId,

        profileImageUrl:
          item.profileImageUrl ||
          item.shopImageUrl ||
          '',

        latitude:
          item.latitude ??
          item.shopLatitude ??
          null,

        longitude:
          item.longitude ??
          item.shopLongitude ??
          null,
      });

      setStoreModalOpen(true);
      setStoreLoading(true);
      setStoreError('');

      try {
        const response =
          await storeService
            .profile(shopId);

        const rawProfile =
          response?.data || {};

        const profileShop =
          rawProfile?.shop ||
          rawProfile;

        const profileShopId =
          profileShop?.shopId ??
          rawProfile?.shopId;

        /*
         * ป้องกัน Mock เก่า
         * ที่อาจคืน JJ Computer ให้ทุก shopId
         */
        const sameShop =
          profileShopId == null ||
          String(profileShopId) ===
            String(shopId);

        if (sameShop) {
          setSelectedStore(
            (previous) => ({
              ...previous,
              ...profileShop,

              shopId,

              contactChannels:
                rawProfile
                  ?.contactChannels ||
                profileShop
                  ?.contactChannels ||
                profileShop
                  ?.contact ||
                previous
                  ?.contactChannels ||
                previous
                  ?.contact ||
                {},

              location:
                rawProfile?.location ||
                profileShop?.location ||
                previous?.location ||
                {},

              profileImageUrl:
                profileShop
                  ?.profileImageUrl ||
                previous
                  ?.profileImageUrl ||
                '',

              latitude:
                profileShop
                  ?.latitude ??
                rawProfile
                  ?.location
                  ?.latitude ??
                previous
                  ?.latitude ??
                null,

              longitude:
                profileShop
                  ?.longitude ??
                rawProfile
                  ?.location
                  ?.longitude ??
                previous
                  ?.longitude ??
                null,
            })
          );
        }

      } catch (err) {
        setStoreError(
          getApiErrorMessage(
            err,
            'โหลดข้อมูลร้านค้าไม่สำเร็จ'
          )
        );

      } finally {
        setStoreLoading(false);
      }
    };


  const closeStoreModal =
    () => {
      setStoreModalOpen(false);
      setStoreError('');

      window.setTimeout(
        () => {
          setSelectedStore(null);
        },
        150
      );
    };


  const modalLocation =
    selectedStore?.location ||
    {};

  const contact =
    selectedStore
      ?.contactChannels ||
    selectedStore
      ?.contact ||
    {};


  const fullAddress =
    selectedStore
      ?.fullAddress ||
    [
      selectedStore
        ?.addressText ??
        modalLocation
          ?.addressText,

      selectedStore
        ?.subDistrict ??
        modalLocation
          ?.subDistrict,

      selectedStore
        ?.district ??
        modalLocation
          ?.district,

      selectedStore
        ?.province ??
        modalLocation
          ?.province,

      selectedStore
        ?.zipCode ??
        modalLocation
          ?.zipCode,
    ]
      .filter(Boolean)
      .join(' ') ||
    '-';


  const modalLatitude =
    selectedStore?.latitude ??
    selectedStore
      ?.shopLatitude ??
    modalLocation
      ?.latitude ??
    null;


  const modalLongitude =
    selectedStore?.longitude ??
    selectedStore
      ?.shopLongitude ??
    modalLocation
      ?.longitude ??
    null;


  const hasModalLocation =
    getNumberOrNull(
      modalLatitude
    ) !== null &&
    getNumberOrNull(
      modalLongitude
    ) !== null;


  const totalLabel =
    meta.totalItems ||
    rows.length;


  return (
    <CustomerPageFrame>

      <div className="favorites-unified-page">

        <PageHeader
          title="รายการที่บันทึกไว้"
          subtitle="ร้านค้าและสินค้าที่คุณสนใจและบันทึกไว้"
        />


        <div className="favorites-unified-tabs">

          <button
            type="button"
            className={
              tab === 'stores'
                ? 'active'
                : ''
            }
            onClick={() =>
              setTab('stores')
            }
          >
            <Store size={17} />
            ร้านค้าที่ชื่นชอบ
          </button>


          <button
            type="button"
            className={
              tab === 'products'
                ? 'active'
                : ''
            }
            onClick={() =>
              setTab('products')
            }
          >
            <PackageSearch
              size={17}
            />

            สินค้าที่ชื่นชอบ
          </button>

        </div>


        <div className="favorites-unified-toolbar">

          <div className="favorites-search-box">

            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={
                (event) =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder={
                tab === 'stores'
                  ? 'ค้นหาชื่อร้าน หรือที่อยู่...'
                  : 'ค้นหาอุปกรณ์ หรือร้านค้า...'
              }
            />

          </div>


          {tab ===
            'products' && (
            <select
              className="favorites-category-filter"
              value={
                category
              }
              onChange={
                (event) =>
                  setCategory(
                    event.target.value
                  )
              }
            >
              <option value="">
                ทุกหมวดหมู่
              </option>

              {[
                'CPU',
                'MAINBOARD',
                'VGA',
                'RAM',
                'STORAGE',
                'PSU',
                'COOLER',
              ].map(
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
          )}

        </div>


        {error && (
          <div className="inline-error">
            {error}
          </div>
        )}


        <section className="favorites-table-card">

          <div className="favorites-table-tab">

            <Heart
              size={16}
              fill="currentColor"
            />

            <span>
              {tab === 'stores'
                ? 'ร้านค้าที่บันทึก'
                : 'สินค้าที่บันทึก'}
            </span>

            <strong>
              ({totalLabel})
            </strong>

          </div>


          {loading ? (
            <LoadingState
              label="กำลังโหลดรายการที่บันทึก..."
            />

          ) : (
            <>

              <div className="favorites-table-scroll">

                <table className="favorites-unified-table">

                  {tab ===
                  'stores' ? (
                    <>
                      <thead>
                        <tr>
                          <th>
                            ร้านค้า
                          </th>

                          <th>
                            ที่อยู่
                          </th>

                          <th>
                            วันที่บันทึก
                          </th>

                          <th className="favorites-action-heading">
                            จัดการ
                          </th>
                        </tr>
                      </thead>


                      <tbody>

                        {filteredRows.map(
                          (item) => (
                            <tr
                              key={
                                item.shopId
                              }
                            >

                              <td>

                                <div className="favorites-store-cell">

                                  <div className="favorites-row-icon">

                                    {item
                                      .profileImageUrl ? (
                                      <img
                                        src={
                                          item.profileImageUrl
                                        }
                                        alt={
                                          item.shopName ||
                                          'ร้านค้า'
                                        }
                                      />
                                    ) : (
                                      <Store
                                        size={19}
                                      />
                                    )}

                                  </div>


                                  <div>

                                    <strong>
                                      {item.shopName ||
                                        '-'}
                                    </strong>

                                    <small>
                                      ร้านค้าที่บันทึกไว้
                                    </small>

                                  </div>

                                </div>

                              </td>


                              <td>

                                <div className="favorites-location-cell">

                                  <MapPin
                                    size={15}
                                  />

                                  <span>
                                    {[
                                      item.district,
                                      item.province,
                                    ]
                                      .filter(
                                        Boolean
                                      )
                                      .join(
                                        ', '
                                      ) ||
                                      '-'}
                                  </span>

                                </div>

                              </td>


                              <td>
                                {item.addDate ||
                                  '-'}
                              </td>


                              <td>

                                <div className="favorites-table-actions">

                                  <button
                                    type="button"
                                    className="favorites-view-btn"
                                    onClick={() =>
                                      openStoreModal(
                                        item
                                      )
                                    }
                                  >
                                    ดูร้านค้า
                                  </button>


                                  <button
                                    type="button"
                                    className="favorites-delete-btn"
                                    title="ลบ"
                                    onClick={() =>
                                      remove(
                                        item
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={16}
                                    />
                                  </button>

                                </div>

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>
                    </>

                  ) : (
                    <>
                      <thead>
                        <tr>

                          <th>
                            อุปกรณ์
                          </th>

                          <th>
                            ร้านค้า
                          </th>

                          <th>
                            ราคา (บาท)
                          </th>

                          <th>
                            วันที่บันทึก
                          </th>

                          <th className="favorites-action-heading">
                            จัดการ
                          </th>

                        </tr>
                      </thead>


                      <tbody>

                        {filteredRows.map(
                          (item) => (
                            <tr
                              key={
                                item.shopProductId
                              }
                            >

                              <td>

                                <div className="favorites-product-cell">

                                  <div>

                                    <strong>
                                      {item.displayName ||
                                        item.hardwareName ||
                                        '-'}
                                    </strong>

                                    <small>
                                      {item.category ||
                                        '-'}
                                    </small>

                                  </div>

                                </div>

                              </td>


                              <td>

                                <div className="favorites-store-cell">

                                  <div className="favorites-row-icon">

                                    {item
                                      .profileImageUrl ? (
                                      <img
                                        src={
                                          item.profileImageUrl
                                        }
                                        alt={
                                          item.shopName ||
                                          'ร้านค้า'
                                        }
                                      />
                                    ) : (
                                      <Store
                                        size={18}
                                      />
                                    )}

                                  </div>


                                  <div>

                                    <strong>
                                      {item.shopName ||
                                        `ร้าน #${item.shopId}`}
                                    </strong>

                                    <small>
                                      {[
                                        item.district,
                                        item.province,
                                      ]
                                        .filter(
                                          Boolean
                                        )
                                        .join(
                                          ', '
                                        ) ||
                                        '-'}
                                    </small>

                                  </div>

                                </div>

                              </td>


                              <td>

                                <strong className="favorites-price">
                                  {Number(
                                    item.price ||
                                    0
                                  ).toLocaleString()}
                                  .-
                                </strong>

                              </td>


                              <td>
                                {item.addDate ||
                                  '-'}
                              </td>


                              <td>

                                <div className="favorites-table-actions">

                                  <button
                                    type="button"
                                    className="favorites-view-btn"
                                    onClick={() =>
                                      openStoreModal(
                                        item
                                      )
                                    }
                                  >
                                    ดูร้านค้า
                                  </button>


                                  <button
                                    type="button"
                                    className="favorites-delete-btn"
                                    title="ลบ"
                                    onClick={() =>
                                      remove(
                                        item
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={16}
                                    />
                                  </button>

                                </div>

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>
                    </>
                  )}

                </table>

              </div>


              {!filteredRows.length && (
                <div className="favorites-empty-state">

                  <Heart size={24} />

                  <span>
                    {search
                      ? 'ไม่พบรายการที่ตรงกับการค้นหา'
                      : `ยังไม่มี${
                          tab ===
                          'stores'
                            ? 'ร้านค้า'
                            : 'สินค้า'
                        }ที่บันทึกไว้`}
                  </span>

                </div>
              )}


              <div className="favorites-table-footer">

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


                <span>
                  ทั้งหมด{' '}
                  {meta.totalItems ||
                    rows.length}{' '}
                  รายการ
                </span>

              </div>

            </>
          )}

        </section>

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

          {storeLoading &&
          !selectedStore ? (
            <LoadingState
              label="กำลังโหลดข้อมูลร้านค้า..."
            />

          ) : (
            <>

              {storeError && (
                <div className="inline-error">
                  {storeError}
                </div>
              )}


              {selectedStore && (
                <>

                  <section className="public-store-modal-header">

                    <div className="public-store-modal-logo">

                      {selectedStore
                        .profileImageUrl ? (
                        <img
                          src={
                            selectedStore
                              .profileImageUrl
                          }
                          alt={
                            selectedStore
                              .shopName ||
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
                        {selectedStore
                          .shopName ||
                          '-'}
                      </h2>

                      <p>
                        {selectedStore
                          .description ||
                          selectedStore
                            .shopDescription ||
                          'ไม่มีคำอธิบายร้านค้า'}
                      </p>

                    </div>

                  </section>


                  <div className="public-store-modal-grid">

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
                            {selectedStore
                              .operatingHours ||
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
                            {contact
                              ?.phone ||
                              selectedStore
                                .ownerPhone ||
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
                            {contact
                              ?.line ||
                              contact
                                ?.lineId ||
                              '-'}
                          </strong>
                        </div>


                        <div>
                          <span>
                            Facebook
                          </span>

                          <strong>
                            {contact
                              ?.facebook ||
                              '-'}
                          </strong>
                        </div>


                        <div>
                          <span>
                            เว็บไซต์
                          </span>

                          <strong>
                            {contact
                              ?.website ||
                              '-'}
                          </strong>
                        </div>

                      </div>

                    </section>


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
                          selectedStore
                            .shopName
                        }
                      />


                      {hasModalLocation && (
                        <a
                          className="outline-btn compact public-store-map-link"
                          href={`https://www.openstreetmap.org/?mlat=${modalLatitude}&mlon=${modalLongitude}#map=17/${modalLatitude}/${modalLongitude}`}
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


                  <section className="public-store-modal-address">

                    <MapPin size={20} />

                    <div>
                      <strong>
                        ที่อยู่ร้านค้า
                      </strong>

                      <span>
                        {fullAddress}
                      </span>
                    </div>

                  </section>

                </>
              )}

            </>
          )}

        </Modal.Body>


        <Modal.Footer>

          {selectedStore && (
            <button
              type="button"
              className="primary-btn"
              onClick={
                () => {
                  const shopId =
                    selectedStore
                      .shopId;

                  closeStoreModal();

                  navigate(
                    `/stores/${shopId}/products`
                  );
                }
              }
            >
              <ShoppingBag
                size={16}
              />

              ดูสินค้าทั้งหมดของร้าน
            </button>
          )}


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
