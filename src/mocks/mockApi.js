import {

  adminStats,

  adminStores,

  hardware,

  matchedStores,

  shopStats,

  store,

  storeProducts,

  users,

} from '../data/mockData';



import { normalizeRole } from '../auth/roles';



const wait = (ms = 250) =>

  new Promise((resolve) => setTimeout(resolve, ms));



const ok = (data, message = 'สำเร็จ') => ({

  status: 'success',

  message,

  data,

});



const mockRole = normalizeRole(

  import.meta.env.VITE_MOCK_ROLE || 'USER'

);



const currentUser = {

  userId:

    mockRole === 'ADMIN'

      ? 99

      : mockRole === 'SHOP'

        ? 10

        : 1,



  email:

    mockRole === 'ADMIN'

      ? 'admin@pcfinder.dev'

      : mockRole === 'SHOP'

        ? 'owner@jjcomputer.dev'

        : 'user@pcfinder.dev',



  name:

    mockRole === 'ADMIN'

      ? 'Admin'

      : mockRole === 'SHOP'

        ? 'JJ Computer'

        : 'ผู้ใช้ PC FINDER',



  profilePicture: '',

  role: mockRole,

};





/* =========================================================

   MOCK FAVORITES

   ========================================================= */



const getMockFavoriteProductCatalog = () => {

  const matchedProducts = matchedStores.flatMap((shop) => {

    const products = Array.isArray(shop.products)

      ? shop.products

      : [];



    return products

      .filter(

        (product) =>

          product &&

          typeof product === 'object' &&

          !Array.isArray(product) &&

          product.shopProductId != null

      )

      .map((product) => ({

        shopProductId: product.shopProductId,



        masterId:

          product.masterId ??

          product.masterDataId ??

          null,



        displayName:

          product.displayName ||

          product.hardwareName ||

          product.name ||

          '-',



        hardwareName:

          product.hardwareName ||

          product.displayName ||

          product.name ||

          '-',



        category: product.category || '-',

        price: Number(product.price || 0),



        shopId: shop.shopId,

shopName: shop.shopName,

profileImageUrl: shop.shopImageUrl || '',



province: shop.province || 'กรุงเทพมหานคร',

district: shop.district || '',



latitude:

  shop.shopLatitude ??

  shop.latitude ??

  null,



longitude:

  shop.shopLongitude ??

  shop.longitude ??

  null,



fullAddress:

  shop.fullAddress ||

  [

    shop.district,

    shop.province,

  ]

    .filter(Boolean)

    .join(' '),



operatingHours:

  shop.operatingHours || '',



contactChannels:

  shop.contactChannels ||

  shop.contact ||

  {},



addDate: '01/09/2026',

      }));

  });



  const jjProducts = storeProducts.map((product) => ({

    shopProductId: product.shopProductId,



    masterId:

      product.masterDataId ??

      product.masterId ??

      null,



    displayName:

      product.hardwareName ||

      product.displayName ||

      '-',



    hardwareName:

      product.hardwareName ||

      product.displayName ||

      '-',



    category: product.category || '-',

    price: Number(product.price || 0),



   shopId: store.shopId,

shopName: store.shopName,

profileImageUrl: store.profileImageUrl || '',



province: 'กรุงเทพมหานคร',

district: 'จอมทอง',



latitude:

  store.latitude ?? null,



longitude:

  store.longitude ?? null,



fullAddress:

  store.fullAddress || '',



operatingHours:

  store.operatingHours || '',



contactChannels:

  store.contactChannels ||

  store.contact ||

  {},



addDate: '01/09/2026',

  }));



  return [

    ...matchedProducts,

    ...jjProducts,

  ];

};



const mockFavoriteProductIds = new Set(

  getMockFavoriteProductCatalog()

    .slice(0, 4)

    .map((item) => String(item.shopProductId))

);



const mockFavoriteStoreIds = new Set(

  adminStores

    .slice(0, 3)

    .map((item) => String(item.shopId))

);





/* =========================================================

   MOCK API

   ========================================================= */



export const mockApi = {

  /* =======================================================

     AUTH

     ======================================================= */



  auth: {

    googleLogin: async () => {

      await wait();



      return ok(

        {

          accessToken: 'mock-access-token',

          refreshToken: 'mock-refresh-token',

          user: currentUser,

        },

        'เข้าสู่ระบบสำเร็จ'

      );

    },



    me: async () => {

      await wait(120);



      return ok(

        {

          user: currentUser,

        },

        'ดึงข้อมูลสำเร็จ'

      );

    },



    logout: async () => {

      await wait(100);



      return ok(

        null,

        'ออกจากระบบสำเร็จ'

      );

    },

  },





  /* =======================================================

     HARDWARE

     ======================================================= */



  hardware: {

    list: async (category, params = {}) => {

      await wait();



      const search = String(

        params.search || ''

      ).toLowerCase();



      const rows = hardware.filter(

        (item) =>

          item.category === category &&

          (

            !search ||

            `${item.name} ${item.brand}`

              .toLowerCase()

              .includes(search)

          )

      );



      return {

        status: 'success',

        data: rows,



        meta: {

          page: 1,

          limit: 20,

          totalItems: rows.length,

          totalPages: 1,

        },

      };

    },





    autocomplete: async (category, keyword) => {

      await wait(120);



      const k = String(

        keyword || ''

      ).toLowerCase();



      const rows = hardware

        .filter(

          (item) =>

            item.category === category &&

            item.name

              .toLowerCase()

              .includes(k)

        )

        .slice(0, 8)

        .map(

          ({

            id,

            name,

            brand,

          }) => ({

            id,

            masterId: id,

            name,

            displayName: name,

            brand,

          })

        );



      return ok(rows);

    },





    /* =======================================================
       MASTER HARDWARE DETAIL
       Mock: GET /api/hardware/:masterId/detail
       ======================================================= */

    masterDetail: async (masterId) => {
      await wait(150);

      const id = Number(masterId);

      // Backend example confirmed for testing Gap Analysis.
      if (id === 12) {
        return ok(
          {
            masterId: 12,
            displayName: 'Crucial T500 2TB PCIe 4.0 NVMe M.2',
            brand: 'Crucial',
            category: 'STORAGE',
            storages: {
              storageType: 'SSD M.2',
              interfaceType: 'PCIe 4.0 x4',
              capacityGB: 2000,
              model: 'T500',
            },
          },
          'ดึงข้อมูลฮาร์ดแวร์สำเร็จ'
        );
      }

      const item = hardware.find(
        (hardwareItem) =>
          Number(
            hardwareItem.masterId ??
            hardwareItem.id
          ) === id
      );

      if (!item) {
        throw new Error('ไม่พบ Master Hardware');
      }

      const category = String(
        item.category || ''
      ).toUpperCase();

      const data = {
        masterId: item.masterId ?? item.id,
        displayName:
          item.displayName || item.name || '-',
        brand: item.brand || '',
        category,
      };

      if (category === 'CPU') {
        data.cpus = {
          family: item.family || item.specs?.family || '',
          processorClass:
            item.processorClass ||
            item.specs?.processorClass ||
            '',
          socket: item.socket || item.specs?.socket || '',
        };
      }

      if (category === 'MAINBOARD') {
        data.mainboards = {
          serie:
            item.serie ||
            item.series ||
            item.specs?.serie ||
            item.specs?.series ||
            '',
          formFactor:
            item.formFactor || item.specs?.formFactor || '',
          socket: item.socket || item.specs?.socket || '',
          chipset: item.chipset || item.specs?.chipset || '',
        };
      }

      if (category === 'VGA') {
        data.vgas = {
          series: item.series || item.specs?.series || '',
          chipset: item.chipset || item.specs?.chipset || '',
          vramSize: item.vramSize || item.specs?.vramSize || '',
        };
      }

      if (category === 'RAM') {
        data.rams = {
          ramType: item.ramType || item.specs?.ramType || '',
          capacityGB:
            item.capacityGB || item.specs?.capacityGB || '',
          busSpeed: item.busSpeed || item.specs?.busSpeed || '',
        };
      }

      if (category === 'STORAGE') {
        data.storages = {
          storageType:
            item.storageType || item.specs?.storageType || '',
          interfaceType:
            item.interfaceType || item.specs?.interfaceType || '',
          capacityGB:
            item.capacityGB || item.specs?.capacityGB || '',
          model: item.model || item.specs?.model || '',
        };
      }

      if (category === 'PSU') {
        data.psus = {
          model: item.model || item.specs?.model || '',
          watt: item.watt || item.specs?.watt || '',
          standard80Plus:
            item.standard80Plus ||
            item.specs?.standard80Plus ||
            '',
        };
      }

      if (category === 'COOLER') {
        data.coolers = {
          model: item.model || item.specs?.model || '',
          coolerType:
            item.coolerType || item.specs?.coolerType || '',
          socketSupport:
            item.socketSupport ||
            item.specs?.socketSupport ||
            '',
        };
      }

      return ok(data, 'ดึงข้อมูลฮาร์ดแวร์สำเร็จ');
    },


    matchStores: async (payload = {}) => {

      await wait(350);



      const hardwareList = Array.isArray(

        payload.hardwareList

      )

        ? payload.hardwareList

        : [];



      const requestedItems = hardwareList.flatMap(

        (entry) => {

          const ids = Array.isArray(entry.masterId)

            ? entry.masterId

            : [entry.masterId];



          return ids

            .filter(

              (id) =>

                id !== null &&

                id !== undefined

            )

            .map((masterId) => ({

              category: String(

                entry.category || ''

              ).toUpperCase(),



              masterId: Number(masterId),

            }));

        }

      );



      const results = matchedStores

        .map((shop) => {

          const shopProducts = Array.isArray(

            shop.products

          )

            ? shop.products

            : [];



          const details = requestedItems.map(

            (requested) => {

              const product = shopProducts.find(

                (item) =>

                  String(

                    item.category || ''

                  ).toUpperCase() ===

                    requested.category &&

                  Number(item.masterId) ===

                    Number(

                      requested.masterId

                    )

              );



              const available =

                !!product &&

                product.status === 'ACTIVE' &&

                Number(product.stock || 0) > 0;



              return {

                category: requested.category,

                masterId: requested.masterId,



                displayName:

                  product?.displayName || '',



                isMatched: available,

                productStatus: available,



                shopProductId:

                  available

                    ? product.shopProductId

                    : null,



                price:

                  available

                    ? Number(

                        product.price || 0

                      )

                    : 0,



                stockQuantity:

                  available

                    ? Number(

                        product.stock || 0

                      )

                    : 0,

              };

            }

          );



          const matchedDetails = details.filter(

            (item) => item.isMatched

          );



          const totalPrice = matchedDetails.reduce(

            (sum, item) =>

              sum +

              Number(

                item.price || 0

              ),

            0

          );



          return {

            shopId: shop.shopId,

            shopName: shop.shopName,

            shopImageUrl:

              shop.shopImageUrl || '',



            province:

              shop.province ||

              'กรุงเทพมหานคร',



            district:

              shop.district || '',



            distanceKm: shop.distanceKm,

            shopLatitude: shop.shopLatitude,

            shopLongitude: shop.shopLongitude,



            rating: shop.rating,

            reviews: shop.reviews,



            hardwareMatchCount:

              matchedDetails.length,



            matchCount:

              matchedDetails.length,



            totalPrice,

            details,

          };

        })

        .filter(

          (shop) =>

            shop.hardwareMatchCount > 0

        )

        .sort(

          (a, b) =>

            b.hardwareMatchCount -

            a.hardwareMatchCount

        );



      return ok(

        results,

        'ค้นหาและจับคู่ร้านค้าสำเร็จ'

      );

    },





    summary: async (shopProductIds = []) => {

      await wait(250);



      const ids = Array.isArray(shopProductIds)

        ? shopProductIds

        : [shopProductIds];



      const validIds = ids.filter(

        (id) =>

          id !== null &&

          id !== undefined

      );



      const wantedIds = new Set(

        validIds.map((id) => String(id))

      );



      const items = [];



      matchedStores.forEach((shop) => {

        const products = Array.isArray(

          shop.products

        )

          ? shop.products

          : [];



        products.forEach((product) => {

          if (

            !product ||

            typeof product !== 'object' ||

            Array.isArray(product)

          ) {

            return;

          }



          const shopProductId =

            product.shopProductId;



          if (

            shopProductId == null ||

            !wantedIds.has(

              String(shopProductId)

            )

          ) {

            return;

          }



          items.push({

            shopProductId,



            masterId:

              product.masterId ??

              product.masterDataId ??

              null,



            category:

              product.category || '-',



            displayName:

              product.displayName ||

              product.hardwareName ||

              product.name ||

              '-',



            hardwareName:

              product.hardwareName ||

              product.displayName ||

              product.name ||

              '-',



            price: Number(

              product.price || 0

            ),



            unitPrice: Number(

              product.price || 0

            ),



            shop: {

              shopId: shop.shopId,

              shopName: shop.shopName,



              addressText:

                shop.fullAddress ||

                [

                  shop.district,

                  shop.province,

                ]

                  .filter(Boolean)

                  .join(' '),



              subDistrict:

                shop.subDistrict || '',



              district:

                shop.district || '',



              province:

                shop.province || '',



              zipCode:

                shop.zipCode || '',

            },

          });

        });

      });



      storeProducts.forEach((product) => {

        const shopProductId =

          product.shopProductId;



        if (

          shopProductId == null ||

          !wantedIds.has(

            String(shopProductId)

          )

        ) {

          return;

        }



        const alreadyAdded = items.some(

          (item) =>

            String(

              item.shopProductId

            ) ===

            String(shopProductId)

        );



        if (alreadyAdded) {

          return;

        }



        items.push({

          shopProductId,



          masterId:

            product.masterDataId ??

            product.masterId ??

            null,



          category:

            product.category || '-',



          displayName:

            product.hardwareName ||

            product.displayName ||

            '-',



          hardwareName:

            product.hardwareName ||

            product.displayName ||

            '-',



          price: Number(

            product.price || 0

          ),



          unitPrice: Number(

            product.price || 0

          ),



          shop: {

            shopId: store.shopId,

            shopName: store.shopName,



            addressText:

              store.fullAddress || '',



            subDistrict:

              store.subDistrict || '',



            district:

              store.district || '',



            province:

              store.province || '',



            zipCode:

              store.zipCode || '',

          },

        });

      });



      const orderedItems = validIds

        .map((id) =>

          items.find(

            (item) =>

              String(

                item.shopProductId

              ) ===

              String(id)

          )

        )

        .filter(Boolean);



      const uniqueItems = [

        ...new Map(

          orderedItems.map((item) => [

            String(item.shopProductId),

            item,

          ])

        ).values(),

      ];



      const totalPrice = uniqueItems.reduce(

        (total, item) =>

          total +

          Number(

            item.price ||

            item.unitPrice ||

            0

          ),

        0

      );



      return ok(

        {

          summary: {

            totalItems:

              uniqueItems.length,



            totalPrice,

          },



          items: uniqueItems,

        },

        'สร้างใบสรุปรายการสำเร็จ'

      );

    },

  },





  /* =======================================================

     PUBLIC STORES

     ======================================================= */



  stores: {

    profile: async () => {

      await wait();



      return ok(

        store,

        'ดึงข้อมูลร้านค้าสำเร็จ'

      );

    },





    products: async (shopId) => {

      await wait();



      const matchedShop = matchedStores.find(

        (shop) =>

          Number(shop.shopId) ===

          Number(shopId)

      );



      if (matchedShop) {

        const products = matchedShop.products

          .filter(

            (item) =>

              item &&

              typeof item === 'object' &&

              !Array.isArray(item)

          )

          .map((item) => ({

            shopProductId:

              item.shopProductId,



            masterDataId:

              item.masterId,



            masterId:

              item.masterId,



            category:

              item.category,



            brand:

              item.brand || '',



            hardwareName:

              item.displayName,



            displayName:

              item.displayName,



            price:

              item.price,



            stock:

              item.stock,



            status:

              item.status,



            description:

              item.description || '',

          }));



        return {

          status: 'success',

          data: products,



          meta: {

            page: 1,

            limit: 20,

            totalItems:

              products.length,

            totalPages: 1,

          },

        };

      }



      return {

        status: 'success',

        data: storeProducts,



        meta: {

          page: 1,

          limit: 20,

          totalItems:

            storeProducts.length,

          totalPages: 1,

        },

      };

    },

  },





  /* =======================================================

     USERS

     ======================================================= */



  users: {

    /* =====================

       FAVORITE PRODUCTS

       ===================== */



    favoriteProducts: async (params = {}) => {

      await wait();



      const page = Number(

        params.page || 1

      );



      const limit = Number(

        params.limit || 20

      );



      const category = String(

        params.category || ''

      ).toUpperCase();



      let allRows =

        getMockFavoriteProductCatalog()

          .filter(

            (item) =>

              mockFavoriteProductIds.has(

                String(

                  item.shopProductId

                )

              )

          );



      if (category) {

        allRows = allRows.filter(

          (item) =>

            String(

              item.category || ''

            ).toUpperCase() ===

            category

        );

      }



      const start =

        (page - 1) * limit;



      const rows = allRows.slice(

        start,

        start + limit

      );



      return {

        status: 'success',

        data: rows,



        meta: {

          page,

          limit,



          totalItems:

            allRows.length,



          totalPages: Math.max(

            1,

            Math.ceil(

              allRows.length /

              limit

            )

          ),

        },

      };

    },





    addFavoriteProduct: async (

      shopProductId

    ) => {

      await wait(120);



      mockFavoriteProductIds.add(

        String(shopProductId)

      );



      return ok(

        {

          shopProductId,

        },

        'บันทึกสินค้าเรียบร้อยแล้ว'

      );

    },





    removeFavoriteProduct: async (

      shopProductId

    ) => {

      await wait(120);



      mockFavoriteProductIds.delete(

        String(shopProductId)

      );



      return ok(

        {

          shopProductId,

        },

        'ลบสินค้าออกจากรายการที่บันทึกแล้ว'

      );

    },





    /* =====================

       FAVORITE STORES

       ===================== */



    favoriteStores: async (params = {}) => {

      await wait();



      const page = Number(

        params.page || 1

      );



      const limit = Number(

        params.limit || 20

      );



      const allRows = adminStores

        .filter(

          (item) =>

            mockFavoriteStoreIds.has(

              String(item.shopId)

            )

        )

        .map((item) => ({

          shopId: item.shopId,

          shopName: item.shopName,



          profileImageUrl:

            item.profileImageUrl || '',



          province:

            item.province || '',



          district:

            item.district || '',



          addDate:

            item.addDate ||

            item.submittedAt ||

            '01/09/2026',

        }));



      const start =

        (page - 1) * limit;



      const rows = allRows.slice(

        start,

        start + limit

      );



      return {

        status: 'success',

        data: rows,



        meta: {

          page,

          limit,



          totalItems:

            allRows.length,



          totalPages: Math.max(

            1,

            Math.ceil(

              allRows.length /

              limit

            )

          ),

        },

      };

    },





    addFavoriteStore: async (shopId) => {

      await wait(120);



      mockFavoriteStoreIds.add(

        String(shopId)

      );



      return ok(

        {

          shopId,

        },

        'บันทึกร้านค้าเรียบร้อยแล้ว'

      );

    },





    removeFavoriteStore: async (shopId) => {

      await wait(120);



      mockFavoriteStoreIds.delete(

        String(shopId)

      );



      return ok(

        {

          shopId,

        },

        'ลบร้านค้าออกจากรายการที่บันทึกแล้ว'

      );

    },





    /*

     * Compatibility สำหรับโค้ดเก่า

     */

    favorites: async () => {

      await wait();



      return ok(

        adminStores.slice(0, 3)

      );

    },





    /* =====================

       SPECS

       ===================== */



    specs: async () => {

      await wait();



      return ok([

        {

          specId: 101,

          specName:

            'คอมเล่นเกมงบ 50K',

          totalPrice: 49580,

          totalItems: 3,

          updatedAt:

            '2026-08-07T09:30:00Z',

        },



        {

          specId: 102,

          specName:

            'เครื่องทำงานตัดต่อ',

          totalPrice: 61790,

          totalItems: 5,

          updatedAt:

            '2026-08-05T12:00:00Z',

        },

      ]);

    },

  },





  /* =======================================================

     SHOP

     ======================================================= */



  shop: {

    dashboard: async () => {

      await wait();

      return ok({
        storeInfo: store,

        /*
         * ใช้ key ให้ตรงกับ ShopDashboardPage.jsx
         * เพื่อให้ Mock แสดงตัวเลขและมีข้อมูลทดสอบทันที
         */
        overview: {
          ...shopStats.overview,
          allGoodsInStore: storeProducts.length,
          likeReceivedCount: 18,
        },

        mostInterestedHardware: {
          STORAGE: {
            hardwareName:
              'Crucial T500 2TB PCIe 4.0 NVMe M.2',
            searchCount: 24,
          },
          PSU: {
            hardwareName:
              'be quiet! Pure Power 12 M 850W 80 Plus Gold',
            searchCount: 17,
          },
          VGA: {
            hardwareName:
              'MSI GeForce RTX 4060 Ti GAMING X 16GB',
            searchCount: 15,
          },
        },

        /*
         * รายการนี้มีไว้ทดสอบปุ่ม "เพิ่มสินค้า"
         * กดแล้วจะส่ง masterId 12 ไปหน้า /shop/products
         * และ Mock masterDetail ด้านบนจะ Autofill Crucial T500
         */
        missingSavedItems: [
          {
            masterId: 12,
            hardwareName:
              'Crucial T500 2TB PCIe 4.0 NVMe M.2',
            savedCount: 2,
          },
        ],

        /* เก็บข้อมูลเดิมไว้ เผื่อหน้าอื่นใช้งาน */
        hotItems: storeProducts,
        trendInsights: shopStats.trend,
        categoryShare: shopStats.categoryShare,
      });

    },





    products: async () => {

      await wait();



      return ok({

        totalItems:

          storeProducts.length,



        products:

          storeProducts,

      });

    },





    register: async (payload) => {

      await wait();



      return ok(

        {

          shopId: 99,

          shopStatus: 'PENDING',

          ...payload,

        },

        'ลงทะเบียนสำเร็จ กรุณารอยืนยัน'

      );

    },

profileMe: async () => {
  await wait(120);

  return ok({
    shopName:
      'NextLevel IT & Gadgets',

    profileImageUrl:
      null,

    shopDescription:
      'Testt',

    operatingHours:
      'ทุกวัน 10:00 - 20:00 (ไม่มีวันหยุด)',

    contactChannels: {
      line:
        'testLine',

      website:
        'testWeb',

      facebook:
        'testFace',
    },

    addressText:
      '88/15 หมู่ 4 ซอยงามวงศ์วาน 18 ถนนงามวงศ์วาน',

    subDistrict:
      'บางเขน',

    district:
      'เมืองนนทบุรี',

    province:
      'นนทบุรี',

    zipCode:
      '11000',

    latitude:
      13.861245,

    longitude:
      100.528341,

    ownerPhone:
      '0894123589',
  });
},



    updateProfile: async (payload) => {

      await wait();



      return ok(

        {

          ...store,

          ...payload,

        },

        'อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว'

      );

    },





    createProduct: async (payload) => {

      await wait();



      return ok(

        {

          shop_product_id:

            Date.now(),



          ...payload,

        },

        'เพิ่มสินค้าเข้าร้านค้าเรียบร้อยแล้ว'

      );

    },

  },





  /* =======================================================

     ADMIN

     ======================================================= */



  admin: {

    dashboard: async () => {

      await wait();



      return ok(

        adminStats

      );

    },





    users: async () => {

      await wait();



      return ok(

        users

      );

    },





    stores: async () => {

      await wait();



      return ok(

        adminStores

      );

    },





    store: async (shopId) => {

      await wait();



      return ok({

        ...store,



        shopId:

          Number(shopId),



        owner: {

          userId: 25,



          email:

            'somchai.shop@email.com',



          firstName:

            'สมชาย',



          lastName:

            'ใจดี',



          phone:

            '081-234-5678',

        },



        status: {

          shopStatus:

            'PENDING',



          submittedAt:

            '2026-08-06T10:00:00Z',

        },



        statistics: {

          totalProducts: 150,

          totalFavorites: 45,

        },

      });

    },





    updateUserStatus: async (

      userId,

      userStatus

    ) => {

      await wait();



      return ok(

        {

          userId,

          userStatus,

        },

        'อัปเดตสถานะผู้ใช้งานเรียบร้อยแล้ว'

      );

    },





    updateStoreStatus: async (

      shopId,

      shopStatus

    ) => {

      await wait();



      return ok(

        {

          shopId,

          shopStatus,

        },

        'อัปเดตสถานะร้านค้าเรียบร้อยแล้ว'

      );

    },

  },

};
