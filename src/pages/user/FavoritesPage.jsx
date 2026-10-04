import {

  ClipboardList,

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




import PageHeader from '../../components/ui/PageHeader';

import PaginationBar from '../../components/ui/PaginationBar';

import LoadingState from '../../components/ui/LoadingState';

import CustomerPageFrame from '../../components/navigation/CustomerPageFrame';



import { userService } from '../../services/userService';

import { storeService } from '../../services/storeService';

import { getApiErrorMessage } from '../../utils/api';

import { buildStorage } from '../../utils/buildStorage';





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





function StorePreviewMap({
  latitude,
  longitude,
  shopName,
}) {
  const lat = getNumberOrNull(latitude);
  const lng = getNumberOrNull(longitude);

  if (lat === null || lng === null) {
    return (
      <div className="store-modal-map-empty">
        <MapPin size={32} />
        <strong>ยังไม่มีข้อมูลพิกัดร้านค้า</strong>
      </div>
    );
  }

  const googleMapEmbedUrl =
    `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  return (
    <iframe
      title={`ตำแหน่งร้านค้า ${shopName || ''}`}
      src={googleMapEmbedUrl}
      className="store-modal-map"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
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

     PRODUCT SUMMARY SELECTION

     ========================================================= */



  const [

    selectedProductIds,

    setSelectedProductIds,

  ] = useState(() => new Set());



  const selectAllRef =

    useRef(null);





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



    if (nextTab !== 'products') {

      setSelectedProductIds(

        new Set()

      );

    }



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





  const visibleProductIds =

    useMemo(

      () =>

        tab === 'products'

          ? filteredRows

            .map((item) =>

              Number(

                item.shopProductId

              )

            )

            .filter(

              Number.isFinite

            )

          : [],

      [

        filteredRows,

        tab,

      ]

    );





  const selectedCount =

    selectedProductIds.size;





  const allVisibleSelected =

    visibleProductIds.length > 0 &&

    visibleProductIds.every(

      (id) =>

        selectedProductIds.has(id)

    );





  const someVisibleSelected =

    visibleProductIds.some(

      (id) =>

        selectedProductIds.has(id)

    );





  useEffect(() => {

    if (!selectAllRef.current) {

      return;

    }



    selectAllRef.current.indeterminate =

      someVisibleSelected &&

      !allVisibleSelected;

  }, [

    someVisibleSelected,

    allVisibleSelected,

  ]);





  const toggleProductSelection =

    (shopProductId) => {

      const id =

        Number(shopProductId);



      if (!Number.isFinite(id)) {

        return;

      }



      setSelectedProductIds(

        (previous) => {

          const next =

            new Set(previous);



          if (next.has(id)) {

            next.delete(id);

          } else {

            next.add(id);

          }



          return next;

        }

      );

    };





  const toggleSelectAllVisible =

    () => {

      if (!visibleProductIds.length) {

        return;

      }



      setSelectedProductIds(

        (previous) => {

          const next =

            new Set(previous);



          if (allVisibleSelected) {

            visibleProductIds.forEach(

              (id) => next.delete(id)

            );

          } else {

            visibleProductIds.forEach(

              (id) => next.add(id)

            );

          }



          return next;

        }

      );

    };





  const openSelectedSummary =

    () => {

      const ids =

        Array.from(

          selectedProductIds

        ).filter(

          Number.isFinite

        );



      if (!ids.length) {

        return;

      }



      buildStorage

        .setSummaryProductIds(ids);



      navigate(

        '/summary',

        {

          state: {

            shopProductIds: ids,

          },

        }

      );

    };





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



      if (

        tab === 'products'

      ) {

        const removedId =

          Number(

            item.shopProductId

          );



        setSelectedProductIds(

          (previous) => {

            const next =

              new Set(previous);



            next.delete(

              removedId

            );



            return next;

          }

        );

      }



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





          {tab ===

            'products' && (

              <div className="favorites-product-selection-tools">



                <label className="favorites-select-all-control">



                  <input

                    ref={selectAllRef}

                    type="checkbox"

                    checked={allVisibleSelected}

                    onChange={

                      toggleSelectAllVisible

                    }

                    disabled={

                      !visibleProductIds.length

                    }

                  />



                  <span>

                    เลือกทั้งหมด

                  </span>



                </label>





                <button

                  type="button"

                  className="favorites-summary-btn"

                  disabled={

                    selectedCount === 0

                  }

                  onClick={

                    openSelectedSummary

                  }

                >

                  <ClipboardList

                    size={17}

                  />



                  สรุปรายการสินค้า



                  <strong>

                    ({selectedCount})

                  </strong>

                </button>



              </div>

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



                          <th className="favorites-select-heading">

                            เลือก

                          </th>



                        </tr>

                      </thead>





                      <tbody>



                        {filteredRows.map(

                          (item) => {

                            const productId =

                              Number(

                                item.shopProductId

                              );



                            const isSelected =

                              selectedProductIds.has(

                                productId

                              );



                            return (

                              <tr

                                key={

                                  item.shopProductId

                                }

                                className={

                                  `favorites-product-selectable-row ${isSelected

                                    ? 'selected'

                                    : ''

                                  }`

                                }

                                onClick={() =>

                                  toggleProductSelection(

                                    item.shopProductId

                                  )

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

                                      onClick={(event) => {

                                        event.stopPropagation();



                                        openStoreModal(

                                          item

                                        );

                                      }}

                                    >

                                      ดูร้านค้า

                                    </button>





                                    <button

                                      type="button"

                                      className="favorites-delete-btn"

                                      title="ลบ"

                                      onClick={(event) => {

                                        event.stopPropagation();



                                        remove(

                                          item

                                        );

                                      }}

                                    >

                                      <Trash2

                                        size={16}

                                      />

                                    </button>



                                  </div>



                                </td>





                                <td

                                  className="favorites-select-cell"

                                  onClick={(event) =>

                                    event.stopPropagation()

                                  }

                                >



                                  <input

                                    className="favorites-row-checkbox"

                                    type="checkbox"

                                    checked={

                                      isSelected

                                    }

                                    onChange={() =>

                                      toggleProductSelection(

                                        item.shopProductId

                                      )

                                    }

                                    aria-label={

                                      `เลือก ${item.displayName ||

                                      item.hardwareName ||

                                      'สินค้า'

                                      } เพื่อสรุปรายการ`

                                    }

                                  />



                                </td>



                              </tr>

                            );

                          }

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

                      : `ยังไม่มี${tab ===

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

                          href={`https://www.google.com/maps/search/?api=1&query=${modalLatitude},${modalLongitude}`}

                          target="_blank"

                          rel="noreferrer"

                        >

                          <ExternalLink

                            size={15}

                          />



                          เปิด Google Maps

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
