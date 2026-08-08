# PC FINDER — Frontend Foundation + Google Auth

รอบนี้ทำเฉพาะสิ่งที่ต้องพร้อมก่อนนำไปรวม Backend:

- Vite + React
- React Router
- React-Bootstrap
- Axios instance + interceptor
- Google OAuth login
- JWT Access Token / Refresh Token flow
- `/api/auth/google`, `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout`
- Protected Route และ Role Route foundation
- Mock Auth ตาม API Contract
- Login UX/UI แบบแบ่งสองฝั่ง
- Reusable components เช่น Save / Cancel / AppButton / Alert / Loader



## เริ่มใช้งาน

เปิด Terminal ในโฟลเดอร์เดียวกับ `package.json`

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดง เช่น `http://localhost:5173`

## โหมด Mock — ค่าเริ่มต้น

`.env`

```env
VITE_USE_MOCK_AUTH=true
VITE_MOCK_ROLE=USER
```

กด `เข้าสู่ระบบด้วย Google` ได้ทันที โดยยังไม่ต้องมี Backend

ทดสอบ role mock ได้ด้วย `USER`, `SHOP`, `ADMIN` แล้ว restart dev server

## เปลี่ยนไปใช้ Backend + Google จริง

แก้ `.env`

```env
VITE_USE_MOCK_AUTH=false
VITE_API_BASE_URL=https://your-backend.example.com
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

จากนั้น restart:

```bash
npm run dev
```

> Google Client ID ต้องเป็น Web Client ID ของโปรเจกต์จริง และต้องตั้ง Authorized JavaScript origins ให้ตรงกับ URL Frontend

## Build

```bash
npm run build
```

ไฟล์ production จะอยู่ใน `dist/`

## Integration กับ Backend

อ่าน `docs/INTEGRATION_CHECKLIST.md`
