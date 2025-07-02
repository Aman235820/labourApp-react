import api from './api';

/**
 * Uploads an Aadhaar image to the backend and gets the encoded QR text.
 * @param {File} imageFile - The Aadhaar image file to upload.
 * @returns {Promise<string>} - Resolves to the encoded QR text.
 */
export async function getAadhaarQrText(imageFile) {
  const formData = new FormData();
  formData.append('qrImage', imageFile);

  const response = await api.post('/aadhaar/verifyAadhaar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.data && !response.data.hasError && response.data.returnValue) {
    return response.data.returnValue;
  } else {
    throw new Error(response.data?.message || 'Failed to decode Aadhaar QR');
  }
} 