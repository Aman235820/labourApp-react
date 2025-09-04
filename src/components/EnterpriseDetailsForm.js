import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Tab, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { 
  FaUser, 
  FaBuilding, 
  FaFileUpload, 
  FaPhone, 
  FaUsers, 
  FaIdCard, 
  FaCheckCircle,
  FaChevronDown,
  FaCloudUploadAlt,
  FaExternalLinkAlt,
  FaRupeeSign
} from 'react-icons/fa';
import '../styles/EnterpriseDetailsForm.css';

function EnterpriseDetailsForm({ initialData, onSubmit, isLoading }) {
  const [activeTab, setActiveTab] = useState('owner');
  const [formData, setFormData] = useState({
    ownername: '',
    otherContactNumbers: [''],
    gstNumber: '',
    workforceSize: '',
    registrationCertificateLink: '',
    otherDocumentLinks: {
      license: '',
      insurance: ''
    },
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tabs, setTabs] = useState([
    { key: 'owner', label: 'Owner Details', icon: FaUser, completed: false },
    { key: 'business', label: 'Business Details', icon: FaBuilding, completed: false },
    { key: 'documents', label: 'Documents', icon: FaFileUpload, completed: false },
    { key: 'review', label: 'Review & Submit', icon: FaCheckCircle, completed: false }
  ]);

  useEffect(() => {
    // Mark tabs as completed based on form data
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      completed: isTabCompleted(tab.key)
    }));
    setTabs(updatedTabs);
  }, [formData]);

  const isTabCompleted = (tabKey) => {
    switch (tabKey) {
      case 'owner':
        return formData.ownername.trim() !== '';
      case 'business':
        return formData.gstNumber.trim() !== '' && formData.workforceSize !== '';
      case 'documents':
        return formData.registrationCertificateLink.trim() !== '';
      case 'review':
        return isTabCompleted('owner') && isTabCompleted('business') && isTabCompleted('documents');
      default:
        return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
    const newNumbers = formData.otherContactNumbers.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      otherContactNumbers: newNumbers.length > 0 ? newNumbers : ['']
    }));
  };

  const handleDocumentLinkChange = (docType, value) => {
    setFormData(prev => ({
      ...prev,
      otherDocumentLinks: {
        ...prev.otherDocumentLinks,
        [docType]: value
      }
    }));
  };

  const validateCurrentTab = () => {
    const newErrors = {};

    switch (activeTab) {
      case 'owner':
        if (!formData.ownername.trim()) {
          newErrors.ownername = 'Owner name is required';
        }
        break;
      
      case 'business':
        if (!formData.gstNumber.trim()) {
          newErrors.gstNumber = 'GST Number is required';
        } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
          newErrors.gstNumber = 'Please enter a valid GST number';
        }
        
        if (!formData.workforceSize || formData.workforceSize < 1) {
          newErrors.workforceSize = 'Workforce size must be at least 1';
        }
        break;
        
      case 'documents':
        if (!formData.registrationCertificateLink.trim()) {
          newErrors.registrationCertificateLink = 'Registration certificate link is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentTab()) {
      const currentIndex = tabs.findIndex(tab => tab.key === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].key);
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex(tab => tab.key === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].key);
    }
  };

  const handleSubmit = () => {
    if (validateCurrentTab() && isTabCompleted('owner') && isTabCompleted('business') && isTabCompleted('documents')) {
      // Clean up the data before submission
      const cleanedData = {
        ...formData,
        otherContactNumbers: formData.otherContactNumbers.filter(num => num.trim() !== ''),
        workforceSize: parseInt(formData.workforceSize)
      };
      onSubmit(cleanedData);
    }
  };

  const currentTabIndex = tabs.findIndex(tab => tab.key === activeTab);
  const currentTab = tabs[currentTabIndex];

  return (
    <div className="enterprise-details-container">
      {/* Header with dropdown navigation */}
      <div className="enterprise-details-header">
        <Container>
          <Row>
            <Col>
              <div className="header-content">
                <div className="header-left">
                  <h4 className="mb-1">Enterprise Registration</h4>
                  <p className="text-muted mb-0">Complete your business profile</p>
                </div>
                <div className="header-right">
                  <div className="tab-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <div className="current-tab">
                      <currentTab.icon className="me-2" />
                      <span>{currentTab.label}</span>
                      <FaChevronDown className={`ms-2 ${isDropdownOpen ? 'rotated' : ''}`} />
                    </div>
                    {isDropdownOpen && (
                      <div className="dropdown-menu">
                        {tabs.map((tab, index) => (
                          <div 
                            key={tab.key}
                            className={`dropdown-item ${activeTab === tab.key ? 'active' : ''} ${tab.completed ? 'completed' : ''}`}
                            onClick={() => {
                              setActiveTab(tab.key);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <tab.icon className="me-2" />
                            <span>{tab.label}</span>
                            {tab.completed && <FaCheckCircle className="ms-auto text-success" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="progress-indicator">
                    <span>{currentTabIndex + 1} of {tabs.length}</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main content */}
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="enterprise-details-card">
              <Card.Body>
                {/* Owner Details Tab */}
                {activeTab === 'owner' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <FaUser className="tab-icon" />
                      <div>
                        <h5>Owner Details</h5>
                        <p className="text-muted mb-0">Provide information about the business owner</p>
                      </div>
                    </div>

                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Owner Name *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter owner's full name"
                              value={formData.ownername}
                              onChange={(e) => handleInputChange('ownername', e.target.value)}
                              isInvalid={!!errors.ownername}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.ownername}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Primary Contact</Form.Label>
                            <InputGroup>
                              <InputGroup.Text><FaPhone /></InputGroup.Text>
                              <Form.Control
                                type="text"
                                value={formData.ownerContactInfo || ''}
                                disabled
                                className="bg-light"
                              />
                            </InputGroup>
                            <Form.Text className="text-muted">
                              This is your registered mobile number
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Additional Contact Numbers</Form.Label>
                        {formData.otherContactNumbers.map((number, index) => (
                          <div key={index} className="mb-2">
                            <InputGroup>
                              <InputGroup.Text><FaPhone /></InputGroup.Text>
                              <Form.Control
                                type="text"
                                placeholder="Enter additional contact number"
                                value={number}
                                onChange={(e) => handleContactNumberChange(index, e.target.value)}
                              />
                              {formData.otherContactNumbers.length > 1 && (
                                <Button 
                                  variant="outline-danger" 
                                  onClick={() => removeContactNumber(index)}
                                >
                                  Remove
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
                          + Add Another Number
                        </Button>
                      </Form.Group>
                    </Form>
                  </div>
                )}

                {/* Business Details Tab */}
                {activeTab === 'business' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <FaBuilding className="tab-icon" />
                      <div>
                        <h5>Business Details</h5>
                        <p className="text-muted mb-0">Business registration and operational information</p>
                      </div>
                    </div>

                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Company Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.companyName || ''}
                              disabled
                              className="bg-light"
                            />
                            <Form.Text className="text-muted">
                              Registered during initial setup
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.location || ''}
                              disabled
                              className="bg-light"
                            />
                            <Form.Text className="text-muted">
                              Business location
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>GST Number *</Form.Label>
                            <InputGroup>
                              <InputGroup.Text><FaIdCard /></InputGroup.Text>
                              <Form.Control
                                type="text"
                                placeholder="27AABCU9603R123"
                                value={formData.gstNumber}
                                onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                                isInvalid={!!errors.gstNumber}
                              />
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">
                              {errors.gstNumber}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Workforce Size *</Form.Label>
                            <InputGroup>
                              <InputGroup.Text><FaUsers /></InputGroup.Text>
                              <Form.Control
                                type="number"
                                placeholder="15"
                                min="1"
                                value={formData.workforceSize}
                                onChange={(e) => handleInputChange('workforceSize', e.target.value)}
                                isInvalid={!!errors.workforceSize}
                              />
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">
                              {errors.workforceSize}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Services Offered</Form.Label>
                        <div className="services-display">
                          {formData.servicesOffered && Object.keys(formData.servicesOffered).length > 0 ? (
                            Object.entries(formData.servicesOffered).map(([category, services]) => (
                              <div key={category} className="service-category mb-2">
                                <div className="fw-semibold text-primary">{category}</div>
                                <div className="ms-3">
                                  {services.map((service, index) => (
                                    <div key={index} className="text-muted small">• {service}</div>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted">No services selected</p>
                          )}
                        </div>
                        <Form.Text className="text-muted">
                          Services were selected during initial registration
                        </Form.Text>
                      </Form.Group>
                    </Form>
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <FaFileUpload className="tab-icon" />
                      <div>
                        <h5>Document Links</h5>
                        <p className="text-muted mb-0">Provide links to your business documents</p>
                      </div>
                    </div>

                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Registration Certificate Link *</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaCloudUploadAlt /></InputGroup.Text>
                          <Form.Control
                            type="url"
                            placeholder="https://example.com/certificate1.pdf"
                            value={formData.registrationCertificateLink}
                            onChange={(e) => handleInputChange('registrationCertificateLink', e.target.value)}
                            isInvalid={!!errors.registrationCertificateLink}
                          />
                          {formData.registrationCertificateLink && (
                            <Button variant="outline-secondary" onClick={() => window.open(formData.registrationCertificateLink, '_blank')}>
                              <FaExternalLinkAlt />
                            </Button>
                          )}
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                          {errors.registrationCertificateLink}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Business License Link</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaCloudUploadAlt /></InputGroup.Text>
                          <Form.Control
                            type="url"
                            placeholder="https://example.com/license1.pdf"
                            value={formData.otherDocumentLinks.license}
                            onChange={(e) => handleDocumentLinkChange('license', e.target.value)}
                          />
                          {formData.otherDocumentLinks.license && (
                            <Button variant="outline-secondary" onClick={() => window.open(formData.otherDocumentLinks.license, '_blank')}>
                              <FaExternalLinkAlt />
                            </Button>
                          )}
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Insurance Certificate Link</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><FaCloudUploadAlt /></InputGroup.Text>
                          <Form.Control
                            type="url"
                            placeholder="https://example.com/insurance1.pdf"
                            value={formData.otherDocumentLinks.insurance}
                            onChange={(e) => handleDocumentLinkChange('insurance', e.target.value)}
                          />
                          {formData.otherDocumentLinks.insurance && (
                            <Button variant="outline-secondary" onClick={() => window.open(formData.otherDocumentLinks.insurance, '_blank')}>
                              <FaExternalLinkAlt />
                            </Button>
                          )}
                        </InputGroup>
                      </Form.Group>

                      <Alert variant="info" className="mt-3">
                        <strong>Note:</strong> Please ensure all document links are publicly accessible and contain valid business documents.
                      </Alert>
                    </Form>
                  </div>
                )}

                {/* Review Tab */}
                {activeTab === 'review' && (
                  <div className="tab-content">
                    <div className="tab-header">
                      <FaCheckCircle className="tab-icon" />
                      <div>
                        <h5>Review & Submit</h5>
                        <p className="text-muted mb-0">Review all information before submitting</p>
                      </div>
                    </div>

                    <div className="review-sections">
                      {/* Owner Information */}
                      <div className="review-section">
                        <h6 className="section-title">Owner Information</h6>
                        <Row>
                          <Col md={6}>
                            <div className="review-item">
                              <label>Owner Name</label>
                              <div>{formData.ownername}</div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="review-item">
                              <label>Primary Contact</label>
                              <div>{formData.ownerContactInfo}</div>
                            </div>
                          </Col>
                        </Row>
                        {formData.otherContactNumbers.filter(num => num.trim()).length > 0 && (
                          <div className="review-item">
                            <label>Additional Contacts</label>
                            <div>{formData.otherContactNumbers.filter(num => num.trim()).join(', ')}</div>
                          </div>
                        )}
                      </div>

                      {/* Business Information */}
                      <div className="review-section">
                        <h6 className="section-title">Business Information</h6>
                        <Row>
                          <Col md={6}>
                            <div className="review-item">
                              <label>Company Name</label>
                              <div>{formData.companyName}</div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="review-item">
                              <label>Location</label>
                              <div>{formData.location}</div>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <div className="review-item">
                              <label>GST Number</label>
                              <div>{formData.gstNumber}</div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="review-item">
                              <label>Workforce Size</label>
                              <div>{formData.workforceSize} employees</div>
                            </div>
                          </Col>
                        </Row>
                      </div>

                      {/* Documents */}
                      <div className="review-section">
                        <h6 className="section-title">Documents</h6>
                        <div className="review-item">
                          <label>Registration Certificate</label>
                          <div>
                            <a href={formData.registrationCertificateLink} target="_blank" rel="noopener noreferrer">
                              {formData.registrationCertificateLink} <FaExternalLinkAlt className="ms-1" />
                            </a>
                          </div>
                        </div>
                        {formData.otherDocumentLinks.license && (
                          <div className="review-item">
                            <label>Business License</label>
                            <div>
                              <a href={formData.otherDocumentLinks.license} target="_blank" rel="noopener noreferrer">
                                {formData.otherDocumentLinks.license} <FaExternalLinkAlt className="ms-1" />
                              </a>
                            </div>
                          </div>
                        )}
                        {formData.otherDocumentLinks.insurance && (
                          <div className="review-item">
                            <label>Insurance Certificate</label>
                            <div>
                              <a href={formData.otherDocumentLinks.insurance} target="_blank" rel="noopener noreferrer">
                                {formData.otherDocumentLinks.insurance} <FaExternalLinkAlt className="ms-1" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="navigation-buttons">
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handlePrevious}
                      disabled={currentTabIndex === 0}
                    >
                      Previous
                    </Button>
                    
                    {currentTabIndex < tabs.length - 1 ? (
                      <Button 
                        variant="primary" 
                        onClick={handleNext}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        variant="success" 
                        onClick={handleSubmit}
                        disabled={isLoading || !isTabCompleted('owner') || !isTabCompleted('business') || !isTabCompleted('documents')}
                      >
                        {isLoading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Submitting...
                          </>
                        ) : (
                          'Complete Registration'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default EnterpriseDetailsForm;
