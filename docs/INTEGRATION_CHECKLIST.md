# PC FINDER — Authentication Integration Checklist

เอกสารนี้ตั้งใจให้ Frontend กับ Backend เช็กพร้อมกันตอนรวมงาน

## API ที่ Frontend ใช้ในรอบนี้

### 1) Google Login / Register
`POST /api/auth/google`

Request:
```json
{
  "googleToken": "<Google ID Token>"
}
```

Response ที่ Frontend คาดหวัง:
```json
{
  "status": "success",
  "message": "เข้าสู่ระบบสำเร็จ",
  "data": {
    "accessToken": "<JWT>",
    "refreshToken": "<JWT>",
    "user": {
      "userId": 1,
      "email": "student_name@mail.rmutk.ac.th",
      "name": "สมชาย ใจดี",
      "profilePicture": "https://...",
      "role": "USER"
    }
  }
}
```

### 2) Current User
`GET /api/auth/me`

Header:
`Authorization: Bearer <accessToken>`

Frontend ใช้เส้นนี้ตอน reload หน้าเว็บเพื่อตรวจ session และเอาข้อมูล user กลับมา

### 3) Refresh Token
`POST /api/auth/refresh`

Request:
```json
{
  "refreshToken": "<refreshToken>"
}
```

Response:
```json
{
  "status": "success",
  "message": "ต่ออายุ Token สำเร็จ",
  "data": {
    "accessToken": "<new JWT>"
  }
}
```

Axios interceptor จะ retry request เดิม 1 ครั้งหลัง refresh สำเร็จ

### 4) Logout
`POST /api/auth/logout`

Header:
`Authorization: Bearer <accessToken>`

Request:
```json
{
  "refreshToken": "<refreshToken>"
}
```

หลัง request เสร็จ Frontend จะลบ Access/Refresh Token ฝั่งตัวเองเสมอ

## Integration Day ต้องเช็ก

- Backend URL ถูกตั้งใน `VITE_API_BASE_URL`
- CORS อนุญาต domain ของ Frontend
- Google OAuth Web Client ID ถูกตั้งใน `VITE_GOOGLE_CLIENT_ID`
- Backend รับ Google **ID Token** ใน field `googleToken`
- Response shape ของทั้ง 4 endpoint ตรงตามด้านบน
- `role` ตกลงชื่อ ENUM ให้ตรงกัน เช่น USER / SHOP / ADMIN
- ทดสอบ Access Token หมดอายุแล้ว refresh ได้
- ทดสอบ Refresh Token หมดอายุแล้วกลับหน้า Login ได้
- ทดสอบ Logout แล้วเข้า `/app` ไม่ได้
