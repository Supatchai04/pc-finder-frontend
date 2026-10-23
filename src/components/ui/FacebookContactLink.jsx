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

/**
 * Different store endpoints may put contact details at the response root,
 * inside `shop`, or as JSON text. Merge the fields instead of taking the
 * first truthy contact object, because it can have an incomplete facebookLink.
 * `sources` are passed from most to least authoritative.
 */
export const mergeContactChannels = (...sources) => {
  const entries = sources
    .filter((value) => value != null)
    .map((value) => {
      const object = getContactChannels(value);
      const nested = getContactChannels(object.contactChannels ?? object.contact);
      return { ...object, ...nested };
    });

  // Keep ordinary fields from the highest-priority source that supplied them.
  const merged = {};
  for (const entry of [...entries].reverse()) {
    Object.assign(merged, entry);
  }

  // A bare facebook.com homepage must not override a full page/profile URL
  // returned in another part of the SAME API result.
  const validLinks = entries
    .map((entry) => entry.facebookLink ?? entry.facebook_link)
    .map(getFacebookHref)
    .filter(Boolean);
  const fullLink = validLinks.find((href) => {
    const parsed = new URL(href);
    return parsed.pathname !== '/' || Boolean(parsed.search || parsed.hash);
  });
  merged.facebookLink = fullLink ?? validLinks[0] ?? '';
  return merged;
};

// The Facebook page name is displayed separately by the store details page.
// This component only renders the Facebook URL supplied in facebookLink.
export default function FacebookContactLink({ url }) {
  const href = getFacebookHref(url);
  if (!href) return '-';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="เปิดลิงก์ Facebook ของร้านค้า"
      style={{ color: '#0d6efd', textDecoration: 'underline', textUnderlineOffset: '2px', overflowWrap: 'anywhere' }}
    >
      {href}
    </a>
  );
}
