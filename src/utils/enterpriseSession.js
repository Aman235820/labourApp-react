export const normalizeMongoId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value.$oid === 'string') return value.$oid;
    if (typeof value.oid === 'string') return value.oid;

    // Common places where id can be nested
    if (typeof value._id === 'string') return value._id;
    if (value._id && typeof value._id === 'object') return normalizeMongoId(value._id);
    if (typeof value.id === 'string') return value.id;

    // BSON/ObjectId-like objects (defensive)
    if (typeof value.toHexString === 'function') {
      const hex = value.toHexString();
      if (typeof hex === 'string') return hex;
    }
    if (typeof value.toString === 'function') {
      const s = value.toString();
      // Handle forms like: ObjectId("...") or just the hex string
      const m = String(s).match(/([0-9a-fA-F]{24})/);
      if (m?.[1]) return m[1];
    }
  }
  return '';
};

const MONGO_ID_24 = /^[0-9a-fA-F]{24}$/;

const SCAVENGE_KEY_PRIORITY = [
  'enterpriseId',
  'id',
  '_id',
  'mongoId',
  'objectId',
];

/**
 * When `_id` is only `{ timestamp, date }` (Jackson/BSON JSON), there is no hex in that
 * object. Walk the session tree for any 24-char hex string (e.g. nested `returnValue.id`).
 */
function scavengeMongoId24(root) {
  if (!root || typeof root !== 'object') return '';
  const seen = new WeakSet();

  function walk(node, depth) {
    if (depth > 10 || node == null) return '';
    if (typeof node === 'string' && MONGO_ID_24.test(node)) return node;
    if (typeof node !== 'object') return '';
    if (seen.has(node)) return '';
    seen.add(node);

    if (Array.isArray(node)) {
      for (const item of node) {
        const found = walk(item, depth + 1);
        if (found) return found;
      }
      return '';
    }

    const keys = Object.keys(node);
    const ordered = [
      ...SCAVENGE_KEY_PRIORITY.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !SCAVENGE_KEY_PRIORITY.includes(k)),
    ];

    for (const k of ordered) {
      const v = node[k];
      if (typeof v === 'string' && MONGO_ID_24.test(v)) return v;
    }
    for (const k of ordered) {
      const v = node[k];
      if (v && typeof v === 'object') {
        const found = walk(v, depth + 1);
        if (found) return found;
      }
    }
    return '';
  }

  return walk(root, 0);
}

/**
 * Picks the first valid 24-char hex id. Prefer explicit `id` / `enterpriseId` over `_id`
 * so a BSON-shaped `_id` object does not block the string `id` from login/returnValue.
 */
export function resolveEnterpriseMongoId(enterpriseLike) {
  if (!enterpriseLike || typeof enterpriseLike !== 'object') return '';
  const candidates = [
    enterpriseLike.enterpriseId,
    enterpriseLike.id,
    enterpriseLike?.returnValue?.enterpriseId,
    enterpriseLike?.returnValue?.id,
    enterpriseLike._id,
    enterpriseLike?.returnValue?._id,
  ];
  for (const raw of candidates) {
    const n = normalizeMongoId(raw);
    if (n && MONGO_ID_24.test(String(n))) {
      return String(n);
    }
  }
  const scavenged = scavengeMongoId24(enterpriseLike);
  return scavenged ? String(scavenged) : '';
}

export const withEnterpriseId = (enterpriseLike) => {
  if (!enterpriseLike || typeof enterpriseLike !== 'object') return enterpriseLike;

  const id = resolveEnterpriseMongoId(enterpriseLike);
  if (!id) return enterpriseLike;
  if (String(enterpriseLike.enterpriseId || '') === id) return enterpriseLike;

  return {
    ...enterpriseLike,
    enterpriseId: id,
  };
};

/**
 * Reads the logged-in enterprise session from localStorage (`enterprise` key).
 * Normalizes `enterpriseId` and `token` for API calls when React state is stale or missing.
 */
export function getStoredEnterpriseSession() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { enterpriseId: '', token: '', enterprise: null };
  }
  try {
    const raw = localStorage.getItem('enterprise');
    if (!raw) {
      return { enterpriseId: '', token: '', enterprise: null };
    }
    const parsed = JSON.parse(raw);
    const merged = withEnterpriseId(parsed);
    const enterpriseId = resolveEnterpriseMongoId(merged) || String(merged?.enterpriseId || '').trim();
    const idOk = MONGO_ID_24.test(enterpriseId) ? enterpriseId : '';
    const token = String(
      merged?.token ||
        merged?.returnValue?.token ||
        merged?.accessToken ||
        ''
    ).trim();
    return { enterpriseId: idOk, token, enterprise: merged };
  } catch {
    return { enterpriseId: '', token: '', enterprise: null };
  }
}
