# Frontend Structure

โปรเจกต์นี้ตั้งใจทำเฉพาะ Foundation + Authentication เพื่อพร้อมรวม Backend

```text
src/
├─ api/
│  └─ apiClient.js          Axios + Bearer Token + 401 refresh interceptor
├─ components/
│  ├─ auth/                 Login UI / Google button / carousel
│  ├─ common/               reusable buttons, alert, loader
│  └─ layout/               brand component
├─ context/
│  └─ AuthContext.jsx       auth state, login, logout, restore session
├─ mocks/
│  └─ auth.mock.js          Mock response ตาม API Contract
├─ pages/
│  ├─ LoginPage.jsx
│  ├─ AuthReadyPage.jsx     หน้า placeholder สำหรับพิสูจน์ auth flow เท่านั้น
│  └─ NotFoundPage.jsx
├─ routes/
│  ├─ ProtectedRoute.jsx
│  └─ RoleRoute.jsx         เตรียมไว้ใช้ในสัปดาห์ถัดไป
├─ services/
│  └─ authService.js        จุดเดียวที่สลับ Mock / Real API
├─ styles/
│  └─ global.css
└─ utils/
   └─ tokenStore.js
```

## หลักที่ใช้

UI ไม่เรียก Axios ตรง ๆ แต่เรียกผ่าน `authService` เพื่อให้ตอน Backend พร้อม เปลี่ยนจาก Mock เป็น Real API โดยไม่ต้องรื้อหน้า Login
