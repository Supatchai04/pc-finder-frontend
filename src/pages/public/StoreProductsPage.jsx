import {
  Heart,
  Search,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

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


  /*
   * ============================================
   * LOAD STORE + PRODUCTS
   * ============================================
   */
  const load = async (
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


      setStore(
        profileRes.data ||
        store
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
       * ถ้า Login เป็น USER
       * โหลดรายการ Favorite Product
       * เพื่อให้หัวใจแสดงสถานะถูกต้อง
       */
      if (
        user?.role ===
        'USER'
      ) {
        try {
          const favoriteRes =
            await userService.favoriteProducts(
              {
                page: 1,
                limit: 100,
              }
            );


          const favoriteList =
            Array.isArray(
              favoriteRes.data
            )
              ? favoriteRes.data
              : [];


          setFavoriteIds(
            new Set(
              favoriteList.map(
                (item) =>
                  Number(
                    item.shopProductId
                  )
              )
            )
          );
        } catch {
          /*
           * Favorite เป็นข้อมูลเสริม
           * ถ้าโหลดไม่ได้
           * ไม่ให้กระทบหน้ารายการสินค้า
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


  /*
   * โหลดใหม่เมื่อเปลี่ยนร้าน
   * หรือเปลี่ยน Category
   */
  useEffect(() => {
    load(1);
  }, [
    shopId,
    category,
    user?.role,
  ]);


  /*
   * ============================================
   * SEARCH เฉพาะรายการในหน้าปัจจุบัน
   * ============================================
   */
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
            .some((value) =>
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


  /*
   * ============================================
   * FAVORITE PRODUCT
   * ============================================
   */
  const toggleFavoriteProduct =
    async (id) => {

      /*
       * ยังไม่ Login
       */
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


      /*
       * SHOP / ADMIN
       * ไม่ให้ใช้ Favorite Product
       */
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


        /*
         * มีอยู่แล้ว
         * → ยกเลิก Favorite
         */
        if (
          favoriteIds.has(
            productId
          )
        ) {
          await userService
            .removeFavoriteProduct(
              id
            );
        }

        /*
         * ยังไม่มี
         * → เพิ่ม Favorite
         */
        else {
          await userService
            .addFavoriteProduct(
              id
            );
        }


        /*
         * Update UI ทันที
         */
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
        /*
         * Backend ตอบ 409
         * แปลว่าสินค้าถูก Favorite อยู่แล้ว
         */
        if (
          !favoriteIds.has(
            Number(id)
          ) &&
          err?.response
            ?.status === 409
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


  /*
   * ตัวอักษรสำหรับ Logo
   * กรณีร้านไม่มีรูป
   */
  const initials =
    (
      store?.shopName ||
      'PC'
    )
      .slice(0, 2)
      .toUpperCase();


  return (
    <CustomerPageFrame>

      <div className="content-page public-content-page">

        {/* ============================================
            STORE HEADER
            ============================================ */}

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


          <button
            type="button"
            className="outline-btn"
            onClick={() =>
              navigate(
                `/stores/${shopId}`
              )
            }
          >
            ดูข้อมูลร้านค้า
          </button>

        </div>


        {/* ============================================
            ERROR
            ============================================ */}

        {error && (
          <div className="inline-error">
            {error}
          </div>
        )}


        {/* ============================================
            SEARCH + FILTER
            ============================================ */}

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


        {/* ============================================
            PRODUCTS TABLE
            ============================================ */}

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

                    <th>
                      #
                    </th>

                    <th>
                      ชื่อสินค้า
                    </th>

                    <th>
                      หมวดหมู่
                    </th>

                    <th>
                      ราคา
                    </th>

                    <th>
                      ประกัน
                    </th>

                    <th>
                      สถานะ
                    </th>

                    <th>
                      บันทึก
                    </th>

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

                          {/* NUMBER */}

                          <td>
                            {(meta.page -
                              1) *
                              (meta.limit ||
                                20) +
                              index +
                              1}
                          </td>


                          {/* PRODUCT */}

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


                          {/* CATEGORY */}

                          <td>
                            {item.category ||
                              '-'}
                          </td>


                          {/* PRICE */}

                          <td>

                            {item.price !=
                            null
                              ? `${Number(
                                  item.price
                                ).toLocaleString()}.-`
                              : '-'}

                          </td>


                          {/* WARRANTY */}

                          <td>
                            {item.warranty ||
                              '-'}
                          </td>


                          {/* STATUS */}

                          <td>

                            <StatusBadge
                              status={
                                item.productStatus ||
                                'ACTIVE'
                              }
                            />

                          </td>


                          {/* FAVORITE ONLY */}

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
                                aria-label={
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


              {/* EMPTY */}

              {!visibleProducts.length && (
                <div className="empty-inline">
                  ไม่พบสินค้าในเงื่อนไขนี้
                </div>
              )}


              {/* PAGINATION */}

              <div className="table-footer">

                <span>
                  ทั้งหมด{' '}
                  {meta.totalItems ||
                    products.length}{' '}
                  รายการ
                </span>


                <PaginationBar
                  page={
                    meta.page ||
                    1
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

    </CustomerPageFrame>
  );
}