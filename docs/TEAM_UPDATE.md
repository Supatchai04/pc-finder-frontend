# ข้อความอัปเดตทีม — Frontend Foundation + Auth

## ทำแล้ว

- ตั้ง Vite + React project
- React Router และ Protected Route
- Axios instance
- Request interceptor แนบ `Authorization: Bearer <accessToken>`
- Response interceptor รองรับ 401 → refresh token → retry request เดิม 1 ครั้ง
- Auth Context สำหรับ login / logout / restore session
- Google Identity Services flow สำหรับรับ Google ID Token
- เชื่อม contract `POST /api/auth/google`
- เตรียม `GET /api/auth/me`
- เตรียม `POST /api/auth/refresh`
- เตรียม `POST /api/auth/logout`
- Mock Auth ใช้ Response Shape เดียวกับเอกสาร
- หน้า Login Google only แบบ 2 ฝั่ง + carousel + dot indicator + swipe มือถือ
- Reusable React components: AppButton, SaveButton, CancelButton, AlertMessage, FullPageLoader
- `.env` สำหรับสลับ Mock / Real Backend
- `render.yaml` สำหรับนำ Frontend ขึ้น Cloud

## ยังไม่ทำ

- Hardware CRUD
- Stock
- Matching / Smart Split
- Google Maps
- Shop feature
- Admin feature

ส่วนเหล่านี้ไม่อยู่ใน scope ของรอบ Foundation + Authentication นี้

## ตอนรวม Backend ขอเช็กด้วยกัน

1. Base URL ของ Backend
2. CORS สำหรับ localhost และ Render frontend domain
3. Google Web Client ID และ Authorized JavaScript origins
4. `/api/auth/google` รับ `{ "googleToken": "..." }`
5. Response login มี `accessToken`, `refreshToken`, `user`
6. `/api/auth/me` ใช้ Bearer access token
7. `/api/auth/refresh` รับ refreshToken แล้วคืน accessToken ใหม่
8. `/api/auth/logout` รองรับ Bearer token + refreshToken
9. ชื่อ role ที่ Backend ใช้จริงให้ตกลงให้ตรงกัน
