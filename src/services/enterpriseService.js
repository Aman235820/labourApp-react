import axios from 'axios';
import { normalizeMongoId } from '../utils/enterpriseSession';

const fallbackBaseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://labourapp.onrender.com';
const appUrl = process.env.REACT_APP_API_BASEURL || fallbackBaseUrl;
const baseurl = `${appUrl}/labourapp`;

const unwrapResponseDTO = (data) => {
  if (data && typeof data === 'object' && data.hasError === true) {
    throw data;
  }
  return data;
};

const normalizeAxiosError = (error) => error?.response?.data ?? error;

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
   * Excel template for bulk labour onboarding (response may be JSON with base64 returnValue or raw base64 text).
   * Returns a Blob suitable for saving as .xlsx.
   */
  downloadEnterpriseLabourBulkUploadTemplate: async (token) => {
    try {
      const endpoint = `${baseurl}/enterprise/enterpriseLabourBulkUploadTemplate`;
      const headers = {};
      if (token && String(token).trim()) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await axios.get(endpoint, { headers });
      const raw = response.data;
      let payload;

      if (typeof raw === 'string') {
        const t = raw.trim();
        if (t.startsWith('{')) {
          try {
            const parsed = JSON.parse(t);
            unwrapResponseDTO(parsed);
            payload = parsed.returnValue ?? parsed.data;
          } catch {
            payload = raw;
          }
        } else {
          payload = raw;
        }
      } else if (raw && typeof raw === 'object') {
        unwrapResponseDTO(raw);
        payload = raw.returnValue ?? raw.data;
      }

      if (typeof payload !== 'string' || !payload.trim()) {
        throw {
          returnValue: null,
          hasError: true,
          message: 'Template download returned no file data.'
        };
      }

      const b64 = payload.replace(/\s/g, '').replace(/^data:[^;]+;base64,/i, '');
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
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


