import { adminStats, adminStores, hardware, matchedStores, shopStats, store, storeProducts, users } from '../data/mockData';
import { normalizeRole } from '../auth/roles';

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (data, message = 'สำเร็จ') => ({ status: 'success', message, data });

const mockRole = normalizeRole(import.meta.env.VITE_MOCK_ROLE || 'USER');
const currentUser = {
  userId: mockRole === 'ADMIN' ? 99 : mockRole === 'SHOP' ? 10 : 1,
  email: mockRole === 'ADMIN' ? 'admin@pcfinder.dev' : mockRole === 'SHOP' ? 'owner@jjcomputer.dev' : 'user@pcfinder.dev',
  name: mockRole === 'ADMIN' ? 'Admin' : mockRole === 'SHOP' ? 'JJ Computer' : 'ผู้ใช้ PC FINDER',
  profilePicture: '',
  role: mockRole,
};

export const mockApi = {
  auth: {
    googleLogin: async () => { await wait(); return ok({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: currentUser }, 'เข้าสู่ระบบสำเร็จ'); },
    me: async () => { await wait(120); return ok({ user: currentUser }, 'ดึงข้อมูลสำเร็จ'); },
    logout: async () => { await wait(100); return ok(null, 'ออกจากระบบสำเร็จ'); },
  },
  hardware: {
    list: async (category, params = {}) => {
      await wait();
      const search = String(params.search || '').toLowerCase();
      const rows = hardware.filter((item) => item.category === category && (!search || `${item.name} ${item.brand}`.toLowerCase().includes(search)));
      return { status: 'success', data: rows, meta: { page: 1, limit: 20, totalItems: rows.length, totalPages: 1 } };
    },
    autocomplete: async (category, keyword) => {
      await wait(120);
      const k = keyword.toLowerCase();
      return ok(hardware.filter((x) => x.category === category && x.name.toLowerCase().includes(k)).slice(0, 8).map(({ id, name }) => ({ id, name })));
    },
    matchStores: async () => { await wait(350); return ok(matchedStores, 'ค้นหาและจับคู่ร้านค้าสำเร็จ'); },
  },
  stores: {
    profile: async () => { await wait(); return ok(store, 'ดึงข้อมูลร้านค้าสำเร็จ'); },
    products: async () => { await wait(); return { status: 'success', data: storeProducts, meta: { page: 1, limit: 20, totalItems: storeProducts.length, totalPages: 1 } }; },
  },
  users: {
    favorites: async () => { await wait(); return ok(adminStores.slice(0, 3)); },
    specs: async () => { await wait(); return ok([
      { specId: 101, specName: 'คอมเล่นเกมงบ 50K', totalPrice: 49580, totalItems: 3, updatedAt: '2026-08-07T09:30:00Z' },
      { specId: 102, specName: 'เครื่องทำงานตัดต่อ', totalPrice: 61790, totalItems: 5, updatedAt: '2026-08-05T12:00:00Z' },
    ]); },
  },
  shop: {
    dashboard: async () => { await wait(); return ok({ storeInfo: store, overview: shopStats.overview, hotItems: storeProducts, trendInsights: shopStats.trend, categoryShare: shopStats.categoryShare }); },
    products: async () => { await wait(); return ok({ totalItems: storeProducts.length, products: storeProducts }); },
    register: async (payload) => { await wait(); return ok({ shopId: 99, shopStatus: 'PENDING', ...payload }, 'ลงทะเบียนสำเร็จ กรุณารอยืนยัน'); },
    updateProfile: async (payload) => { await wait(); return ok({ ...store, ...payload }, 'อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว'); },
    createProduct: async (payload) => { await wait(); return ok({ shop_product_id: Date.now(), ...payload }, 'เพิ่มสินค้าเข้าร้านค้าเรียบร้อยแล้ว'); },
  },
  admin: {
    dashboard: async () => { await wait(); return ok(adminStats); },
    users: async () => { await wait(); return ok(users); },
    stores: async () => { await wait(); return ok(adminStores); },
    store: async (shopId) => { await wait(); return ok({ ...store, shopId: Number(shopId), owner: { userId: 25, email: 'somchai.shop@email.com', firstName: 'สมชาย', lastName: 'ใจดี', phone: '081-234-5678' }, status: { shopStatus: 'PENDING', submittedAt: '2026-08-06T10:00:00Z' }, statistics: { totalProducts: 150, totalFavorites: 45 } }); },
    updateUserStatus: async (userId, userStatus) => { await wait(); return ok({ userId, userStatus }, 'อัปเดตสถานะผู้ใช้งานเรียบร้อยแล้ว'); },
    updateStoreStatus: async (shopId, shopStatus) => { await wait(); return ok({ shopId, shopStatus }, 'อัปเดตสถานะร้านค้าเรียบร้อยแล้ว'); },
  },
};
