# Frontend Blueprint

## Design language

ใช้แนวเดียวกับ UX/UI reference:
- พื้นหลังขาว/เทาอ่อน
- Primary blue สำหรับ navigation, selection, primary action
- Orange ใช้เป็น action ฝั่งค้นหาร้าน/ดูร้านตามหน้าลูกค้า
- Card/Table ขอบบาง เงาน้อย และ whitespace เยอะ
- Status ใช้ pill: เขียว = active/open, เหลือง = pending/low stock, แดง = rejected/suspended/out
- Sidebar dashboard คงรูปแบบเดียวกันทั้ง Shop/Admin
- Responsive: desktop ใช้ sidebar, mobile เปลี่ยนเป็น horizontal menu

## Roles

- Guest/Customer: ไม่มี token และใช้ Public API
- USER: ลูกค้าที่ login แล้ว ใช้ favorites/specs และสมัครเปิดร้าน
- SHOP: dashboard + inventory + profile/location/staff
- ADMIN: dashboard + users + stores

ชื่อ role ที่ Backend อาจส่งต่างรูป (`CUSTOMER`, `USER`, `shop`, `admin`) ถูก normalize ที่ `src/auth/roles.js` เพื่อลดการ hard-code ในหน้า UI

## Development pattern

แต่ละ feature ควรเดินพร้อมกัน:

UI component → state → service → mock response → loading/error → API จริง

หน้า UI ไม่ควร import axios โดยตรง ให้เรียกผ่าน `src/services/*Service.js` เท่านั้น เพื่อสลับ Mock/Backend ได้ง่าย

## Reusable components

- `DashboardShell`, `PublicShell`
- `PageHeader`, `StatCard`, `StatusBadge`, `PaginationBar`, `SectionCard`
- `HardwareSidebar`
- `ProductFormModal` ที่เปลี่ยน field ตาม category
- `SimpleCharts` สำหรับ mock dashboard; เปลี่ยนเป็น chart library จริงภายหลังได้โดยไม่กระทบ page layout
