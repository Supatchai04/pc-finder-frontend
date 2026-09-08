const SELECTED_KEY = 'pcfinder_selected_hardware';
const SUMMARY_KEY = 'pcfinder_summary_product_ids';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

// Selection format used by the current frontend:
// {
//   CPU: [item, item, ...],
//   RAM: [item, ...],
//   ...
// }
//
// Older builds stored only one object per category. Normalize that old shape
// here so existing sessionStorage does not break after the multi-select update.
export const normalizeSelectedHardware = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .map(([category, items]) => {
        if (Array.isArray(items)) return [category, items.filter(Boolean)];
        if (items) return [category, [items]];
        return [category, []];
      })
      .filter(([, items]) => items.length > 0),
  );
};

export const buildStorage = {
  getSelected: () => normalizeSelectedHardware(safeParse(sessionStorage.getItem(SELECTED_KEY), {})),
  setSelected: (selected) => sessionStorage.setItem(SELECTED_KEY, JSON.stringify(normalizeSelectedHardware(selected))),
  clearSelected: () => sessionStorage.removeItem(SELECTED_KEY),
  getSummaryProductIds: () => safeParse(sessionStorage.getItem(SUMMARY_KEY), []),
  setSummaryProductIds: (ids) => sessionStorage.setItem(SUMMARY_KEY, JSON.stringify(Array.isArray(ids) ? ids : [])),
  clearSummaryProductIds: () => sessionStorage.removeItem(SUMMARY_KEY),
};
