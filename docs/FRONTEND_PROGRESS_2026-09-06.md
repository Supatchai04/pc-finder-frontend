# PC FINDER Frontend Progress — 2026-09-06

## Current deployment targets
- Frontend: `https://pc-finder-frontend-2.vercel.app`
- Backend: `https://hardware-store-search-backend.onrender.com`
- SPA deep-link fix: root-level `vercel.json` rewrites routes such as `/login`, `/stores/1`, `/admin/users` to `index.html` for React Router.

## Foundation / reliability
- Axios client points to `VITE_API_BASE_URL` and attaches Bearer Access Token automatically.
- 401 interceptor uses `/api/auth/refresh`, deduplicates concurrent refresh calls, retries the original request and clears auth on refresh failure.
- FormData requests no longer force JSON Content-Type; browser/Axios can generate the multipart boundary correctly.
- Google OAuth + backend JWT login, `/api/auth/me`, logout, ProtectedRoute and RoleRoute.
- ErrorBoundary added to prevent a single render exception from leaving a blank screen.
- Vercel SPA routing included.
- Hardware selection and summary product IDs persist in `sessionStorage`, so refreshing `/compare` or `/summary` no longer immediately loses the current selection.
- Pagination component now supports pages above page 5 with a sliding page window.

## Public / Customer UX
- Added a real Home page at `/`; hardware selection moved to `/hardware`.
- Customer sidebar follows the UX direction: Home, Hardware, Favorite Stores, Favorite Products, Saved Specs and Shop Registration.
- Public header now has active navigation states.
- Hardware category list, server search, server autocomplete, page navigation and current-page Brand filter.
- Series dropdown intentionally stays disabled until Backend provides a source/API.
- Selected build strip shows what has already been chosen and can clear the build.
- Store matching uses actual selected hardware and optional browser geolocation.
- Matching result now separates **Store profile**, **Store products**, and **Summary** actions instead of sending “ดูหน้าร้านค้า” directly to product list.
- Store profile page loads current favorite-store state for USER accounts and handles duplicate favorite responses.
- Store product page loads current favorite-product state; category is server-filtered while text search is explicitly current-page filtering because the public store-products API contract does not document a `search` query.
- Favorite Store / Favorite Product pages use updated fields: `shopName`, `profileImageUrl`, `province`, `district`, `addDate`.
- Saved spec folders: list, create, detail, delete folder and remove item.
- Build summary can be printed/saved as PDF and survives browser refresh within the session.

## Shop owner
- Shop Dashboard from real API.
- Product list/search/category/pagination.
- Add product using Hardware autocomplete or new Master Data fields.
- Edit product.
- Delete product follows the singular `/api/store/products/:shopProductId` path documented in API LIST (4).
- Shop registration uses FormData and verification file inputs.
- Shop profile update tracks dirty fields and sends **only fields the owner actually changed**, avoiding accidental blank values overwriting existing DB data.

## Admin
Using the Backend-update paths (not the older Admin paths in the PDF):
- `GET /api/users/users`
- `PUT /api/users/users/:userId`
- `GET /api/stores/stores`
- `GET /api/stores/stores/:shopId`
- `PUT /api/stores/stores/:shopId/status`

Implemented:
- Admin Dashboard.
- User search/filter/pagination and ACTIVE/SUSPENDED update.
- Store search/filter/pagination.
- Store detail, verification documents, `approveBy` and store status update.

## Intentionally pending (does not block other pages)
- Brand -> Series -> Model DB dropdown source.
- Province -> District -> Subdistrict DB dropdown source.
- Embedded Google Maps (until key/config is supplied).

## Local verification
1. `.env`
   - `VITE_API_BASE_URL=https://hardware-store-search-backend.onrender.com`
   - `VITE_USE_MOCK_AUTH=false`
   - `VITE_GOOGLE_CLIENT_ID=<Google Web Client ID>`
2. Run `npm install` if dependencies are not installed.
3. Run `npm run build` — must finish with `built in ...` and no error.
4. Run `npm run dev` for browser testing.
5. Smoke-test Guest -> USER -> SHOP -> ADMIN flows with real accounts/tokens.

## Multi-select hardware comparison update
- Hardware Finder now allows selecting multiple products in the same category with no frontend-imposed limit.
- Selection is stored as arrays per category and old single-item sessionStorage data is normalized automatically.
- Sidebar badges show the number of selected products in each category.
- Matching request groups selected products by category and sends `masterId` as an array when more than one product from the same category is selected, matching the current API contract.
- Compare page counts selected pieces instead of assuming one item per category.
