import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LabourDetailsModal = ({ show, onHide, selectedLabour, service }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (show && selectedLabour) {
      // Debug logging to see what data we're receiving
      console.log('LabourDetailsModal - selectedLabour data:', selectedLabour);
      console.log('LabourDetailsModal - service:', service);
      console.log('LabourDetailsModal - Available ID fields:', {
        id: selectedLabour.id,
        labourId: selectedLabour.labourId,
        _id: selectedLabour._id
      });
      
      // Close the modal immediately and navigate to the details page
      onHide();
      const labourId = selectedLabour.id || selectedLabour.labourId || selectedLabour._id || 'unknown';
      console.log('LabourDetailsModal - Navigating to:', `/labour-details/${labourId}`);
      navigate(`/labour-details/${labourId}`, {
        state: { searchCategory: service }
      });
    }
  }, [show, selectedLabour, service, onHide, navigate]);

  // This component now just handles the redirect, no UI needed
  return null;
};

export default LabourDetailsModal; 