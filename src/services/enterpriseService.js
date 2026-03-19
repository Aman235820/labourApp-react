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
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return unwrapResponseDTO(response.data);
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  }
};


