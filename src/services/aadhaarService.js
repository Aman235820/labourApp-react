import axios from 'axios';

const appUrl = process.env.REACT_APP_API_BASEURL;
const baseurl = `${appUrl}/labourapp`;

/**
 * Uploads an Aadhaar image to the backend and gets the encoded QR text.
 * @param {File} imageFile - The Aadhaar image file to upload.
 * @returns {Promise<string>} - Resolves to the encoded QR text.
 */
export async function getAadhaarQrText(imageFile) {
  const formData = new FormData();
  formData.append('qrImage', imageFile);

  const endpoint = `${baseurl}/aadhaar/verifyAadhaar`;
  const response = await axios.post(endpoint, formData, {
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