# PC FINDER Frontend

React + Vite frontend for PC FINDER, connected to the current Backend API contract.

## Run locally

```bash
npm install
npm run dev
```

For a production-style compile check:

```bash
npm run build
```

## Environment

Create `.env` from `.env.example`.

```env
VITE_API_BASE_URL=https://hardware-store-search-backend.onrender.com
VITE_USE_MOCK_AUTH=false
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com
```

Current Backend:
`https://hardware-store-search-backend.onrender.com`

## Main routes

### Public / Customer
- `/` — Home
- `/login` — Google Login
- `/hardware` — Hardware Finder
- `/hardware/:category/:id` — Hardware Detail
- `/compare` — Store Matching
- `/stores/:shopId` — Store Profile
- `/stores/:shopId/products` — Store Products
- `/summary` — Build Summary / Print
- `/favorites` — Favorite Stores / Products (USER)
- `/specs` — Saved Specs (USER)
- `/shop/register` — Shop Registration (USER)

### Shop Owner
- `/shop`
- `/shop/products`
- `/shop/profile`

### Admin
- `/admin`
- `/admin/users`
- `/admin/stores`
- `/admin/stores/:shopId`

## Vercel

`vercel.json` contains the SPA rewrite needed for direct React Router URLs such as `/login`, `/hardware/VGA/1`, `/admin/users`, and `/shop/products`.

## Project notes
- API mapping: `docs/API_MAPPING.md`
- Frontend progress: `docs/FRONTEND_PROGRESS_2026-09-06.md`
- Manual QA checklist: `docs/QA_CHECKLIST.md`
