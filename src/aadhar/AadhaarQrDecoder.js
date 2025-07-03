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

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '30px',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
    },
    uploadCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '30px',
      border: '1px solid #e0e0e0'
    },
    fileInputContainer: {
      position: 'relative',
      marginBottom: '20px'
    },
    fileInput: {
      width: '100%',
      padding: '12px',
      border: '2px dashed #4CAF50',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    fileInputHover: {
      backgroundColor: '#e8f5e8',
      borderColor: '#45a049'
    },
    uploadButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '12px 30px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    uploadButtonDisabled: {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#e3f2fd',
      borderRadius: '8px',
      margin: '20px 0',
      border: '1px solid #bbdefb'
    },
    loadingText: {
      color: '#1976d2',
      fontSize: '16px',
      fontWeight: 'bold'
    },
    errorContainer: {
      backgroundColor: '#ffebee',
      border: '1px solid #f44336',
      borderRadius: '8px',
      padding: '15px',
      margin: '20px 0',
      color: '#c62828',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    resultCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '25px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      border: '1px solid #e0e0e0'
    },
    resultHeader: {
      color: '#2e7d32',
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
      borderBottom: '3px solid #4CAF50',
      paddingBottom: '10px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #f0f0f0'
    },
    infoLabel: {
      fontWeight: 'bold',
      color: '#555',
      minWidth: '120px'
    },
    infoValue: {
      color: '#333',
      flex: 1,
      marginLeft: '15px'
    },
    photoContainer: {
      textAlign: 'center',
      margin: '20px 0',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    },
    photo: {
      maxWidth: '200px',
      maxHeight: '200px',
      border: '3px solid #4CAF50',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    addressCard: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '15px'
    },
    addressHeader: {
      fontWeight: 'bold',
      color: '#495057',
      fontSize: '1.2rem',
      marginBottom: '15px',
      borderBottom: '2px solid #6c757d',
      paddingBottom: '5px'
    },
    addressList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    addressItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #e9ecef'
    },
    addressLabel: {
      fontWeight: 'bold',
      color: '#6c757d',
      minWidth: '100px'
    },
    addressValue: {
      color: '#495057',
      flex: 1,
      marginLeft: '15px'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🔍 Aadhaar QR Scanner</h1>
      
      <div style={styles.uploadCard}>
        <div style={styles.fileInputContainer}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={onFileChange}
            style={styles.fileInput}
          />
        </div>
        
        <button 
          onClick={onUpload} 
          disabled={loading || !selectedFile}
          style={{
            ...styles.uploadButton,
            ...(loading || !selectedFile ? styles.uploadButtonDisabled : {})
          }}
          onMouseEnter={(e) => {
            if (!loading && selectedFile) {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && selectedFile) {
              e.target.style.backgroundColor = '#4CAF50';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? '🔄 Processing...' : '📤 Upload & Decode'}
        </button>
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>🔄 Processing image and decoding QR...</p>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer}>
          ❌ {error}
        </div>
      )}

      {kyc && (
        <div style={styles.resultCard}>
          <h2 style={styles.resultHeader}>✅ Aadhaar Information</h2>
          
          {kyc.referenceId && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Reference ID:</span>
              <span style={styles.infoValue}>{kyc.referenceId}</span>
            </div>
          )}
          
          {kyc.name && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Name:</span>
              <span style={styles.infoValue}>{kyc.name}</span>
            </div>
          )}
          
          {kyc.dob && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Date of Birth:</span>
              <span style={styles.infoValue}>{kyc.dob}</span>
            </div>
          )}
          
          {kyc.gender && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Gender:</span>
              <span style={styles.infoValue}>{kyc.gender}</span>
            </div>
          )}
          
          {kyc.mobileHash && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Mobile Hash:</span>
              <span style={styles.infoValue}>{kyc.mobileHash}</span>
            </div>
          )}
          
          {kyc.photo && (
            <div style={styles.photoContainer}>
              <h3 style={{margin: '0 0 15px 0', color: '#555'}}>📸 Photo</h3>
              <img 
                src={`data:image/jpeg;base64,${kyc.photo}`} 
                alt="Aadhaar Photo" 
                style={styles.photo}
              />
            </div>
          )}
          
          {kyc.address && (
            <div style={styles.addressCard}>
              <h3 style={styles.addressHeader}>🏠 Address Information</h3>
              <ul style={styles.addressList}>
                {kyc.address.co && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>C/O:</span>
                    <span style={styles.addressValue}>{kyc.address.co}</span>
                  </li>
                )}
                {kyc.address.house && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>House:</span>
                    <span style={styles.addressValue}>{kyc.address.house}</span>
                  </li>
                )}
                {kyc.address.street && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>Street:</span>
                    <span style={styles.addressValue}>{kyc.address.street}</span>
                  </li>
                )}
                {kyc.address.landmark && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>Landmark:</span>
                    <span style={styles.addressValue}>{kyc.address.landmark}</span>
                  </li>
                )}
                {kyc.address.location && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>Location:</span>
                    <span style={styles.addressValue}>{kyc.address.location}</span>
                  </li>
                )}
                {kyc.address.vtc && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>VTC:</span>
                    <span style={styles.addressValue}>{kyc.address.vtc}</span>
                  </li>
                )}
                {kyc.address.po && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>PO:</span>
                    <span style={styles.addressValue}>{kyc.address.po}</span>
                  </li>
                )}
                {kyc.address.district && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>District:</span>
                    <span style={styles.addressValue}>{kyc.address.district}</span>
                  </li>
                )}
                {kyc.address.subdist && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>Subdist:</span>
                    <span style={styles.addressValue}>{kyc.address.subdist}</span>
                  </li>
                )}
                {kyc.address.state && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>State:</span>
                    <span style={styles.addressValue}>{kyc.address.state}</span>
                  </li>
                )}
                {kyc.address.pincode && (
                  <li style={styles.addressItem}>
                    <span style={styles.addressLabel}>Pincode:</span>
                    <span style={styles.addressValue}>{kyc.address.pincode}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AadhaarQrDecoder;
