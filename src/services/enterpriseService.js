import axios from 'axios';
import { normalizeMongoId } from '../utils/enterpriseSession';

/** Set REACT_APP_API_BASEURL in .env (API origin only; do not include /labourapp). */
const appUrl = String(process.env.REACT_APP_API_BASEURL || '').replace(/\/$/, '');
const baseurl = `${appUrl}/labourapp`;

const unwrapResponseDTO = (data) => {
  if (data && typeof data === 'object' && data.hasError === true) {
    throw data;
  }
  return data;
};

const normalizeAxiosError = (error) => error?.response?.data ?? error;

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** .xlsx is a ZIP container; local file header starts with "PK" (0x50 0x4B). */
const isXlsxZipSignature = (u8) =>
  u8 && u8.length >= 2 && u8[0] === 0x50 && u8[1] === 0x4b;

const stripBase64Wrapper = (s) =>
  String(s || '')
    .replace(/\s/g, '')
    .replace(/^data:[^;]+;base64,/i, '');

/**
 * Decode standard base64 (ASCII alphabet only) to bytes for Blob.
 * Avoid passing UTF-8–misinterpreted binary strings into atob (Latin1 range error).
 */
const decodeBase64ToUint8Array = (b64Input) => {
  const b64 = stripBase64Wrapper(b64Input);
  if (!b64) {
    throw {
      returnValue: null,
      hasError: true,
      message: 'Template download returned empty base64 data.'
    };
  }
  try {
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  } catch {
    throw {
      returnValue: null,
      hasError: true,
      message:
        'Could not decode the template file. Ask the API to return raw .xlsx bytes or JSON with ASCII base64 in returnValue.'
    };
  }
};

const stripEmptyRegistrationFields = (payload) => {
  const next = { ...(payload || {}) };

  // GST is optional during registration; backend validates if present.
  if (typeof next.gstNumber !== 'undefined') {
    const gst = String(next.gstNumber ?? '').trim();
    if (!gst) {
      delete next.gstNumber;
    } else {
      next.gstNumber = gst;
    }
  }

  return next;
};

const requireEnterpriseId = (enterpriseIdLike) => {
  const normalizedId = normalizeMongoId(enterpriseIdLike);
  const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!normalizedId || !mongoIdPattern.test(String(normalizedId))) {
    throw {
      returnValue: null,
      hasError: true,
      message: 'Enterprise ID is missing or invalid'
    };
  }
  return String(normalizedId);
};

const buildOptionalAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  let auth =
    (typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem('token') || localStorage.getItem('authToken')
      : '') || '';
  if (!auth && typeof window !== 'undefined' && window.localStorage) {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.token) auth = u.token;
    } catch (_) {
      /* ignore */
    }
  }
  if (auth) {
    headers.Authorization = `Bearer ${auth}`;
  }
  return headers;
};

export const enterpriseService = {
  registerEnterprise: async (enterpriseData, otp) => {
    try {
      const endpoint = `${baseurl}/enterprise/registerEnterprise?otp=${otp}`;
      const payload = stripEmptyRegistrationFields(enterpriseData);
      const response = await axios.post(endpoint, payload);
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  // Update one or many enterprise fields (backend accepts partial payload)
  updateEnterpriseFields: async (enterpriseId, partialPayload, token) => {
    try {
      const normalizedId = requireEnterpriseId(enterpriseId);
      const endpoint = `${baseurl}/enterprise/updateEnterpriseField/${normalizedId}`;
      const response = await axios.patch(
        endpoint,
        partialPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  // Backwards-compatible helper that updates a single field using the same endpoint
  updateEnterpriseField: async (enterpriseId, field, value, token) => {
    return await (async () => {
      const payload = { [field]: value };
      return await enterpriseService.updateEnterpriseFields(enterpriseId, payload, token);
    })();
  },

  updateEnterpriseDetails: async (enterpriseId, detailsData, token) => {
    try {
      const normalizedId = requireEnterpriseId(enterpriseId);
      const endpoint = `${baseurl}/enterprise/updateDetails/${normalizedId}`;
      const response = await axios.put(endpoint, detailsData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  completeRegistration: async (completeData, otp) => {
    try {
      const endpoint = `${baseurl}/enterprise/completeRegistration?otp=${otp}`;
      const payload = stripEmptyRegistrationFields(completeData);
      const response = await axios.post(endpoint, payload);
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  loginEnterprise: async (mobileNumber, otp) => {
    try {
      const endpoint = `${baseurl}/enterprise/enterpriseLogin?mobileNumber=${mobileNumber}&otp=${otp}`;
      const response = await axios.get(endpoint);
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  requestOTP: async (mobile, role = 'ENTERPRISE') => {
    try {
      const endpoint = `${baseurl}/auth/requestOTP`;
      const response = await axios.post(endpoint, { mobile, role });
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  findEnterpriseById: async (enterpriseId, token) => {
    try {
      const normalizedId = requireEnterpriseId(enterpriseId);
      const endpoint = `${baseurl}/enterprise/findEnterpriseById/${normalizedId}`;
      const headers = buildOptionalAuthHeaders();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.get(endpoint, { headers });
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  /**
   * Public enterprise reviews (mirrors labour showMyReviews path).
   * Returns [] if the endpoint is missing or errors — adjust URL if your API differs.
   */
  /**
   * Onboard a labour / staff member under the enterprise (owner dashboard).
   * POST body matches backend enterprise labour onboarding DTO.
   */
  enterpriseLabourOnboarding: async (payload, token) => {
    try {
      const endpoint = `${baseurl}/enterprise/enterpriseLabourOnboarding`;
      if (!token || String(token).trim() === '') {
        throw {
          returnValue: null,
          hasError: true,
          message: 'Authentication required. Please log in again.'
        };
      }
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  /**
   * All enterprise-registered labours (owner dashboard).
   * Backend maps GET .../findLabourByEnterpriseID/{enterpriseId}.
   */
  findLabourByEnterpriseId: async (enterpriseId, token) => {
    try {
      const normalizedId = requireEnterpriseId(enterpriseId);
      if (!token || String(token).trim() === '') {
        throw {
          returnValue: null,
          hasError: true,
          message: 'Authentication required. Please log in again.'
        };
      }
      const endpoint = `${baseurl}/enterprise/findLabourByEnterpriseID/${normalizedId}`;
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  getEnterpriseReviews: async (
    enterpriseId,
    sortBy = 'reviewTime',
    sortOrder = 'desc'
  ) => {
    try {
      const normalizedId = requireEnterpriseId(enterpriseId);
      const endpoint = `${baseurl}/enterprise/showMyReviews/${normalizedId}?sortBy=${encodeURIComponent(
        sortBy
      )}&sortOrder=${encodeURIComponent(sortOrder)}`;
      const response = await axios.get(endpoint, {
        headers: buildOptionalAuthHeaders()
      });
      if (response.data?.hasError) {
        return [];
      }
      const rv = response.data?.returnValue;
      return Array.isArray(rv) ? rv : [];
    } catch (error) {
      console.warn('Enterprise reviews API:', error?.message || error);
      return [];
    }
  },

  /**
   * Excel template for bulk labour onboarding.
   * Supports: raw .xlsx bytes (arraybuffer), JSON { returnValue: base64 }, or plain base64 text.
   * Uses arraybuffer first so binary xlsx is never mis-decoded as UTF-16/UTF-8 (which breaks atob).
   */
  downloadEnterpriseLabourBulkUploadTemplate: async (token) => {
    try {
      const endpoint = `${baseurl}/enterprise/enterpriseLabourBulkUploadTemplate`;
      const headers = {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, application/json, text/plain;q=0.9, */*;q=0.8'
      };
      if (token && String(token).trim()) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(endpoint, {
        headers,
        responseType: 'arraybuffer'
      });

      const buffer = response.data;
      if (!buffer || buffer.byteLength === 0) {
        throw {
          returnValue: null,
          hasError: true,
          message: 'Template download returned an empty file.'
        };
      }

      const u8 = new Uint8Array(buffer);

      if (isXlsxZipSignature(u8)) {
        return new Blob([buffer], { type: XLSX_MIME });
      }

      const text = new TextDecoder('utf-8', { fatal: false }).decode(u8);
      const trimmed = text.replace(/^\uFEFF/, '').trim();

      if (trimmed.startsWith('{')) {
        let parsed;
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          throw {
            returnValue: null,
            hasError: true,
            message: 'Template response looked like JSON but could not be parsed.'
          };
        }
        unwrapResponseDTO(parsed);
        const payload = parsed.returnValue ?? parsed.data;
        if (typeof payload !== 'string' || !stripBase64Wrapper(payload)) {
          throw {
            returnValue: null,
            hasError: true,
            message: 'Template download returned no file data in returnValue.'
          };
        }
        const bytes = decodeBase64ToUint8Array(payload);
        if (!isXlsxZipSignature(bytes)) {
          throw {
            returnValue: null,
            hasError: true,
            message: 'Decoded template is not a valid Excel (.xlsx) file.'
          };
        }
        return new Blob([bytes], { type: XLSX_MIME });
      }

      if (trimmed.length > 0) {
        const bytes = decodeBase64ToUint8Array(trimmed);
        if (!isXlsxZipSignature(bytes)) {
          throw {
            returnValue: null,
            hasError: true,
            message: 'Decoded template is not a valid Excel (.xlsx) file.'
          };
        }
        return new Blob([bytes], { type: XLSX_MIME });
      }

      throw {
        returnValue: null,
        hasError: true,
        message: 'Template download returned no file data.'
      };
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  /**
   * Bulk upload enterprise labours from an Excel file (multipart field name: file).
   */
  bulkUploadEnterpriseLabour: async (enterpriseId, file, token) => {
    try {
      const normalizedId = requireEnterpriseId(enterpriseId);
      if (!token || String(token).trim() === '') {
        throw {
          returnValue: null,
          hasError: true,
          message: 'Authentication required. Please log in again.'
        };
      }
      const endpoint = `${baseurl}/enterprise/bulkUploadEnterpriseLabour/${normalizedId}`;
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  }
};


