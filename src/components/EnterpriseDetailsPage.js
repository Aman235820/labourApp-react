import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Container } from 'react-bootstrap';
import EnterpriseDetailsForm from './EnterpriseDetailsForm';
import { enterpriseService } from '../services/enterpriseService';
import '../styles/EnterpriseDetailsForm.css';

function EnterpriseDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    // Get initial registration data from navigation state or localStorage
    const registrationData = location.state?.registrationData || 
                            JSON.parse(localStorage.getItem('pendingEnterpriseRegistration') || '{}');
    
    if (!registrationData.ownerContactInfo) {
      // If no initial data, redirect to registration
      navigate('/enterpriseRegister');
      return;
    }

    setInitialData(registrationData);
  }, [location.state, navigate]);

  const handleSubmit = async (completeData) => {
    setIsLoading(true);
    setError('');

    try {
      // Combine initial registration data with complete details
      const finalData = {
        ...initialData,
        ...completeData
      };

      // Get OTP from initial registration or request new one
      const storedOTP = localStorage.getItem('enterpriseOTP');
      
      let response;
      if (storedOTP) {
        // Complete registration with stored OTP
        response = await enterpriseService.completeRegistration(finalData, storedOTP);
      } else {
        // Fallback to regular registration
        response = await enterpriseService.registerEnterprise(finalData, '');
      }

      if (response && response.token && response.returnValue) {
        // Store enterprise data
        localStorage.setItem('enterprise', JSON.stringify({ 
          ...response.returnValue, 
          token: response.token 
        }));
        
        // Clean up temporary storage
        localStorage.removeItem('pendingEnterpriseRegistration');
        localStorage.removeItem('enterpriseOTP');
        
        // Navigate to dashboard
        navigate('/enterpriseDashboard');
      } else {
        setError('Registration completion failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration completion error:', err);
      setError(typeof err === 'string' ? err : 'Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialData.ownerContactInfo) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Loading registration data...
        </Alert>
      </Container>
    );
  }

  return (
    <div>
      {error && (
        <Container>
          <Alert variant="danger" className="mt-3" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        </Container>
      )}
      <EnterpriseDetailsForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

export default EnterpriseDetailsPage;
