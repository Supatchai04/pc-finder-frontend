export const ROLES = {
  GUEST: 'CUSTOMER',
  USER: 'USER',
  SHOP: 'SHOP',
  ADMIN: 'ADMIN',
};

export function normalizeRole(role) {
  const value = String(role || '').trim().toUpperCase();
  if (['SHOP', 'STORE', 'STORE_OWNER'].includes(value)) return ROLES.SHOP;
  if (['ADMIN', 'ADMINISTRATOR'].includes(value)) return ROLES.ADMIN;
  if (['USER', 'CUSTOMER'].includes(value)) return ROLES.USER;
  return ROLES.USER;
}
