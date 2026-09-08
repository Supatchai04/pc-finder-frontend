export const categories = [
  { key: 'CPU', label: 'CPU' },
  { key: 'MAINBOARD', label: 'Mainboard' },
  { key: 'VGA', label: 'VGA Card' },
  { key: 'RAM', label: 'Memory' },
  { key: 'STORAGE', label: 'Storage' },
  { key: 'PSU', label: 'Power Supply' },
  { key: 'COOLER', label: 'CPU Cooler' },
];

export const hardware = [
  { id: 1, category: 'CPU', brand: 'Intel', name: 'Intel Core i5-14700K', memory: '-', chipset: 'LGA1700', price: 14900, stock: 12 },
  { id: 2, category: 'CPU', brand: 'AMD', name: 'AMD Ryzen 7 7800X3D', memory: '-', chipset: 'AM5', price: 15900, stock: 0 },
  { id: 3, category: 'VGA', brand: 'ASUS', name: 'ROG Strix RTX 5070 Ti OC', memory: '16GB GDDR7', chipset: 'RTX 5070 Ti', price: 40400, stock: 12 },
  { id: 4, category: 'VGA', brand: 'ASUS', name: 'TUF Gaming RTX 5070 Ti OC', memory: '16GB GDDR7', chipset: 'RTX 5070 Ti', price: 40800, stock: 8 },
  { id: 5, category: 'VGA', brand: 'Gigabyte', name: 'AORUS RTX 5070 Ti MASTER', memory: '16GB GDDR7', chipset: 'RTX 5070 Ti', price: 41900, stock: 4 },
  { id: 6, category: 'VGA', brand: 'Gigabyte', name: 'Gaming OC RTX 5070 Ti', memory: '16GB GDDR7', chipset: 'RTX 5070 Ti', price: 40800, stock: 5 },
  { id: 7, category: 'VGA', brand: 'MSI', name: 'Gaming Trio OC RTX 5070 Ti', memory: '16GB GDDR7', chipset: 'RTX 5070 Ti', price: 40500, stock: 3 },
  { id: 8, category: 'RAM', brand: 'Kingston', name: 'Kingston Fury Beast DDR5 32GB 5600', memory: '32GB', chipset: 'DDR5', price: 3290, stock: 25 },
  { id: 9, category: 'RAM', brand: 'Corsair', name: 'Corsair Vengeance RGB 32GB DDR5 6000', memory: '32GB', chipset: 'DDR5', price: 4790, stock: 5 },
  { id: 10, category: 'STORAGE', brand: 'WD', name: 'WD BLACK SN850X 1TB NVMe PCIe 4.0', memory: '1TB', chipset: 'NVMe', price: 3990, stock: 18 },
  { id: 11, category: 'STORAGE', brand: 'Samsung', name: 'Samsung 990 PRO 2TB NVMe', memory: '2TB', chipset: 'NVMe', price: 6990, stock: 9 },
  { id: 12, category: 'MAINBOARD', brand: 'MSI', name: 'MSI MAG B650M Mortar WiFi DDR5', memory: 'DDR5', chipset: 'B650', price: 6290, stock: 7 },
  { id: 13, category: 'PSU', brand: 'Corsair', name: 'Corsair RM750e 750W 80+ Gold', memory: '-', chipset: '80+ Gold', price: 3590, stock: 12 },
  { id: 14, category: 'COOLER', brand: 'Lian Li', name: 'Lian Li Galahad II 360', memory: '-', chipset: 'AIO 360', price: 4590, stock: 6 },
];

export const store = {
  shopId: 10,
  shopName: 'JJ Computer',
  profileImageUrl: '',
  description: 'จำหน่ายอุปกรณ์คอมพิวเตอร์และสินค้าไอทีครบวงจร',
  fullAddress: '62/17 หมู่ 2 ซอยเอกชัย 28-30 ถนนเอกชัย แขวงบางขุนเทียน เขตจอมทอง กรุงเทพมหานคร 10150',
  latitude: 13.685412,
  longitude: 100.460831,
  contact: { phone: '081-234-5678', lineId: '@jjcomputer', facebook: 'JJ Computer' },
  operatingHours: 'จันทร์ - เสาร์ 09:00 - 18:00 น.',
};

export const storeProducts = [
  { shopProductId: 501, masterDataId: 1, category: 'CPU', brand: 'Intel', hardwareName: 'INTEL CORE i5-14600KF', price: 11490, stock: 12, status: 'ACTIVE', description: 'ประกันศูนย์ 3 ปี', specPulls: 167 },
  { shopProductId: 502, masterDataId: 5, category: 'VGA', brand: 'Gigabyte', hardwareName: 'GIGABYTE RTX 4060 WINDFORCE OC 8GB GDDR6', price: 12900, stock: 6, status: 'ACTIVE', description: 'สินค้าใหม่ กล่องครบ', specPulls: 183 },
  { shopProductId: 503, masterDataId: 9, category: 'RAM', brand: 'Corsair', hardwareName: 'CORSAIR VENGEANCE RGB 32GB (16GBx2) DDR5 5200MHz', price: 3990, stock: 20, status: 'ACTIVE', description: 'Lifetime warranty', specPulls: 142 },
  { shopProductId: 504, masterDataId: 10, category: 'STORAGE', brand: 'Samsung', hardwareName: 'SAMSUNG 980 PRO 1TB NVMe M.2', price: 3990, stock: 9, status: 'ACTIVE', description: 'ประกัน 5 ปี', specPulls: 119 },
  { shopProductId: 505, masterDataId: 12, category: 'MAINBOARD', brand: 'ASUS', hardwareName: 'ASUS PRIME B760M-A WIFI', price: 7500, stock: 0, status: 'OUT', description: 'Wi-Fi onboard', specPulls: 55 },
  { shopProductId: 506, masterDataId: 13, category: 'PSU', brand: 'Cooler Master', hardwareName: 'COOLER MASTER MWE 750 V2 750W 80 PLUS GOLD', price: 3590, stock: 12, status: 'ACTIVE', description: 'ประกัน 5 ปี', specPulls: 43 },
];

export const users = [
  { userId: 1, displayName: 'สมชาย ใจดี', email: 'somchai@example.com', phone: '081-234-5678', userRole: 'CUSTOMER', userStatus: 'ACTIVE', registeredAt: '20 พ.ค. 2567' },
  { userId: 2, displayName: 'กมลวรรณ แสนดี', email: 'kamonwan@example.com', phone: '083-345-6789', userRole: 'CUSTOMER', userStatus: 'ACTIVE', registeredAt: '19 พ.ค. 2567' },
  { userId: 3, displayName: 'JJ Computer', email: 'jjcomputer@example.com', phone: '083-111-2222', userRole: 'SHOP', userStatus: 'ACTIVE', registeredAt: '18 พ.ค. 2567' },
  { userId: 4, displayName: 'Advice IT', email: 'advice@example.com', phone: '082-123-4567', userRole: 'SHOP', userStatus: 'ACTIVE', registeredAt: '17 พ.ค. 2567' },
  { userId: 5, displayName: 'Power Buy', email: 'powerbuy@example.com', phone: '02-987-6543', userRole: 'SHOP', userStatus: 'SUSPENDED', registeredAt: '16 พ.ค. 2567' },
  { userId: 6, displayName: 'Admin One', email: 'admin@pcfinder.com', phone: '000-000-0001', userRole: 'ADMIN', userStatus: 'ACTIVE', registeredAt: '15 พ.ค. 2567' },
];

export const adminStores = [
  { shopId: 10, shopName: 'JJ Computer', ownerName: 'สมชาย ใจดี', email: 'somchai@example.com', ownerPhone: '081-234-5678', province: 'กรุงเทพมหานคร', shopStatus: 'OPEN', submittedAt: '20 พ.ค. 2567' },
  { shopId: 11, shopName: 'Advice IT', ownerName: 'กมลวรรณ แสนดี', email: 'kamonwan@example.com', ownerPhone: '082-456-7890', province: 'กรุงเทพมหานคร', shopStatus: 'OPEN', submittedAt: '19 พ.ค. 2567' },
  { shopId: 12, shopName: 'Power Buy', ownerName: 'วิชัย พงษ์ดี', email: 'wichai@example.com', ownerPhone: '083-777-2222', province: 'นนทบุรี', shopStatus: 'PENDING', submittedAt: '18 พ.ค. 2567' },
  { shopId: 13, shopName: 'Commart Zone', ownerName: 'กิตติชัย ศรีสุข', email: 'retail@example.com', ownerPhone: '082-333-4444', province: 'กรุงเทพมหานคร', shopStatus: 'OPEN', submittedAt: '17 พ.ค. 2567' },
  { shopId: 14, shopName: 'Hardware House', ownerName: 'ธนพล อินทร์ดี', email: 'hardware@example.com', ownerPhone: '080-555-6666', province: 'ปทุมธานี', shopStatus: 'REJECTED', submittedAt: '17 พ.ค. 2567' },
];

export const shopStats = {
  overview: [
    { label: 'จำนวนแฟ้มสเปคที่มีสินค้าร้าน', value: 314, trend: '+8.4% จากเดือนก่อน', tone: 'blue' },
    { label: 'สินค้าถูกหยิบใส่สเปค', value: 254, trend: '+12.6% จากเดือนก่อน', tone: 'green' },
    { label: 'ร้านค้าถูกบันทึก', value: 14, trend: '+2.4% จากเดือนก่อน', tone: 'purple' },
    { label: 'สินค้าทั้งหมด', value: 148, trend: '3 รายการสต็อกต่ำ', tone: 'orange' },
  ],
  trend: [14, 18, 21, 23, 29, 34],
  categoryShare: [30, 22, 18, 15, 9, 6],
};

export const adminStats = {
  kpis: [
    { label: 'ผู้ใช้งานทั้งหมด', value: '12,450', trend: '+8.4% จากเดือนก่อน', tone: 'blue' },
    { label: 'ร้านค้าทั้งหมด', value: '1,248', trend: '+6.2% จากเดือนก่อน', tone: 'green' },
    { label: 'สเปคที่ถูกบันทึก', value: '8,620', trend: '+11.7% จากเดือนก่อน', tone: 'purple' },
    { label: 'การค้นหาทั้งหมด', value: '45,231', trend: '+8.2% จากเดือนก่อน', tone: 'orange' },
  ],
  supply: [20450, 16200, 12860, 11280, 8980, 4250, 3280, 1220],
  demand: [18290, 14230, 10350, 7990, 6520, 3250, 1820, 1300],
};

export const matchedStores = [
  { shopId: 20, shopName: 'SpeedCom', rating: 4.8, reviews: 523, distanceKm: 7.2, totalPrice: 49580, products: [
    ['ASUS RTX 5070 Ti 16GB GDDR7', 40800], ['CORSAIR DDR5 32GB (16GBx2) 6000', 4790], ['WD BLACK SN850X 1TB NVMe PCIe 4.0', 3990]
  ] },
  { shopId: 21, shopName: 'JIB Online', rating: 4.7, reviews: 2356, distanceKm: 9.4, totalPrice: 51080, products: [
    ['ASUS RTX 5070 Ti 16GB GDDR7', 41900], ['CORSAIR DDR5 32GB (16GBx2) 6000', 4890], ['WD BLACK SN850X 1TB NVMe PCIe 4.0', 4290]
  ] },
];
