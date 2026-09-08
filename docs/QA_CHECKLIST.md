# PC FINDER Frontend — QA Checklist

Use this before pushing to `main` / deploying Vercel.

## Build & routing
- [ ] `npm run build` passes.
- [ ] `/` opens Home.
- [ ] Directly opening `/login` does not return Vercel 404.
- [ ] Directly opening `/hardware`, `/stores/:id`, `/favorites`, `/shop`, `/admin` loads React first and lets guards handle access.

## Authentication
- [ ] Google login completes.
- [ ] Network shows `POST /api/auth/google` and Backend returns JWT data.
- [ ] Refreshing the browser keeps the signed-in session via `/api/auth/me` / refresh flow.
- [ ] Logout clears local tokens.
- [ ] USER cannot enter SHOP/ADMIN routes; SHOP and ADMIN guards work.

## Public / Customer
- [ ] Hardware category changes load correct API data.
- [ ] Search and autocomplete work.
- [ ] Selecting hardware survives navigating/refreshing `/compare` in the same browser session.
- [ ] Match results open Store Profile and Store Products separately.
- [ ] Summary shows selected shop products and prints cleanly.
- [ ] Favorite store/product add, duplicate behavior and remove work.
- [ ] Favorite list pagination and product category filter work.
- [ ] Specs list/create/detail/remove item/delete folder work.

## Shop
- [ ] Dashboard loads.
- [ ] Product list/filter/search/pagination loads.
- [ ] Add existing Master Data product works.
- [ ] Add new Master Data product works for all 6 categories.
- [ ] Edit price/status/details works.
- [ ] Delete uses the Backend path expected by production.
- [ ] Shop registration uploads required files.
- [ ] Profile edit changes only edited fields and does not blank existing DB values.

## Admin
- [ ] Dashboard loads for ADMIN only.
- [ ] `/api/users/users` list/search/filter works.
- [ ] User ACTIVE/SUSPENDED update works.
- [ ] `/api/stores/stores` list/search/status filter works.
- [ ] Store detail shows verification documents and `approveBy` when returned.
- [ ] Store PENDING/OPEN/CLOSED/REJECTED/SUSPENDED update works.

## Pending Backend inputs
- [ ] Brand -> Series -> Model dropdown API/data source.
- [ ] Province -> District -> Subdistrict dropdown API/data source.
- [ ] Google Maps embed key/config if embedded map is required.
