import React, { useState } from 'react';
import { QR } from '@xone-labs/aadharjs';
import { getAadhaarQrText } from '../services/aadhaarService';

function AadhaarQrDecoder() {
  const [kyc, setKyc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
    setKyc(null);
    setError(null);
  };

  const onUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file.');
      return;
    }
    setLoading(true);
    setError(null);
    setKyc(null);
    try {
      const qrText = await getAadhaarQrText(selectedFile);
      const result = QR.decode(qrText);
      setKyc(result);
    } catch (err) {
      setError(err.message || 'Failed to extract or decode Aadhaar QR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Aadhaar QR Scanner</h2>
      <input type="file" accept="image/*" onChange={onFileChange} />
      <br />
      <button onClick={onUpload} disabled={loading || !selectedFile}>Upload</button>
      {loading && <p>Processing image and decoding QR...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {kyc && (
        <div>
          {kyc.referenceId && <p><strong>Reference ID:</strong> {kyc.referenceId}</p>}
          {kyc.name && <p><strong>Name:</strong> {kyc.name}</p>}
          {kyc.dob && <p><strong>DOB:</strong> {kyc.dob}</p>}
          {kyc.gender && <p><strong>Gender:</strong> {kyc.gender}</p>}
          {kyc.mobileEmailLink && <p><strong>Mobile Email Link:</strong> {kyc.mobileEmailLink}</p>}
          {kyc.emailHash && <p><strong>Email Hash:</strong> {kyc.emailHash}</p>}
          {kyc.mobileHash && <p><strong>Mobile Hash:</strong> {kyc.mobileHash}</p>}
          {kyc.signature && <p><strong>Signature:</strong> {kyc.signature}</p>}
          {kyc.photo && <div><strong>Photo:</strong><br /><img src={`data:image/jpeg;base64,${kyc.photo}`} alt="Aadhaar" style={{maxWidth: 200}} /></div>}
          {kyc.address && (
            <div>
              <strong>Address:</strong>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {kyc.address.co && <li><strong>C/O:</strong> {kyc.address.co}</li>}
                {kyc.address.house && <li><strong>House:</strong> {kyc.address.house}</li>}
                {kyc.address.street && <li><strong>Street:</strong> {kyc.address.street}</li>}
                {kyc.address.landmark && <li><strong>Landmark:</strong> {kyc.address.landmark}</li>}
                {kyc.address.location && <li><strong>Location:</strong> {kyc.address.location}</li>}
                {kyc.address.vtc && <li><strong>VTC:</strong> {kyc.address.vtc}</li>}
                {kyc.address.po && <li><strong>PO:</strong> {kyc.address.po}</li>}
                {kyc.address.district && <li><strong>District:</strong> {kyc.address.district}</li>}
                {kyc.address.subdist && <li><strong>Subdist:</strong> {kyc.address.subdist}</li>}
                {kyc.address.state && <li><strong>State:</strong> {kyc.address.state}</li>}
                {kyc.address.pincode && <li><strong>Pincode:</strong> {kyc.address.pincode}</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AadhaarQrDecoder;
