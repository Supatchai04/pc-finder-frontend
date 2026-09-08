# API Mapping — Frontend target (06/09/2026)

Endpoint constants are centralized in `src/api/endpoints.js`.

## Auth
- POST `/api/auth/google`
- POST `/api/auth/logout`
- GET `/api/auth/me`
- POST `/api/auth/refresh`

## Public
- GET `/api/hardware/:category`
- GET `/api/hardware/:category/autocomplete`
- GET `/api/hardware/:category/:id`
- POST `/api/hardware/match-stores`
- GET `/api/stores/:shopId/profile`
- GET `/api/stores/:shopId/products`
- POST `/api/builds/summary`

## User
- GET/POST `/api/users/favorites/products`
- DELETE `/api/users/favorites/products/:shopProductId`
- GET/POST `/api/users/favorites/stores`
- DELETE `/api/users/favorites/stores/:shopId`
- GET/POST `/api/users/specs`
- GET/DELETE `/api/users/specs/:specId`
- POST `/api/users/specs/:specId/items`
- DELETE `/api/users/specs/:specId/items/:shopProductId`
- POST `/api/users/shopRegister`

## Shop owner
- GET `/api/stores/dashboard`
- PUT `/api/stores/profile`
- GET/POST `/api/stores/products`
- PUT `/api/stores/products/:shopProductId`
- DELETE `/api/store/products/:shopProductId`

> Note: `API LIST (4)` uses singular `/api/store/...` for DELETE while PUT uses plural `/api/stores/...`. The frontend preserves this distinction instead of silently normalizing it.

## Admin
These routes intentionally follow the Backend chat update from 03/09/2026 and override the older paths still shown in some pages of the PDF.

- GET `/api/admin/dashboard`
- GET `/api/users/users`
- PUT `/api/users/users/:userId`
- GET `/api/stores/stores`
- GET `/api/stores/stores/:shopId`
- PUT `/api/stores/stores/:shopId/status`

## Waiting for Backend confirmation / data source
- Brand -> Series -> Model dependent dropdown endpoints.
- Province -> District -> Subdistrict option endpoints/data source.
- Embedded Google Maps key/config (current UI safely links to Google Maps coordinates instead).
