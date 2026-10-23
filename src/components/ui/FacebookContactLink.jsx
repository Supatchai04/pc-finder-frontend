/**
 * facebookLink is optional and is independent of the Facebook display name.
 * Accept a Facebook URL with or without a scheme; never open other protocols
 * or non-Facebook domains from shop-provided text.
 */
// Some API responses contain a JSON string instead of a contact object.
export const getContactChannels = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const decoded = JSON.parse(value);
      if (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) return decoded;
    } catch {
      // A plain-text contact note is not a structured contact object.
    }
  }
  return {};
};

export const getFacebookHref = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw || raw.startsWith('//')) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username || url.password ||
      !(
        hostname === 'facebook.com' || hostname.endsWith('.facebook.com') ||
        hostname === 'fb.com' || hostname.endsWith('.fb.com') ||
        hostname === 'fb.me' || hostname === 'fb.watch'
      )
    ) return null;
    // Prefer HTTPS even when an old link was saved as HTTP.
    url.protocol = 'https:';
    return url.href;
  } catch {
    return null;
  }
};

export default function FacebookContactLink({ name, url }) {
  const href = getFacebookHref(url);
  const label = String(name ?? '').trim() || (href ? 'เปิด Facebook' : '-');
  if (!href) return label;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="เปิดหน้า Facebook ของร้านค้า"
      style={{ color: '#0d6efd', textDecoration: 'underline', textUnderlineOffset: '2px', overflowWrap: 'anywhere' }}
    >
      {label}
    </a>
  );
}
