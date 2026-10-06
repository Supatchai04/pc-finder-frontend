import {

  ArrowLeft,

  Clock3,

  ExternalLink,

  Heart,

  MapPin,

  Phone,

  Printer,

  Search,

  ShoppingBag,

  Store,

} from 'lucide-react';



import {

  useEffect,

  useMemo,

  useState,

} from 'react';



import {

  useLocation,

  useNavigate,

} from 'react-router-dom';



import { Modal } from 'react-bootstrap';




import HardwareSidebar from '../../components/hardware/HardwareSidebar';

import LoadingState from '../../components/ui/LoadingState';



import { useAuth } from '../../auth/AuthContext';

import { hardwareService } from '../../services/hardwareService';

import { storeService } from '../../services/storeService';

import { userService } from '../../services/userService';



import { getApiErrorMessage } from '../../utils/api';

import { buildStorage } from '../../utils/buildStorage';





const getName = (item) =>

  item?.displayName ||

  item?.displayname ||

  item?.hardwareName ||

  item?.productName ||

  item?.name ||

  '-';





const getId = (item) =>

  item?.masterId ??

  item?.hardwareId ??

  item?.id;





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


function getLocation(

  timeout = 5000

) {

  if (!navigator.geolocation) {

    return Promise.resolve(null);

  }



  return new Promise(

    (resolve) => {

      navigator.geolocation.getCurrentPosition(

        ({ coords }) =>

          resolve({

            latitude: coords.latitude,

            longitude: coords.longitude,

          }),



        () => resolve(null),



        {

          enableHighAccuracy: false,

          timeout,

          maximumAge: 300000,

        }

      );

    }

  );

}





export default function MatchStoresPage() {

  const location = useLocation();

  const navigate = useNavigate();

  const { user } = useAuth();



  const [selected] = useState(

    () =>

      location.state?.selected ||

      buildStorage.getSelected()

  );



  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [actionError, setActionError] = useState('');

  const [sort, setSort] = useState('price');



  /*

   * checkbox สำหรับใบสรุปรายการ

   * เก็บ shopProductId ที่ User ติ๊กไว้เท่านั้น

   */

  const [

    summarySelectedIds,

    setSummarySelectedIds,

  ] = useState([]);



  /*

   * Favorite Product

   */

  const [

    favoriteIds,

    setFavoriteIds,

  ] = useState(() => new Set());



  const [

    favoriteBusyIds,

    setFavoriteBusyIds,

  ] = useState(() => new Set());



  /*

   * Store Modal

   */

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





  const hardwareList = useMemo(

    () =>

      Object.entries(selected)

        .map(

          ([

            category,

            items,

          ]) => {

            const list = (

              Array.isArray(items)

                ? items

                : [items]

            ).filter(

              (item) =>

                item &&

                getId(item) != null

            );



            const ids = list.map(getId);



            if (!ids.length) {

              return null;

            }



            return {

              category,



              masterId:

                ids.length === 1

                  ? ids[0]

                  : ids,

            };

          }

        )

        .filter(Boolean),



    [selected]

  );





  const selectedItems = useMemo(

    () =>

      Object.entries(selected)

        .flatMap(

          ([

            category,

            items,

          ]) =>

            (

              Array.isArray(items)

                ? items

                : [items]

            )

              .filter(

                (item) =>

                  item &&

                  getId(item) != null

              )

              .map(

                (item) => ({

                  category,

                  item,

                })

              )

        ),



    [selected]

  );





  const selectedItemCount =

    selectedItems.length;





  /*

   * โหลด Favorite ที่ User เคยกดไว้

   * เพื่อให้หัวใจแสดงสถานะถูกต้องตอนเปิดหน้า

   */

  useEffect(() => {

    const role =

      String(

        user?.role || ''

      ).toUpperCase();



    if (

      role !== 'USER' &&

      role !== 'CUSTOMER'

    ) {

      return undefined;

    }



    let active = true;



    const loadFavorites =

      async () => {

        try {

          const response =

            await userService

              .favoriteProducts({

                page: 1,

                limit: 100,

              });



          if (!active) {

            return;

          }



          const ids = new Set(

            (

              Array.isArray(

                response?.data

              )

                ? response.data

                : []

            )

              .map(

                (item) =>

                  item?.shopProductId

              )

              .filter(

                (id) =>

                  id !== null &&

                  id !== undefined

              )

              .map(String)

          );



          setFavoriteIds(ids);



        } catch {

          /*

           * Favorite เป็นข้อมูลเสริม

           * ถ้าโหลดไม่ได้ยังให้หน้า Matching ทำงานต่อ

           */

        }

      };



    loadFavorites();



    return () => {

      active = false;

    };

  }, [

    user?.role,

  ]);





  /*

   * Matching Stores

   */

  useEffect(() => {

    let active = true;



    const run =

      async () => {

        if (!hardwareList.length) {

          setError(

            'ยังไม่ได้เลือกฮาร์ดแวร์ กรุณากลับไปเลือกสินค้าก่อน'

          );



          setLoading(false);



          return;

        }



        setLoading(true);

        setError('');

        setActionError('');



        try {

          const userLocation =

            await getLocation();



          const payload = {

            hardwareList,



            ...(userLocation

              ? {

                  userLocation,

                }

              : {}),

          };



          const response =

            await hardwareService

              .matchStores(payload);



          if (active) {

            setStores(

              Array.isArray(

                response?.data

              )

                ? response.data

                : []

            );



            /*

             * ทุกครั้งที่ค้นหาร้านใหม่

             * ให้ User เลือก checkbox ใหม่เอง

             */

            setSummarySelectedIds([]);

          }



        } catch (err) {

          if (active) {

            setError(

              getApiErrorMessage(

                err,

                'ค้นหาร้านค้าที่ตรงกับสเปคไม่สำเร็จ'

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

    hardwareList,

  ]);





  const sortedStores = useMemo(

    () =>

      [...stores].sort(

        (a, b) =>

          sort === 'distance'

            ? Number(

                a.distanceKm ??

                Number.MAX_SAFE_INTEGER

              ) -

              Number(

                b.distanceKm ??

                Number.MAX_SAFE_INTEGER

              )



            : Number(

                a.totalPrice ??

                Number.MAX_SAFE_INTEGER

              ) -

              Number(

                b.totalPrice ??

                Number.MAX_SAFE_INTEGER

              )

      ),



    [

      stores,

      sort,

    ]

  );





  const isSummaryChecked = (

    shopProductId

  ) =>

    summarySelectedIds.some(

      (id) =>

        String(id) ===

        String(shopProductId)

    );





  const toggleSummaryProduct = (

    shopProductId

  ) => {

    if (

      shopProductId === null ||

      shopProductId === undefined

    ) {

      return;

    }



    setSummarySelectedIds(

      (previous) => {

        const exists =

          previous.some(

            (id) =>

              String(id) ===

              String(shopProductId)

          );



        if (exists) {

          return previous.filter(

            (id) =>

              String(id) !==

              String(shopProductId)

          );

        }



        return [

          ...previous,

          shopProductId,

        ];

      }

    );

  };





  const openSummary = () => {

    const ids = [

      ...new Map(

        summarySelectedIds.map(

          (id) => [

            String(id),

            id,

          ]

        )

      ).values(),

    ];



    if (!ids.length) {

      setActionError(

        'กรุณาติ๊กเลือกสินค้าอย่างน้อย 1 รายการก่อนสร้างใบสรุป'

      );



      return;

    }



    buildStorage.setSummaryProductIds(ids);



    navigate(

      '/summary',

      {

        state: {

          shopProductIds: ids,

        },

      }

    );

  };





  const toggleFavoriteProduct =

    async (

      shopProductId

    ) => {

      if (

        shopProductId === null ||

        shopProductId === undefined

      ) {

        return;

      }



      const role =

        String(

          user?.role || ''

        ).toUpperCase();



      if (!user) {

        navigate(

          '/login',

          {

            state: {

              from:

                location.pathname,

            },

          }

        );



        return;

      }



      if (

        role !== 'USER' &&

        role !== 'CUSTOMER'

      ) {

        setActionError(

          'การบันทึกสินค้าสำหรับบัญชีลูกค้าเท่านั้น'

        );



        return;

      }



      const key =

        String(shopProductId);



      if (

        favoriteBusyIds.has(key)

      ) {

        return;

      }



      const currentlyFavorite =

        favoriteIds.has(key);



      setActionError('');



      setFavoriteBusyIds(

        (previous) => {

          const next =

            new Set(previous);



          next.add(key);



          return next;

        }

      );



      try {

        if (currentlyFavorite) {

          await userService

            .removeFavoriteProduct(

              shopProductId

            );



        } else {

          await userService

            .addFavoriteProduct(

              shopProductId

            );

        }



        setFavoriteIds(

          (previous) => {

            const next =

              new Set(previous);



            if (currentlyFavorite) {

              next.delete(key);

            } else {

              next.add(key);

            }



            return next;

          }

        );



      } catch (err) {

        setActionError(

          getApiErrorMessage(

            err,

            currentlyFavorite

              ? 'ยกเลิกบันทึกสินค้าไม่สำเร็จ'

              : 'บันทึกสินค้าไม่สำเร็จ'

          )

        );



      } finally {

        setFavoriteBusyIds(

          (previous) => {

            const next =

              new Set(previous);



            next.delete(key);



            return next;

          }

        );

      }

    };





  const openStoreModal =

    async (

      shop

    ) => {

      setSelectedStore({

        ...shop,



        profileImageUrl:

          shop.profileImageUrl ||

          shop.shopImageUrl ||

          '',



        latitude:

          shop.latitude ??

          shop.shopLatitude ??

          null,



        longitude:

          shop.longitude ??

          shop.shopLongitude ??

          null,

      });



      setStoreModalOpen(true);

      setStoreLoading(true);

      setStoreError('');



      try {

        const response =

          await storeService

            .profile(

              shop.shopId

            );



        const rawProfile =

          response?.data || {};



        const profileShop =

          rawProfile?.shop ||

          rawProfile;



        /*

         * Mock เก่าของโปรเจกต์อาจคืน Profile ของ JJ Computer

         * ให้ทุก shopId

         * จึง merge เฉพาะเมื่อเป็นร้านเดียวกัน

         * ส่วน Backend จริงจะใช้ข้อมูลจากร้านนั้นตามปกติ

         */

        const profileShopId =

          profileShop?.shopId ??

          rawProfile?.shopId;



        const sameShop =

          profileShopId == null ||

          String(profileShopId) ===

            String(shop.shopId);



        if (sameShop) {

          setSelectedStore(

            (previous) => ({

              ...previous,

              ...profileShop,



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





  return (

    <div className="hardware-finder-workspace compare-page-workspace">



      {/* Sidebar เลือก Hardware ยังคงอยู่หน้า Matching */}

      <HardwareSidebar

        active=""

        selected={selected}

        onSelect={

          (category) =>

            navigate(

              `/hardware?category=${category}`

            )

        }

      />





      <main className="match-results-main">



        <button

          type="button"

          className="back-inline-btn"

          onClick={

            () =>

              navigate('/hardware')

          }

        >

          <ArrowLeft size={16} />

          กลับไปแก้รายการ

        </button>





        <div className="compare-topbar">



          <div className="compare-topbar-copy">



            <h2>

              พบร้านค้าที่ตรงกับสินค้าที่เลือก{' '}

              {selectedItemCount}{' '}

              รายการ

            </h2>



            <p>

              ระบบเปรียบเทียบสินค้าจากร้านค้าที่มีสินค้าในรายการที่คุณเลือก

            </p>





            <div className="compare-selected-summary">



              {selectedItems.map(

                ({

                  category,

                  item,

                }) => (

                  <span

                    key={`${category}-${getId(item)}`}

                  >

                    <b>

                      {category}

                    </b>



                    {getName(item)}

                  </span>

                )

              )}



            </div>



          </div>





          <div className="compare-heading-actions">



            <label className="compare-sort-control">



              <span>

                เรียงลำดับจาก :

              </span>



              <select

                value={sort}

                onChange={

                  (event) =>

                    setSort(

                      event.target.value

                    )

                }

              >

                <option value="price">

                  ราคาต่ำ - สูง

                </option>



                <option value="distance">

                  ใกล้ที่สุด

                </option>

              </select>



            </label>





            <button

              type="button"

              className="compare-summary-btn"

              disabled={

                summarySelectedIds.length ===

                0

              }

              onClick={openSummary}

            >

              <Printer size={17} />



              สรุปรายการฮาร์ดแวร์



              <span>

                ({summarySelectedIds.length})

              </span>

            </button>



          </div>



        </div>





        {actionError && (

          <div className="inline-error compare-action-error">

            {actionError}

          </div>

        )}





        {loading ? (

          <LoadingState label="กำลังจับคู่ร้านค้า..." />



        ) : error ? (

          <div className="empty-inline">

            {error}

          </div>



        ) : (

          <div className="compare-store-grid">



            {sortedStores.map(

              (shop) => {

                const details =

                  Array.isArray(

                    shop.details

                  )

                    ? shop.details

                    : [];



                const matchCount =

                  shop

                    .hardwareMatchCount ??

                  shop

                    .matchCount ??

                  details.filter(

                    (item) =>

                      item

                        .isMatched !==

                        false &&

                      item

                        .productStatus !==

                        false

                  ).length;





                return (

                  <article

                    className="compare-store-card"

                    key={shop.shopId}

                  >



                    <div className="compare-store-head">



                      <div className="compare-store-icon">



                        {shop

                          .shopImageUrl ? (

                          <img

                            src={

                              shop.shopImageUrl

                            }

                            alt={

                              shop.shopName ||

                              ''

                            }

                          />

                        ) : (

                          <ShoppingBag

                            size={22}

                          />

                        )}



                      </div>





                      <div className="compare-store-copy">



                        <h3>

                          {shop.shopName}

                        </h3>



                        <p>

                          <MapPin size={14} />



                          {shop.province ||

                            '-'}



                          {shop.district

                            ? ` • ${shop.district}`

                            : ''}



                          {shop.distanceKm !=

                          null

                            ? ` • ${shop.distanceKm} กม.`

                            : ''}

                        </p>



                        <small>

                          ตรงกับรายการ{' '}

                          {matchCount}/

                          {selectedItemCount}{' '}

                          ชิ้น

                        </small>



                      </div>



                    </div>





                    <div className="compare-product-list">



                      {selectedItems.map(

                        (

                          {

                            category,

                            item:

                              selectedItem,

                          },

                          index

                        ) => {

                          const selectedMasterId =

                            getId(

                              selectedItem

                            );



                          const matchedDetail =

                            details.find(

                              (detail) => {

                                const detailCategory =

                                  String(

                                    detail

                                      ?.category ||

                                    ''

                                  )

                                    .toUpperCase();



                                const selectedCategory =

                                  String(

                                    category ||

                                    ''

                                  )

                                    .toUpperCase();



                                const detailMasterId =

                                  detail

                                    ?.masterId ??

                                  detail

                                    ?.hardwareId;



                                return (

                                  detailCategory ===

                                    selectedCategory &&

                                  String(

                                    detailMasterId

                                  ) ===

                                    String(

                                      selectedMasterId

                                    )

                                );

                              }

                            );



                          const shopProductId =

                            matchedDetail

                              ?.shopProductId;



                          const unavailable =

                            !matchedDetail ||

                            matchedDetail

                              .isMatched ===

                              false ||

                            matchedDetail

                              .productStatus ===

                              false ||

                            shopProductId ==

                              null;

                          /*
                           * ไม่แสดงสินค้าที่ร้านไม่มี
                           * แสดงเฉพาะรายการที่ร้านมีจริงเท่านั้น
                           */
                          if (unavailable) {
                            return null;
                          }




                          const favoriteKey =

                            shopProductId !=

                            null

                              ? String(

                                  shopProductId

                                )

                              : '';



                          const isFavorite =

                            favoriteKey

                              ? favoriteIds

                                  .has(

                                    favoriteKey

                                  )

                              : false;



                          const favoriteBusy =

                            favoriteKey

                              ? favoriteBusyIds

                                  .has(

                                    favoriteKey

                                  )

                              : false;



                          const checked =

                            !unavailable &&

                            isSummaryChecked(

                              shopProductId

                            );





                          return (

                            <div

                              className={

                                `compare-product-row ${

                                  unavailable

                                    ? 'unavailable'

                                    : ''

                                }`

                              }

                              key={`${shop.shopId}-${category}-${selectedMasterId}-${index}`}

                            >



                              {/* หัวใจอยู่ซ้ายตาม Draft */}

                              <button

                                type="button"

                                className={

                                  `compare-product-heart ${

                                    isFavorite

                                      ? 'active'

                                      : ''

                                  }`

                                }

                                disabled={

                                  unavailable ||

                                  favoriteBusy

                                }

                                onClick={

                                  () =>

                                    toggleFavoriteProduct(

                                      shopProductId

                                    )

                                }

                                title={

                                  unavailable

                                    ? 'ร้านนี้ไม่มีสินค้ารายการนี้'

                                    : isFavorite

                                      ? 'ยกเลิกบันทึกสินค้า'

                                      : 'บันทึกสินค้า'

                                }

                                aria-label={

                                  isFavorite

                                    ? 'ยกเลิกบันทึกสินค้า'

                                    : 'บันทึกสินค้า'

                                }

                              >

                                <Heart

                                  size={20}

                                  fill={

                                    isFavorite

                                      ? 'currentColor'

                                      : 'none'

                                  }

                                />

                              </button>





                              <div className="compare-product-info">



                                <div className="compare-product-name">



                                  <b>

                                    {category}

                                  </b>



                                  <span>

                                    {' • '}

                                    {getName(

                                      selectedItem

                                    )}

                                  </span>



                                </div>





                                {unavailable && (

                                  <small className="compare-product-unavailable">

                                    ไม่มีสินค้า

                                  </small>

                                )}



                              </div>





                              <strong className="compare-product-price">



                                {!unavailable &&

                                matchedDetail

                                  ?.price !=

                                  null

                                  ? `${Number(

                                      matchedDetail

                                        .price

                                    ).toLocaleString()}.-`

                                  : '-'}



                              </strong>





                              {/* checkbox ขวาสุด ใช้เลือกเข้าใบสรุป */}

                              <label

                                className={

                                  `compare-summary-checkbox ${

                                    unavailable

                                      ? 'disabled'

                                      : ''

                                  }`

                                }

                                title={

                                  unavailable

                                    ? 'สินค้านี้ไม่สามารถนำไปสรุปรายการได้'

                                    : 'เลือกสินค้าเข้าหน้าสรุปรายการ'

                                }

                              >



                                <input

                                  type="checkbox"

                                  checked={checked}

                                  disabled={

                                    unavailable

                                  }

                                  onChange={

                                    () =>

                                      toggleSummaryProduct(

                                        shopProductId

                                      )

                                  }

                                  aria-label={`เลือก ${getName(selectedItem)} เข้าหน้าสรุปรายการ`}

                                />



                              </label>



                            </div>

                          );

                        }

                      )}



                    </div>





                    <div className="compare-store-total">



                      <span>

                        ราคารวม:

                      </span>



                      <strong>

                        {Number(

                          shop.totalPrice ||

                          0

                        ).toLocaleString()}

                      </strong>



                      <small>

                        บาท

                      </small>



                    </div>





                    <div className="compare-store-actions">



                      <button

                        type="button"

                        onClick={

                          () =>

                            openStoreModal(

                              shop

                            )

                        }

                      >

                        <Store size={16} />

                        ดูข้อมูลร้านค้า

                      </button>





                      <button

                        type="button"

                        onClick={

                          () =>

                            navigate(

                              `/stores/${shop.shopId}/products`

                            )

                        }

                      >

                        <ShoppingBag size={16} />

                        ดูสินค้า

                      </button>



                    </div>



                  </article>

                );

              }

            )}



          </div>

        )}





        {!loading &&

          !error &&

          !sortedStores.length && (

            <div className="empty-inline">

              ยังไม่พบร้านค้าที่ตรงกับรายการที่เลือก

            </div>

          )}





        <div className="compare-note">



          <Search size={17} />



          <div>

            <strong>

              หมายเหตุ

            </strong>



            <p>

              ราคาและสถานะสินค้าอาจเปลี่ยนแปลงได้ กรุณาตรวจสอบกับร้านค้าก่อนตัดสินใจซื้อ

            </p>

          </div>



        </div>



      </main>





      {/* STORE DETAIL MODAL */}

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

            <LoadingState label="กำลังโหลดข้อมูลร้านค้า..." />



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



                        <Clock3 size={19} />



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



                        <Phone size={19} />



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

                          <ExternalLink size={15} />

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

              <ShoppingBag size={16} />

              ดูสินค้าทั้งหมดของร้าน

            </button>

          )}





          <button

            type="button"

            className="outline-btn"

            onClick={closeStoreModal}

          >

            ปิด

          </button>



        </Modal.Footer>



      </Modal>



    </div>

  );

}
