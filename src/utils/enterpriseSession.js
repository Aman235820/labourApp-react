/**
 * Enterprise session + generic Mongo id helpers.
 * Login/register should persist `enterpriseId` (and `id` from API) explicitly in localStorage.
 */

export const normalizeMongoId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value.$oid === 'string') return value.$oid;
    if (typeof value.oid === 'string') return value.oid;
    if (typeof value._id === 'string') return value._id;
    if (value._id && typeof value._id === 'object') return normalizeMongoId(value._id);
    if (typeof value.id === 'string') return value.id;
    if (typeof value.toHexString === 'function') {
      const hex = value.toHexString();
      if (typeof hex === 'string') return hex;
    }
    if (typeof value.toString === 'function') {
      const m = String(value.toString()).match(/([0-9a-fA-F]{24})/);
      if (m?.[1]) return m[1];
    }
  }
  return '';
};

const MONGO_ID_24 = /^[0-9a-fA-F]{24}$/;

/**
 * Resolves a 24-char hex enterprise id from session-like objects.
 * Order: enterpriseId → id → nested returnValue — then normalized _id shapes (legacy APIs).
 */
export function resolveEnterpriseMongoId(obj) {
  if (!obj || typeof obj !== 'object') return '';
  const raw = [
    obj.enterpriseId,
    obj.id,
    obj.returnValue?.enterpriseId,
    obj.returnValue?.id,
    obj._id,
    obj.returnValue?._id,
  ];
  for (const v of raw) {
    const s = (typeof v === 'string' ? v.trim() : normalizeMongoId(v)) || '';
    if (s && MONGO_ID_24.test(s)) return s;
  }
  return '';
}

/** Ensures `enterpriseId` is set when a valid id can be read from the object. */
export const withEnterpriseId = (session) => {
  if (!session || typeof session !== 'object') return session;
  const id = resolveEnterpriseMongoId(session);
  if (!id) return session;
  if (String(session.enterpriseId || '') === id) return session;
  return { ...session, enterpriseId: id };
};

/**
 * Merge API payload (e.g. findEnterpriseById returnValue) into the existing session without
 * losing id/enterpriseId — many endpoints return profile fields only and omit Mongo id.
 */
export function mergeEnterpriseSession(prev = {}, patch = {}, extras = {}) {
  const base = prev && typeof prev === 'object' ? { ...prev } : {};
  const p = patch && typeof patch === 'object' ? { ...patch } : {};
  const merged = { ...base, ...p, ...extras };
  const id =
    resolveEnterpriseMongoId(p) ||
    resolveEnterpriseMongoId(base) ||
    resolveEnterpriseMongoId(merged);
  if (id) {
    return withEnterpriseId({
      ...merged,
      enterpriseId: id,
      id: merged.id || id,
    });
  }
  return withEnterpriseId(merged);
}

/**
 * Reads `enterprise` from localStorage. Expects login to have saved `enterpriseId` from `returnValue.id`.
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
    const token = String(
      merged?.token || merged?.returnValue?.token || merged?.accessToken || ''
    ).trim();
    const enterpriseId = resolveEnterpriseMongoId(merged);
    const idOk = MONGO_ID_24.test(enterpriseId) ? enterpriseId : '';
    const enterprise = idOk ? { ...merged, enterpriseId: idOk } : merged;
    return { enterpriseId: idOk, token, enterprise };
  } catch {
    return { enterpriseId: '', token: '', enterprise: null };
  }
}

/**
 * `servicesOffered` shape: { "Electrician": ["AC Repair", ...], "Mechanic": [...] }
 * Reads from persisted enterprise session in localStorage.
 */
export function readEnterpriseServicesOfferedFromStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = localStorage.getItem('enterprise');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const so =
      parsed?.servicesOffered ||
      parsed?.returnValue?.servicesOffered ||
      {};
    return typeof so === 'object' && so !== null && !Array.isArray(so) ? so : {};
  } catch {
    return {};
  }
}

/** Unique sub-service labels, stable order (by category key then subs order). */
export function flattenSubServiceLabelsFromServicesOffered(servicesOffered) {
  const seen = new Set();
  const list = [];
  Object.entries(servicesOffered || {}).forEach(([, subs]) => {
    if (!Array.isArray(subs)) return;
    subs.forEach((s) => {
      const t = String(s || '').trim();
      if (t && !seen.has(t)) {
        seen.add(t);
        list.push(t);
      }
    });
  });
  return list;
}

/** Display line for labour primary skills from API (JSON string in VARCHAR, array, or primarySkill string). */
export function formatLabourPrimarySkillsDisplay(lab) {
  if (!lab || typeof lab !== 'object') return '—';
  const psField = lab.primarySkills;
  if (Array.isArray(psField) && psField.length) {
    return psField.filter(Boolean).join(', ');
  }
  if (typeof psField === 'string' && psField.trim()) {
    try {
      const parsed = JSON.parse(psField);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.filter(Boolean).join(', ');
      }
    } catch {
      return psField;
    }
    return psField;
  }
  const ps = lab.primarySkill;
  if (typeof ps === 'string' && ps.trim()) {
    try {
      const parsed = JSON.parse(ps);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.filter(Boolean).join(', ');
      }
    } catch {
      return ps;
    }
    return ps;
  }
  return '—';
}
