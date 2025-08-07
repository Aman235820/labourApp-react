import { useEffect } from 'react';
import '../styles/LabourDetailsModal.css';
import { useNavigate } from 'react-router-dom';

const LabourDetailsModal = ({ show, onHide, selectedLabour, service }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (show && selectedLabour) {
      // Close the modal immediately and navigate to the details page
      onHide();
      const labourId = selectedLabour.id || selectedLabour.labourId || selectedLabour._id || 'unknown';
      navigate(`/labour-details/${labourId}`, {
        state: { searchCategory: service }
      });
    }
  }, [show, selectedLabour, service, onHide, navigate]);

  // This component now just handles the redirect, no UI needed
  return null;
};

export default LabourDetailsModal; 