/**
 * Mixed results from POST /labourReq/findByCategory — enterprises and individual labour.
 */

import { normalizeMongoId } from './enterpriseSession';

export function getSearchResultKind(item) {
  if (!item || typeof item !== 'object') return 'labour';
  if (item.labourId != null && String(item.labourId).trim() !== '') return 'labour';
  const cls = item._class != null ? String(item._class) : '';
  if (cls.includes('Enterprise')) return 'enterprise';
  if (item.companyName != null && item.servicesOffered != null && typeof item.servicesOffered === 'object') {
    return 'enterprise';
  }
  return 'labour';
}

export function searchResultItemKey(item, index) {
  const kind = getSearchResultKind(item);
  if (kind === 'enterprise') {
    const id = normalizeMongoId(item._id) || `e-${index}`;
    return `enterprise-${id}`;
  }
  const lid = item.labourId != null ? String(item.labourId) : `l-${index}`;
  return `labour-${lid}`;
}

/**
 * Short line(s) for enterprise cards; prefers subservices matching search hint (e.g. "geyser").
 */
export function summarizeEnterpriseServices(servicesOffered, searchHint = '') {
  if (!servicesOffered || typeof servicesOffered !== 'object') return '';
  const hint = String(searchHint || '').toLowerCase().trim();
  const lines = [];

  for (const [category, subs] of Object.entries(servicesOffered)) {
    if (!Array.isArray(subs)) continue;
    if (hint) {
      const matched = subs.filter((s) => String(s).toLowerCase().includes(hint));
      if (matched.length) {
        const shown = matched.slice(0, 4).join(', ');
        lines.push(`${category}: ${shown}${matched.length > 4 ? '…' : ''}`);
      }
    } else {
      const shown = subs.slice(0, 3).join(', ');
      lines.push(`${category}: ${shown}${subs.length > 3 ? '…' : ''}`);
    }
  }

  if (hint && lines.length === 0) {
    for (const [category, subs] of Object.entries(servicesOffered)) {
      if (!Array.isArray(subs)) continue;
      lines.push(`${category}: ${subs.slice(0, 2).join(', ')}${subs.length > 2 ? '…' : ''}`);
      if (lines.length >= 2) break;
    }
  }

  return lines.slice(0, 3).join(' · ');
}

export function getRowDisplayName(row) {
  if (getSearchResultKind(row) === 'enterprise') {
    return row.companyName || '—';
  }
  return row.labourName || '—';
}

export function getRowPhone(row) {
  if (getSearchResultKind(row) === 'enterprise') {
    return row.ownerContactInfo || '';
  }
  return row.labourMobileNo || '';
}

/**
 * Top-level service category for the row (matches search when possible).
 */
export function getRowMainServiceCategory(row, searchQuery) {
  if (getSearchResultKind(row) === 'labour') {
    return row.labourSkill || '—';
  }
  const q = String(searchQuery || '').trim().toLowerCase();
  const so = row.servicesOffered;
  if (!so || typeof so !== 'object') return '—';

  if (q.length >= 2) {
    for (const [cat, subs] of Object.entries(so)) {
      if (!Array.isArray(subs)) continue;
      if (subs.some((s) => String(s).toLowerCase().includes(q))) {
        return cat;
      }
    }
  }

  if (q) {
    for (const cat of Object.keys(so)) {
      const cl = cat.toLowerCase();
      if (cl.includes(q) || q.includes(cl)) {
        return cat;
      }
    }
  }

  const keys = Object.keys(so);
  return keys.length ? keys[0] : '—';
}
