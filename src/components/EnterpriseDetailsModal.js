import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { 
  FaUser, 
  FaBuilding, 
  FaPhone, 
  FaIdCard, 
  FaCheckCircle,
  FaTimes,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import { enterpriseService } from '../services/enterpriseService';
import '../styles/EnterpriseDetailsModal.css';

function EnterpriseDetailsModal({ show, onHide, enterprise, enterpriseId, onUpdate }) {
  const [formData, setFormData] = useState({
    ownername: '',
    otherContactNumbers: [''],
    gstNumber: '',
    workforceSize: '',
    registrationCertificateLink: '',
    otherDocumentLinks: {
      license: '',
      insurance: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (enterprise) {
      setFormData({
        ownername: enterprise.ownername || enterprise.returnValue?.ownername || '',
        otherContactNumbers: enterprise.otherContactNumbers || enterprise.returnValue?.otherContactNumbers || [''],
        gstNumber: enterprise.gstNumber || enterprise.returnValue?.gstNumber || '',
        workforceSize: enterprise.workforceSize || enterprise.returnValue?.workforceSize || '',
        registrationCertificateLink: enterprise.registrationCertificateLink || enterprise.returnValue?.registrationCertificateLink || '',
        otherDocumentLinks: {
          license: enterprise.otherDocumentLinks?.license || enterprise.returnValue?.otherDocumentLinks?.license || '',
          insurance: enterprise.otherDocumentLinks?.insurance || enterprise.returnValue?.otherDocumentLinks?.insurance || ''
        }
      });
    }
  }, [enterprise]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleContactNumberChange = (index, value) => {
    const newNumbers = [...formData.otherContactNumbers];
    newNumbers[index] = value;
    setFormData(prev => ({
      ...prev,
      otherContactNumbers: newNumbers
    }));
  };

  const addContactNumber = () => {
    setFormData(prev => ({
      ...prev,
      otherContactNumbers: [...prev.otherContactNumbers, '']
    }));
  };

  const removeContactNumber = (index) => {
    if (formData.otherContactNumbers.length > 1) {
      const newNumbers = formData.otherContactNumbers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        otherContactNumbers: newNumbers
      }));
    }
    // Always keep at least one input box - don't remove if only one left
  };

  const handleDocumentLinkChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      otherDocumentLinks: {
        ...prev.otherDocumentLinks,
        [type]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ownername || formData.ownername.trim().length < 2) {
      newErrors.ownername = 'Owner name must be at least 2 characters';
    }

    if (!formData.workforceSize || isNaN(formData.workforceSize) || parseInt(formData.workforceSize) < 1) {
      newErrors.workforceSize = 'Workforce size must be a valid number greater than 0';
    }

    // No validation for contact numbers - they are optional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      // Use the enterpriseId passed from parent component
      const token = enterprise?.token || '';

      const enterpriseId = enterprise?.id || '';

      if (!enterpriseId) {
        console.error('Modal - Missing enterpriseId:', { enterpriseId });
        throw new Error('Enterprise session not found');
      }

      // Filter out empty contact numbers, but allow empty array if no numbers provided
      const cleanedContactNumbers = formData.otherContactNumbers.filter(num => num && num.trim());

      const updateData = {
        ownername: formData.ownername.trim(),
        otherContactNumbers: cleanedContactNumbers,
        workforceSize: parseInt(formData.workforceSize)
      };

      await enterpriseService.updateEnterpriseFields(enterpriseId, updateData, token);

      setSuccess('Details updated successfully!');
      
      // Update the enterprise data in localStorage
      const updatedEnterprise = {
        ...enterprise,
        ...updateData
      };
      localStorage.setItem('enterprise', JSON.stringify(updatedEnterprise));

      // Call the onUpdate callback to refresh the parent component
      if (onUpdate) {
        onUpdate(updatedEnterprise);
      }

      // Close modal after a short delay
      setTimeout(() => {
        onHide();
      }, 1500);

    } catch (err) {
      console.error('Update error:', err);
      setError(typeof err === 'string' ? err : 'Failed to update details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="enterprise-details-modal">
      <Modal.Header className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <FaBuilding className="me-2" />
          Complete Your Business Profile
        </Modal.Title>
        <Button
          variant="link"
          onClick={onHide}
          className="text-white p-0 ms-auto"
          style={{ fontSize: '1.5rem' }}
        >
          <FaTimes />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <div className="text-center mb-4">
          <p className="text-muted">Please provide some additional details about your business to complete your profile.</p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            <FaTimes className="me-2" />
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-3">
            <FaCheckCircle className="me-2" />
            {success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Owner Name */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  <FaUser className="me-2 text-primary" />
                  Owner Name *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.ownername}
                  onChange={(e) => handleInputChange('ownername', e.target.value)}
                  placeholder="Enter owner name"
                  isInvalid={!!errors.ownername}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ownername}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Workforce Size */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  <FaBuilding className="me-2 text-primary" />
                  Workforce Size *
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData.workforceSize}
                  onChange={(e) => handleInputChange('workforceSize', e.target.value)}
                  placeholder="Enter workforce size"
                  min="1"
                  isInvalid={!!errors.workforceSize}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.workforceSize}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Additional Contact Numbers */}
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  <FaPhone className="me-2 text-primary" />
                  Additional Contact Numbers
                </Form.Label>
                <Form.Text className="text-muted mb-3">
                  Optional: Add additional contact numbers for your business
                </Form.Text>
                {formData.otherContactNumbers.map((number, index) => (
                  <div key={index} className="mb-2">
                    <InputGroup>
                      <InputGroup.Text><FaPhone /></InputGroup.Text>
                      <Form.Control
                        type="tel"
                        placeholder="Enter 10-digit contact number"
                        value={number}
                        onChange={(e) => handleContactNumberChange(index, e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                      />
                      {formData.otherContactNumbers.length > 1 && (
                        <Button 
                          variant="outline-danger" 
                          onClick={() => removeContactNumber(index)}
                          title="Remove this contact number"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </InputGroup>
                  </div>
                ))}
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={addContactNumber}
                  className="mt-2"
                >
                  <FaPlus className="me-1" />
                  Add Another Number
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      
      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" onClick={handleSkip}>
          Skip for Now
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Updating...
            </>
          ) : (
            <>
              <FaCheckCircle className="me-2" />
              Update Details
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EnterpriseDetailsModal;
